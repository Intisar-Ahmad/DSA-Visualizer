import * as acorn from 'acorn';
import { generate } from 'astring';

export function instrumentCode(code: string): string {
  const ast = acorn.parse(code, { ecmaVersion: 2022, locations: true });
  const visited = new WeakSet();

  // We pass down currentClass to keep track of where we are in the AST
  const walk = (node: any, currentClass = '') => {
    if (!node || typeof node !== 'object') return;
    if (visited.has(node)) return;
    visited.add(node);

    // Track if we enter a class definition
    let nextClass = currentClass;
    if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
      nextClass = node.id ? node.id.name : 'AnonymousClass';
    }

    // If this is a method inside a class, label its inner function expression
    if (node.type === 'MethodDefinition' && node.value?.type === 'FunctionExpression') {
      const methodName = node.key?.name || 'method';
      // If it's a constructor, label it `ClassName`. Otherwise `ClassName.methodName`
      node.value.__functionName = node.kind === 'constructor' ? nextClass : `${nextClass}.${methodName}`;
    }

    // 2. Track Function Calls
    if (['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type)) {
      // Use our custom label, or fallback to the identifier/anonymous
      const funcName = node.__functionName || (node.id ? node.id.name : 'anonymous');
      const lineNum = node.loc?.start?.line || 0;

      if (node.body && node.body.type === 'BlockStatement') {
        const originalBody = node.body.body;

        // Capture parameters as local variables immediately
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

        const paramIdentifiers = (node.params || [])
          .filter((p: any) => p.type === 'Identifier')
          .map((p: any) => ({ type: 'Identifier', name: p.name }));

        const pushFrameNode = {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: '__pushFrame' },
            arguments: [
              { type: 'Literal', value: funcName },
              { type: 'Literal', value: lineNum },
              { type: 'ArrayExpression', elements: paramIdentifiers }
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

    // 3. Track Variable Declarations
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

    // 4. Track ALL Assignments (mutations)
    if (node.type === 'AssignmentExpression') {
      const lineNum = node.loc?.start?.line || 0;
      
      const originalAssign = { ...node };
      visited.add(originalAssign);

      node.type = 'CallExpression';
      node.callee = { type: 'Identifier', name: '__trackAssign' };
      node.arguments = [
        originalAssign,
        { type: 'Literal', value: lineNum }
      ];
    }

    // 5. Inject Line Tracking before every statement
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

    // Recursively walk through all child nodes in the tree
    for (const key in node) {
      if (key !== 'loc' && node[key] && typeof node[key] === 'object') {
        // Pass the nextClass down so nested methods know what class they belong to
        walk(node[key], nextClass);
      }
    }
  };

  walk(ast);
  return generate(ast);
}