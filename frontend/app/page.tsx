'use client'

import { useState } from 'react'
import TaskInput from './components/TaskInput'
import TaskCard from './components/TaskCard'
import { Task } from './types'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [hasStartedPlanning, setHasStartedPlanning] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTask, setNewTask] = useState({
    name: '',
    duration_minutes: 30,
    priority: 1,
    description: ''
  })

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
      setTasks(data.tasks);
      setHasStartedPlanning(true);
    } catch (error) {
      console.error('Error planning tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddTask = () => {
    if (!newTask.name.trim()) return;
    
    setTasks(prev => [...prev, {
      ...newTask,
      description: newTask.description || 'No steps added'
    }]);
    
    setNewTask({
      name: '',
      duration_minutes: 30,
      priority: 1,
      description: ''
    });
    setIsAddingTask(false);
  }

  return (
    <>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <div className="loading-text">Planning your day...</div>
        </div>
      )}
      
      <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white p-6">
        {!hasStartedPlanning ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-8 max-w-2xl w-full">
              <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text">
                Let me plan your day
              </h1>
              <div className="glass-panel rounded-2xl p-8">
                <textarea 
                  className="w-full h-32 bg-zinc-800/50 rounded-xl p-4 text-white placeholder-zinc-500 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none border border-zinc-700/50"
                  placeholder="Tell me what you need to get done today..."
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
        ) : (
          <>
            {/* User Profile Section */}
            <div className="glass-panel rounded-2xl p-6 mb-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"></div>
              <div>
                <h2 className="text-xl font-semibold">Hi, User</h2>
                <p className="text-zinc-400">{tasks.length} tasks active</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel - Task List */}
              <div className="space-y-4">
                <div className="glass-panel rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Tasks</h3>
                        <p className="text-zinc-400">Daily plan</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsAddingTask(!isAddingTask)}
                      className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                    >
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* New Task Input Form */}
                  {isAddingTask && (
                    <div className="mt-4 space-y-4 animate-fadeIn">
                      <input
                        type="text"
                        placeholder="Task name"
                        value={newTask.name}
                        onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-zinc-800/50 rounded-xl p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none border border-zinc-700/50"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Duration (minutes)</label>
                          <input
                            type="number"
                            min="1"
                            value={newTask.duration_minutes}
                            onChange={(e) => setNewTask(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 1 }))}
                            className="w-full bg-zinc-800/50 rounded-xl p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none border border-zinc-700/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Priority (1-5)</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={newTask.priority}
                            onChange={(e) => setNewTask(prev => ({ ...prev, priority: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) }))}
                            className="w-full bg-zinc-800/50 rounded-xl p-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none border border-zinc-700/50"
                          />
                        </div>
                      </div>
                      <textarea
                        placeholder="Task steps (optional)"
                        value={newTask.description}
                        onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full h-24 bg-zinc-800/50 rounded-xl p-3 text-white placeholder-zinc-500 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none border border-zinc-700/50"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddTask}
                          disabled={!newTask.name.trim()}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Task
                        </button>
                        <button
                          onClick={() => setIsAddingTask(false)}
                          className="px-4 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800/50 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Task List */}
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div 
                      key={index}
                      onClick={() => setSelectedTask(task)}
                      className={`task-card p-4 rounded-xl cursor-pointer ${
                        selectedTask === task ? 'selected' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input 
                          type="checkbox" 
                          className="custom-checkbox"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{task.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-zinc-400">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {task.duration_minutes} min
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                              Priority {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel - Task Details */}
              <div className="glass-panel rounded-2xl p-6">
                {selectedTask ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold">{selectedTask.name}</h3>
                      <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm">
                        Active
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{selectedTask.duration_minutes} minutes</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-zinc-400 mb-3">Steps</h4>
                        <div className="space-y-3">
                          {selectedTask.description.split('\n').map((step, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                {i + 1}
                              </div>
                              <p className="text-zinc-300">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-500">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      Select a task to view details
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  )
}

