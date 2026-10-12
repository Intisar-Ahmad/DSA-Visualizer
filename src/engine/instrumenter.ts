import * as acorn from 'acorn';
import { generate } from 'astring';

export function instrumentCode(code: string): string {
  const ast = acorn.parse(code, { ecmaVersion: 2022, locations: true });

  // 1. PRE-PASS: Normalize single-statement blocks into true BlockStatements
  // This ensures things like `if (n === 0) return 1;` can be stepped through line-by-line!
  const normalizeBlocks = (node: any) => {
    if (!node || typeof node !== 'object') return;
    for (const key in node) {
      if (key === 'loc') continue;
      if (node[key] && typeof node[key] === 'object') {
        if (node.type === 'IfStatement') {
          if (node.consequent && node.consequent.type !== 'BlockStatement') {
            node.consequent = { type: 'BlockStatement', body: [node.consequent] };
          }
          if (node.alternate && node.alternate.type !== 'IfStatement' && node.alternate.type !== 'BlockStatement') {
            node.alternate = { type: 'BlockStatement', body: [node.alternate] };
          }
        }
        if (['WhileStatement', 'ForStatement', 'ForInStatement', 'ForOfStatement'].includes(node.type)) {
          if (node.body && node.body.type !== 'BlockStatement') {
            node.body = { type: 'BlockStatement', body: [node.body] };
          }
        }
        if (node.type === 'ArrowFunctionExpression' && node.body.type !== 'BlockStatement') {
          node.body = {
            type: 'BlockStatement',
            body: [{ type: 'ReturnStatement', argument: node.body }]
          };
        }
        normalizeBlocks(node[key]);
      }
    }
  };
  normalizeBlocks(ast);

  const visited = new WeakSet();

  const walk = (node: any, currentClass = '') => {
    if (!node || typeof node !== 'object') return;
    if (visited.has(node)) return;
    visited.add(node);

    let nextClass = currentClass;
    if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
      nextClass = node.id ? node.id.name : 'AnonymousClass';
    }

    if (node.type === 'MethodDefinition' && node.value?.type === 'FunctionExpression') {
      const methodName = node.key?.name || 'method';
      node.value.__functionName = node.kind === 'constructor' ? nextClass : `${nextClass}.${methodName}`;
    }

    // 2. Track Function Calls
    if (['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type)) {
      const funcName = node.__functionName || (node.id ? node.id.name : 'anonymous');
      const lineNum = node.loc?.start?.line || 0;

      if (node.body && node.body.type === 'BlockStatement') {
        const originalBody = node.body.body;

        const paramInjectors = (node.params || []).map((param: any) => {
          if (param.type === 'Identifier') {
            const pNode = {
              type: 'ExpressionStatement',
              expression: {
                type: 'CallExpression',
                callee: { type: 'Identifier', name: '__setVar' },
                arguments: [
                  { type: 'Literal', value: param.name },
                  { type: 'Identifier', name: param.name },
                  { type: 'Literal', value: lineNum }
                ]
              }
            };
            visited.add(pNode);
            return pNode;
          }
          return null;
        }).filter(Boolean);

        // Map parameters to an array of [name, value] arrays so the engine knows what they are called!
        const paramPairs = (node.params || [])
          .filter((p: any) => p.type === 'Identifier')
          .map((p: any) => ({
            type: 'ArrayExpression',
            elements: [
              { type: 'Literal', value: p.name },
              { type: 'Identifier', name: p.name }
            ]
          }));

        const pushFrameNode = {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: '__pushFrame' },
            arguments: [
              { type: 'Literal', value: funcName },
              { type: 'Literal', value: lineNum },
              { type: 'ArrayExpression', elements: paramPairs }
            ]
          }
        };
        visited.add(pushFrameNode);

        const popFrameNode = {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: '__popFrame' },
            arguments: [{ type: 'Literal', value: funcName }, { type: 'Literal', value: lineNum }]
          }
        };
        visited.add(popFrameNode);

        const tryStatement = {
          type: 'TryStatement',
          block: {
            type: 'BlockStatement',
            body: [...paramInjectors, ...originalBody]
          },
          handler: null,
          finalizer: {
            type: 'BlockStatement',
            body: [popFrameNode]
          }
        };
        visited.add(tryStatement);
        visited.add(tryStatement.block);
        visited.add(tryStatement.finalizer);

        node.body.body = [pushFrameNode, tryStatement];
      }
    }

    // 3. Track Return Statements
    if (node.type === 'ReturnStatement' && node.argument && !visited.has(node.argument)) {
      const lineNum = node.loc?.start?.line || 0;
      node.argument = {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: '__trackReturn' },
        arguments: [node.argument, { type: 'Literal', value: lineNum }]
      };
      visited.add(node.argument);
    }

    // 4. Track Variable Declarations
    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') {
      if (node.init) {
        const varName = node.id.name;
        const lineNum = node.loc?.start?.line || 0;
        
        node.init = {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: '__setVar' },
          arguments: [
            { type: 'Literal', value: varName },
            node.init,
            { type: 'Literal', value: lineNum }
          ]
        };
        visited.add(node.init);
      }
    }

    // 5. Track ALL Assignments (mutations)
    if (node.type === 'AssignmentExpression') {
      const lineNum = node.loc?.start?.line || 0;
      const originalAssign = { ...node };
      visited.add(originalAssign);

      node.type = 'CallExpression';
      node.callee = { type: 'Identifier', name: '__trackAssign' };
      node.arguments = [originalAssign, { type: 'Literal', value: lineNum }];
    }

    // 6. Inject Line Tracking before every statement
    if (node.type === 'BlockStatement' || node.type === 'Program') {
      const newBody: any[] = [];
      for (const statement of node.body) {
        if (!visited.has(statement) && statement.type !== 'FunctionDeclaration') {
          const lineNum = statement.loc?.start?.line || 0;
          const stepInjection = {
            type: 'ExpressionStatement',
            expression: {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: '__step' },
              arguments: [{ type: 'Literal', value: lineNum }]
            }
          };
          visited.add(stepInjection);
          newBody.push(stepInjection);
        }
        newBody.push(statement);
      }
      node.body = newBody;
    }

    for (const key in node) {
      if (key !== 'loc' && node[key] && typeof node[key] === 'object') {
        walk(node[key], nextClass);
      }
    }
  };

  walk(ast);
  return generate(ast);
}