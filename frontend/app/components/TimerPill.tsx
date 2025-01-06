import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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
  const [isExpanded, setIsExpanded] = useState(false);

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
    setIsExpanded(false);
    onStop();
  };

  const handleStartClick = () => {
    setIsPaused(false);
    setIsExpanded(true);
    onStart();
  };

  const handlePillClick = () => {
    if (isRunning) {
      setIsExpanded(!isExpanded);
    } else {
      handleStartClick();
    }
  };

  // Update states based on running state
  useEffect(() => {
    if (!isRunning) {
      setIsPaused(false);
      setIsExpanded(false);
    }
  }, [isRunning]);

  const showPauseIcon = isRunning && !isPaused;

  return (
    <motion.div
      layout
      className={`relative group ${isExpanded ? 'w-40' : 'w-auto'}`}
    >
      <motion.div
        layout
        onClick={handlePillClick}
        className={`px-3 py-1 rounded-full cursor-pointer ${
          isRunning
            ? isPaused
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-green-500/20 text-green-400'
            : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
        }`}
      >
        {isRunning && isExpanded ? (
          <div className="flex items-center justify-between">
            <span>{formatTimeSeconds(timeRemaining || duration * 60)}</span>
            <div className="flex gap-1 ml-2">
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
          <div className="flex items-center">
            <span>{isRunning ? formatTimeSeconds(timeRemaining || duration * 60) : formatTime(duration)}</span>
            {isRunning && !isExpanded && (
              <svg className="w-4 h-4 ml-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
} 