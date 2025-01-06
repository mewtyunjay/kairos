import { useEffect, useState } from 'react';

interface TimerPillProps {
  duration: number;
  isRunning: boolean;
  timeRemaining?: number;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
}

export default function TimerPill({ duration, isRunning, timeRemaining, onStart, onPause, onStop }: TimerPillProps) {
  const [isPaused, setIsPaused] = useState(false);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTimeSeconds = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePauseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(!isPaused);
    onPause();
  };

  const handleStopClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(false);
    onStop();
  };

  const handleStartClick = () => {
    if (timeRemaining === undefined) {
      setIsPaused(false);
      onStart();
    }
  };

  useEffect(() => {
    if (!isRunning && timeRemaining === undefined) {
      setIsPaused(false);
    }
  }, [isRunning, timeRemaining]);

  const isActive = timeRemaining !== undefined;
  const showPauseIcon = isRunning && !isPaused;

  return (
    <div className={`relative group ${isActive ? 'w-48' : 'w-auto'}`}>
      <div
        onClick={handleStartClick}
        className={`px-3 py-1 rounded-full cursor-pointer ${
          isActive
            ? isPaused
              ? 'bg-yellow-500/20 text-yellow-400'
              : isRunning
                ? 'bg-green-500/20 text-green-400'
                : 'bg-blue-500/20 text-blue-400'
            : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
        }`}
      >
        {isActive ? (
          <div className="flex items-center justify-between">
            <span>{formatTimeSeconds(timeRemaining || 0)}</span>
            <div className="flex gap-2">
              <div
                onClick={handlePauseClick}
                className={`p-1 rounded-full cursor-pointer ${
                  showPauseIcon ? 'hover:bg-green-500/30' : 'hover:bg-yellow-500/30'
                }`}
              >
                {showPauseIcon ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div
                onClick={handleStopClick}
                className="p-1 rounded-full hover:bg-red-500/30 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          formatTime(duration)
        )}
      </div>
    </div>
  );
} 