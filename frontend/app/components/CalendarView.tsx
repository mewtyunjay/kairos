'use client'

import { useState, useEffect } from 'react';
import { SubTask, ScheduledTask } from '../types';

interface CalendarViewProps {
  onDrop: (taskId: string, hour: number, minute: number) => void;
  onTaskMove: (task: ScheduledTask, newHour: number, newMinute: number) => void;
  onTaskRemove: (task: ScheduledTask) => void;
  scheduledTasks: ScheduledTask[];
}

const CalendarView = ({ onDrop, onTaskMove, onTaskRemove, scheduledTasks }: CalendarViewProps) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];
  const [draggedOver, setDraggedOver] = useState<{hour: number, minute: number} | null>(null);
  const [draggedTask, setDraggedTask] = useState<ScheduledTask | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}${period}`;
  };

  const getTasksForSlot = (hour: number, minute: number) => {
    return scheduledTasks.filter(task => 
      task.startHour === hour && task.startMinute === minute
    );
  };

  const calculateSlotHeight = (duration: number) => {
    // Each 15 minutes is 5px (h-5 for 15-min slots)
    return (duration / 15) * 5;
  };

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return (hours * 20) + ((minutes / 15) * 5);
  };

  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  return (
    <div className="h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10">
        {/* Date row */}
        <div className="flex border-b border-zinc-800/50">
          {getDates().map((date, index) => (
            <div 
              key={date.toISOString()}
              className={`flex-1 p-4 text-center border-r border-zinc-800/30 ${
                index === 3 ? 'bg-blue-500/10' : ''
              }`}
            >
              <div className="text-sm text-zinc-400">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-medium ${index === 3 ? 'text-blue-400' : ''}`}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-b border-zinc-800/50">
          <h2 className="text-xl font-semibold">Today's Schedule</h2>
          <p className="text-sm text-zinc-400">Drag tasks to schedule them</p>
        </div>
      </div>
      
      <div className="relative pl-16">
        {/* Time labels */}
        <div className="absolute left-0 top-0 w-16 pt-4">
          {hours.map(hour => (
            <div key={hour} className="h-20 -mt-2.5">
              <span className="text-sm text-zinc-500">{formatHour(hour)}</span>
            </div>
          ))}
        </div>

        {/* Current time indicator */}
        <div 
          className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
          style={{ top: `${getCurrentTimePosition()}px` }}
        >
          <div className="absolute -left-4 -top-2 w-4 h-4 rounded-full bg-red-500" />
        </div>

        {/* Time slots */}
        <div className="space-y-px">
          {hours.map(hour => (
            <div key={hour} className="relative">
              {minutes.map(minute => {
                const tasks = getTasksForSlot(hour, minute);
                return (
                  <div
                    key={`${hour}-${minute}`}
                    className={`relative h-5 border-l-2 border-zinc-800/30 transition-colors ${
                      minute === 0 ? 'border-t border-zinc-800/50' : ''
                    } ${
                      draggedOver?.hour === hour && draggedOver?.minute === minute
                        ? 'bg-blue-500/10'
                        : 'hover:bg-zinc-800/30'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDraggedOver({ hour, minute });
                    }}
                    onDragLeave={() => setDraggedOver(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedTask) {
                        onTaskMove(draggedTask, hour, minute);
                      } else {
                        const taskId = e.dataTransfer.getData('text/plain');
                        onDrop(taskId, hour, minute);
                      }
                      setDraggedOver(null);
                      setDraggedTask(null);
                    }}
                  >
                    {tasks.map((task) => (
                      <div
                        key={`${task.taskIndex}-${task.subtaskIndex ?? 'full'}`}
                        className="absolute left-0 right-0 bg-blue-500/20 border border-blue-500/50 rounded-sm px-2 py-0.5 z-10 cursor-move group"
                        style={{
                          height: `${calculateSlotHeight(task.duration_minutes)}px`,
                        }}
                        draggable
                        onDragStart={(e) => {
                          setDraggedTask(task);
                          e.currentTarget.classList.add('opacity-50');
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.classList.remove('opacity-50');
                          setDraggedTask(null);
                        }}
                        onDoubleClick={() => onTaskRemove(task)}
                      >
                        <div className="truncate text-sm text-blue-400">
                          {task.name}
                        </div>
                        <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-blue-400/70 bg-blue-500/10 px-1 rounded">
                            {task.duration_minutes}m
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView; 