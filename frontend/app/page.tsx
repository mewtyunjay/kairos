'use client'

import { useState, useEffect } from 'react'
import TaskInput from './components/TaskInput'
import TaskCard from './components/TaskCard'
import { Task, DetailedTask, SubTask } from './types'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [detailedTasks, setDetailedTasks] = useState<DetailedTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedPlanning, setHasStartedPlanning] = useState(false);
  const [hasStartedBreakdown, setHasStartedBreakdown] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<{index: number, name: string, description: string} | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage after component mounts
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    const savedHasStartedPlanning = localStorage.getItem('hasStartedPlanning');
    const savedUserInput = localStorage.getItem('userInput');

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedHasStartedPlanning) setHasStartedPlanning(savedHasStartedPlanning === 'true');
    if (savedUserInput) setUserInput(savedUserInput);
    
    setIsHydrated(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return; // Don't save during initial hydration

    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('hasStartedPlanning', hasStartedPlanning.toString());
    localStorage.setItem('userInput', userInput);
  }, [tasks, hasStartedPlanning, userInput, isHydrated]);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to start over? This will clear all your tasks.')) {
      setTasks([]);
      setHasStartedPlanning(false);
      setUserInput('');
      localStorage.clear();
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (!hasStartedPlanning && userInput.trim()) {
          handlePlanDay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hasStartedPlanning, userInput]);

  const handlePlanDay = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to plan tasks');
      }

      const data = await response.json();
      const tasksWithUndefinedConfirmation = data.tasks.map((task: Task) => ({
        ...task,
        confirmed: undefined
      }));
      setTasks(tasksWithUndefinedConfirmation);
      setHasStartedPlanning(true);
    } catch (error) {
      console.error('Error planning tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleConfirmTask = (index: number, confirmed: boolean) => {
    setTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, confirmed } : task
    ));
  }

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    
    const newTask = {
      name: newTaskName,
      description: newTaskDescription,
      confirmed: undefined,
    };
    
    setTasks(prev => [...prev, newTask]);
    setNewTaskName('');
    setNewTaskDescription('');
    setIsAddingTask(false);
  }

  const handleDeleteTask = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  }

  const handleEditTask = (index: number) => {
    const task = tasks[index];
    setEditingTask({
      index,
      name: task.name,
      description: task.description
    });
  }

  const handleSaveEdit = () => {
    if (!editingTask) return;
    
    setTasks(prev => prev.map((task, i) => 
      i === editingTask.index 
        ? { ...task, name: editingTask.name, description: editingTask.description }
        : task
    ));
    setEditingTask(null);
  }

  const handleBreakdownTasks = async () => {
    setIsLoading(true);
    setHasStartedBreakdown(true);
    const confirmedTasks = tasks.filter(task => task.confirmed === true);
    
    try {
      const detailedTasksPromises = confirmedTasks.map(task =>
        fetch('/api/breakdown', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: task.name,
            description: task.description,
          }),
        }).then(res => res.json())
      );

      const results = await Promise.all(detailedTasksPromises);
      
      const detailedTasks: DetailedTask[] = confirmedTasks.map((task, index) => ({
        ...task,
        ...results[index],
        isExpanded: false,
      }));

      setDetailedTasks(detailedTasks);
    } catch (error) {
      console.error('Error breaking down tasks:', error);
      setHasStartedBreakdown(false); // Reset if there's an error
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskExpansion = (index: number) => {
    setDetailedTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, isExpanded: !task.isExpanded } : task
    ));
  };

  return (
    <>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <div className="loading-text">
            {hasStartedBreakdown ? 'Breaking down tasks into smaller chunks...' : 'Analyzing your tasks...'}
          </div>
        </div>
      )}
      
      <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white p-6">
        {/* Home button - always visible */}
        <button
          onClick={handleReset}
          className="fixed top-6 left-6 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all group"
          title="Start over"
        >
          <svg className="w-6 h-6 text-zinc-400 group-hover:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>

        {!hasStartedPlanning ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-8 max-w-2xl w-full">
              <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text">
                Let me plan your day
              </h1>
              <div className="glass-panel rounded-2xl p-8">
                <textarea 
                  className="w-full h-32 bg-zinc-800/50 rounded-xl p-4 text-white placeholder-zinc-500 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none border border-zinc-700/50"
                  placeholder="Tell me what you need to get done today... (⌘ + Enter to submit)"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                <button
                  onClick={handlePlanDay}
                  disabled={isLoading || !userInput.trim()}
                  className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                >
                  Plan my day
                </button>
              </div>
            </div>
          </div>
        ) : !hasStartedBreakdown ? (
          <div className="max-w-4xl mx-auto">
            <div className="glass-panel rounded-2xl p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4">Here are your tasks for today:</h2>
              <p className="text-zinc-400 mb-6">Please confirm each task before I break them down further.</p>
              
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div key={index} className="task-card p-4 rounded-xl">
                    {editingTask?.index === index ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingTask.name}
                          onChange={(e) => setEditingTask(prev => prev ? {...prev, name: e.target.value} : prev)}
                          className="w-full bg-zinc-800/50 rounded-lg p-2 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none border border-zinc-700/50"
                        />
                        <textarea
                          value={editingTask.description}
                          onChange={(e) => setEditingTask(prev => prev ? {...prev, description: e.target.value} : prev)}
                          className="w-full h-24 bg-zinc-800/50 rounded-lg p-2 text-white placeholder-zinc-500 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none border border-zinc-700/50"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTask(null)}
                            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{task.name}</h4>
                          <p className="text-zinc-400">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditTask(index)}
                            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all"
                            title="Edit task"
                          >
                            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTask(index)}
                            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all"
                            title="Delete task"
                          >
                            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleConfirmTask(index, true)}
                            disabled={task.confirmed === true}
                            className={`px-4 py-2 rounded-lg transition-all ${
                              task.confirmed === true
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-zinc-800 hover:bg-zinc-700'
                            }`}
                          >
                            {task.confirmed === true ? 'Confirmed' : 'Yes'}
                          </button>
                          <button
                            onClick={() => handleConfirmTask(index, false)}
                            className={`px-4 py-2 rounded-lg transition-all ${
                              task.confirmed === false
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-zinc-800 hover:bg-zinc-700'
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {tasks.length > 0 && (
                <>
                  <button
                    onClick={() => setIsAddingTask(!isAddingTask)}
                    className="mt-8 px-4 py-2 rounded-lg bg-zinc-800/30 hover:bg-zinc-700/30 text-zinc-400 hover:text-zinc-300 transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add task manually
                  </button>

                  {isAddingTask && (
                    <div className="mt-4 p-4 border border-zinc-800/50 rounded-xl animate-fadeIn">
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Task name"
                          className="w-full bg-zinc-800/50 rounded-xl p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none border border-zinc-700/50"
                          value={newTaskName}
                          onChange={(e) => setNewTaskName(e.target.value)}
                        />
                        <textarea
                          placeholder="Task description"
                          className="w-full h-24 bg-zinc-800/50 rounded-xl p-3 text-white placeholder-zinc-500 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none border border-zinc-700/50"
                          value={newTaskDescription}
                          onChange={(e) => setNewTaskDescription(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddTask}
                            disabled={!newTaskName.trim()}
                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Add Task
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingTask(false);
                              setNewTaskName('');
                              setNewTaskDescription('');
                            }}
                            className="px-4 py-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/50 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {tasks.some(task => task.confirmed) && (
                    <button
                      onClick={handleBreakdownTasks}
                      className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                    >
                      Break down confirmed tasks
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              {detailedTasks.map((task, index) => (
                <div 
                  key={index} 
                  className={`task-card p-4 rounded-xl transition-all ${
                    task.isExpanded ? 'bg-zinc-800/50' : 'hover:bg-zinc-800/30'
                  }`}
                >
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleTaskExpansion(index)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{task.name}</h4>
                      <p className="text-zinc-400">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                        {task.duration_minutes}m
                      </span>
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                        P{task.priority}
                      </span>
                      <svg 
                        className={`w-5 h-5 text-zinc-400 transition-transform ${
                          task.isExpanded ? 'transform rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {task.isExpanded && (
                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-zinc-700">
                      {task.subtasks.map((subtask, subtaskIndex) => (
                        <div key={subtaskIndex} className="p-3 rounded-lg bg-zinc-800/30">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">{subtask.name}</h5>
                              <p className="text-sm text-zinc-400">{subtask.description}</p>
                            </div>
                            <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm">
                              {subtask.duration_minutes}m
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="glass-panel rounded-2xl p-6">
              {/* Calendar view will go here */}
            </div>
          </div>
        )}
      </main>
    </>
  )
}

