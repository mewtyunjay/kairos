'use client'

import { useState } from 'react'
import { Task } from '../types'

interface TaskCardProps {
  task: Task
}

export default function TaskCard({ task }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div 
      className="task-card"
      onClick={() => setIsExpanded(!isExpanded)}
      role="button"
      aria-expanded={isExpanded}
      tabIndex={0}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">{task.name}</h2>
        <div className="flex space-x-2">
          <button className="task-badge">{task.duration_minutes}m</button>
          <span className="task-badge">P{task.priority}</span>
          {task.can_be_interleaved && (
            <span className="task-badge">Interleave</span>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-zinc-700 text-zinc-300 animate-fade-in">
          {task.description.split('\n').map((step, index) => (
            <p key={index} className="mb-2">• {step}</p>
          ))}
        </div>
      )}
    </div>
  )
}

