'use client'

import { useState, useEffect } from 'react'
import { default as Navbar } from './components/Navbar'
import TaskCard from './components/TaskCard'
import TimerPill from './components/TimerPill'
import { Task, TimerState } from './types'
import { v4 as uuidv4 } from 'uuid'
import { motion, AnimatePresence } from 'framer-motion'
import { config } from './config'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user, loading, signIn } = useAuth()
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
  const [isCompletedVisible, setIsCompletedVisible] = useState(false);

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

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          
          <div className="relative pt-24 pb-16 sm:pt-32 sm:pb-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
                  ActionFlow
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-300">
                Turn brain fog into clear, doable steps.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <button
                    onClick={() => signIn()}
                    className="rounded-xl bg-blue-500 px-8 py-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 transition-all duration-200"
                  >
                    Get Started with Google
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-400">Start Making Progress</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to take action
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Stop feeling overwhelmed by your tasks. ActionFlow helps you break down your goals into manageable steps.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-white">
                  <svg className="h-5 w-5 flex-none text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  AI-Powered Planning
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                  <p className="flex-auto">Our AI breaks down your goals into clear, achievable tasks with estimated durations.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-white">
                  <svg className="h-5 w-5 flex-none text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                  </svg>
                  Smart Subtasks
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                  <p className="flex-auto">Break down complex tasks into smaller, manageable subtasks automatically.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-xl font-semibold leading-7 text-white">
                  <svg className="h-5 w-5 flex-none text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                  </svg>
                  Built-in Timer
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                  <p className="flex-auto">Stay focused with our integrated timer that helps you track progress on each task.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="border-t border-gray-800 pt-8">
              <p className="text-center text-sm leading-5 text-gray-400">
                © 2024 ActionFlow. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Navbar onReset={hasStartedPlanning ? handleReset : undefined} />
      
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-zinc-400">
              {tasks.length > 0 ? 'Creating subtasks...' : 'Analyzing your tasks...'}
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
            {/* Active Tasks */}
            <div className="space-y-4">
              <h2 className="text-2xl font-medium">Your Tasks</h2>
              <motion.div layout className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {tasks
                    .filter(task => !task.isCompleted)
                    .sort((a, b) => a.priority - b.priority)
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

            {/* Completed Tasks */}
            {tasks.some(task => task.isCompleted) && (
              <div className="space-y-4">
                <button
                  onClick={() => setIsCompletedVisible(!isCompletedVisible)}
                  className="flex items-center gap-2 text-2xl font-medium text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className={`w-6 h-6 transform transition-transform ${isCompletedVisible ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  Completed Tasks
                </button>
                
                {isCompletedVisible && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <AnimatePresence mode="popLayout">
                      {tasks
                        .filter(task => task.isCompleted)
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
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}

