import { useState, useEffect, useCallback } from 'react';

export function usePlayback<T>(initialFrames: T[] = [], defaultSpeed = 500) {
  const [frames, setFrames] = useState<T[]>(initialFrames);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(defaultSpeed);

  // Advance to the next frame automatically if playing
  useEffect(() => {
    // FIX: Using ReturnType instead of NodeJS.Timeout for browser compatibility
    let timer: ReturnType<typeof setTimeout>;
    
    if (isPlaying && currentIndex < frames.length - 1) {
      timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, speed);
    } else if (currentIndex >= frames.length - 1) {
      setIsPlaying(false);
    }
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, frames.length, speed]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  
  const stepForward = useCallback(() => {
    pause();
    setCurrentIndex(prev => Math.min(prev + 1, frames.length - 1));
  }, [frames.length, pause]);

  const stepBackward = useCallback(() => {
    pause();
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, [pause]);

  const seek = useCallback((index: number) => {
    pause();
    setCurrentIndex(Math.max(0, Math.min(index, frames.length - 1)));
  }, [frames.length, pause]);

  const loadFrames = useCallback((newFrames: T[]) => {
    pause();
    setFrames(newFrames);
    setCurrentIndex(0);
  }, [pause]);

  return {
    frames,
    currentFrame: frames[currentIndex] || null,
    currentIndex,
    totalFrames: frames.length,
    isPlaying,
    play,
    pause,
    stepForward,
    stepBackward,
    seek,
    loadFrames,
    speed,
    setSpeed
  };
}