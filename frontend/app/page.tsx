'use client'

import { useState, useEffect } from 'react'
import { default as Navbar } from './components/Navbar'
import TaskCard from './components/TaskCard'
import Timer from './components/Timer'
import { Task, TimerState } from './types'
import { v4 as uuidv4 } from 'uuid'
import { motion, AnimatePresence } from 'framer-motion'
import { config } from './config'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedPlanning, setHasStartedPlanning] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [timerState, setTimerState] = useState<TimerState>({
    taskId: null,
    subtaskId: null,
    startTime: null,
    timeRemaining: 0,
    isRunning: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !hasStartedPlanning && userInput.trim()) {
        e.preventDefault();
        handlePlanDay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userInput, hasStartedPlanning]);

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    const savedUserInput = localStorage.getItem('userInput');
    const savedHasStartedPlanning = localStorage.getItem('hasStartedPlanning');

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedUserInput) setUserInput(savedUserInput);
    if (savedHasStartedPlanning) setHasStartedPlanning(JSON.parse(savedHasStartedPlanning));
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('userInput', userInput);
    localStorage.setItem('hasStartedPlanning', JSON.stringify(hasStartedPlanning));
  }, [tasks, userInput, hasStartedPlanning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerState.isRunning && timerState.taskId) {
      interval = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1)
        }));

        setTasks(prev => prev.map(task => 
          task.id === timerState.taskId
            ? {
                ...task,
                timeRemaining: task.timeRemaining ? Math.max(0, task.timeRemaining - 1) : 0,
                subtasks: task.subtasks?.map(s => ({
                  ...s,
                  timeRemaining: s.id === timerState.subtaskId && s.timeRemaining 
                    ? Math.max(0, s.timeRemaining - 1)
                    : s.timeRemaining
                }))
              }
            : task
        ));
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerState.isRunning, timerState.taskId]);

  const handlePlanDay = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(`Failed to plan tasks: ${errorData.detail || 'Unknown error'}`);
      }

      const data = await response.json();
      if (!data.tasks) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response from server');
      }

      setTasks(data.tasks);
      setHasStartedPlanning(true);
    } catch (error) {
      console.error('Error planning tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const handleGenerateSubtasks = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/generate-subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: task.id,
          name: task.name,
          description: task.description,
          duration_minutes: task.duration_minutes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to generate subtasks: ${errorData.detail || 'Unknown error'}`);
      }

      const data = await response.json();
      
      setTasks(prev => prev.map(t => 
        t.id === taskId
          ? { ...t, subtasks: data.subtasks, hasSubtasks: true }
          : t
      ));
    } catch (error) {
      console.error('Error generating subtasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimerClick = (taskId: string, subtaskId?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = subtaskId && task.subtasks?.find(s => s.id === subtaskId);
    const duration = subtask ? subtask.duration_minutes : task.duration_minutes;

    if (task.isTimerRunning) {
      if (timerState.taskId === taskId && timerState.timeRemaining === 0) {
        setTimerState({
          taskId: null,
          subtaskId: null,
          startTime: null,
          timeRemaining: 0,
          isRunning: false
        });
        setTasks(prev => prev.map(t => 
          t.id === taskId
            ? {
                ...t,
                isTimerRunning: false,
                timeRemaining: duration * 60,
                subtasks: t.subtasks?.map(s => ({
                  ...s,
                  isTimerRunning: false,
                  timeRemaining: s.duration_minutes * 60
                }))
              }
            : t
        ));
      } else {
        setTimerState(prev => ({
          ...prev,
          isRunning: !prev.isRunning
        }));
      }
    } else {
      setTimerState({
        taskId,
        subtaskId: subtaskId || null,
        startTime: Date.now(),
        timeRemaining: duration * 60,
        isRunning: true
      });

      setTasks(prev => prev.map(t => 
        t.id === taskId
          ? {
              ...t,
              isTimerRunning: true,
              timeRemaining: duration * 60,
              subtasks: t.subtasks?.map(s => ({
                ...s,
                isTimerRunning: s.id === subtaskId,
                timeRemaining: s.duration_minutes * 60
              }))
            }
          : t
      ));
    }
  };

  const handleTimerComplete = (taskId: string, subtaskId?: string) => {
    setTimerState({
      taskId: null,
      subtaskId: null,
      startTime: null,
      timeRemaining: 0,
      isRunning: false
    });

    setTasks(prev => prev.map(t => 
      t.id === taskId
        ? {
            ...t,
            isTimerRunning: false,
            timeRemaining: t.duration_minutes * 60,
            subtasks: t.subtasks?.map(s => ({
              ...s,
              isTimerRunning: false,
              timeRemaining: s.duration_minutes * 60,
              isCompleted: s.id === subtaskId ? true : s.isCompleted
            }))
          }
        : t
    ));
  };

  const handleReset = () => {
    setHasStartedPlanning(false);
    setTasks([]);
    setUserInput('');
  };

  return (
    <>
      <Navbar onReset={handleReset} />
      
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-zinc-400">
              {tasks.length > 0 ? 'Breaking down task into smaller steps...' : 'Analyzing your tasks...'}
            </p>
          </div>
        </div>
      )}
      
      <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white p-6 pt-24">
        {!hasStartedPlanning ? (
          <div className="max-w-2xl mx-auto space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Plan Your Day</h1>
              <p className="text-zinc-400">
                Tell me what you want to accomplish today, and I'll help you break it down into manageable tasks.
              </p>
            </div>
            
            <div className="glass-panel rounded-2xl p-6">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Example: I need to write a blog post about AI, prepare for tomorrow's meeting, and fix a bug in our codebase."
                className="w-full h-32 bg-zinc-800/50 rounded-xl p-4 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handlePlanDay}
                  disabled={!userInput.trim()}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Plan my day
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-medium">Your Tasks</h2>
              <button
                onClick={() => setHasStartedPlanning(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all"
              >
                Start Over
              </button>
            </div>
            
            <motion.div layout className="space-y-4">
              <AnimatePresence mode="popLayout">
                {tasks
                  .sort((a, b) => {
                    if (a.isCompleted === b.isCompleted) {
                      return a.priority - b.priority;
                    }
                    return a.isCompleted ? 1 : -1;
                  })
                  .map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onUpdate={handleTaskUpdate}
                      onGenerateSubtasks={handleGenerateSubtasks}
                      onTimerClick={handleTimerClick}
                    />
                  ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </main>
    </>
  );
}

