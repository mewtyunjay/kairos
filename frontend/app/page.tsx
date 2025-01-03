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

  const handlePlanDay = async () => {
    if (!userInput.trim()) return;
    
    setIsLoading(true)
    setHasStartedPlanning(true)
    
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
    } catch (error) {
      console.error('Error planning tasks:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  }

  if (!hasStartedPlanning) {
    return (
      <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold mb-8">Let me plan your day</h1>
          <div className="max-w-md mx-auto">
            <textarea 
              className="w-full h-32 bg-zinc-800 rounded-xl p-4 text-white placeholder-zinc-500 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Tell me what you need to get done today..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button
              onClick={handlePlanDay}
              disabled={isLoading || !userInput.trim()}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Planning your day...' : 'Plan my day'}
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white p-6">
      {/* User Profile Section */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-zinc-700"></div>
        <div>
          <h2 className="text-xl font-semibold">Hi, User</h2>
          <p className="text-zinc-400">{tasks.length} tasks active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Task List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Tasks</h3>
                <p className="text-zinc-400">Daily plan</p>
              </div>
            </div>
            <button 
              onClick={handlePlanDay}
              className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div 
                key={index}
                onClick={() => setSelectedTask(task)}
                className={`p-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 cursor-pointer transition-colors ${
                  selectedTask === task ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-2 border-zinc-600"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{task.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-zinc-400">
                      <span>{task.duration_minutes} minutes</span>
                      <span>Priority {task.priority}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Task Details */}
        <div className="bg-zinc-800 rounded-2xl p-6">
          {selectedTask ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">{selectedTask.name}</h3>
                <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                  Active
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{selectedTask.duration_minutes} minutes</span>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Steps</h4>
                  <div className="space-y-2 text-sm">
                    {selectedTask.description.split('\n').map((step, i) => (
                      <p key={i} className="text-zinc-300">{step}</p>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500">
              Select a task to view details
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

