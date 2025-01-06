'use client'

import { useEffect, useState } from 'react'
import { TimerState } from '../types'

interface TimerProps {
  state: TimerState;
  onUpdate: (state: TimerState) => void;
  onComplete: (taskId: string, subtaskId?: string) => void;
}

export default function Timer({ state, onUpdate, onComplete }: TimerProps) {
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state.isRunning && !intervalId) {
      const id = setInterval(() => {
        onUpdate({
          ...state,
          timeRemaining: Math.max(0, state.timeRemaining - 1)
        });
      }, 1000);
      setIntervalId(id);
    } else if (!state.isRunning && intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.isRunning, intervalId]);

  useEffect(() => {
    if (state.timeRemaining === 0 && state.isRunning && state.taskId) {
      onUpdate({ ...state, isRunning: false });
      onComplete(state.taskId, state.subtaskId || undefined);
    }
  }, [state.timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 right-6 bg-zinc-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
      <div className="text-3xl font-mono mb-2">
        {formatTime(state.timeRemaining)}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onUpdate({ ...state, isRunning: !state.isRunning })}
          className={`px-4 py-2 rounded-xl ${
            state.isRunning
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          }`}
        >
          {state.isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={() => onUpdate({ ...state, isRunning: false, timeRemaining: 0 })}
          className="px-4 py-2 rounded-xl bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700"
        >
          Skip
        </button>
      </div>
    </div>
  );
} 