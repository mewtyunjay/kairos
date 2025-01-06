'use client'

import { useState } from 'react'
import { Task, Subtask } from '../types'
import TimerPill from './TimerPill'
import { motion, AnimatePresence } from 'framer-motion'

interface TaskCardProps {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
  onGenerateSubtasks: (taskId: string) => void;
  onTimerClick: (taskId: string, subtaskId?: string) => void;
  index: number;
}

export default function TaskCard({ task, onUpdate, onGenerateSubtasks, onTimerClick, index }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [isSubtasksCollapsed, setIsSubtasksCollapsed] = useState(false);

  const handleSave = () => {
    onUpdate(editedTask);
    setIsEditing(false);
  };

  const handleTimerStart = () => {
    onTimerClick(task.id);
  };

  const handleTimerPause = () => {
    onTimerClick(task.id);
  };

  const handleTimerStop = () => {
    onUpdate({
      ...task,
      isTimerRunning: false,
      timeRemaining: task.duration_minutes * 60
    });
  };

  const handleComplete = () => {
    onUpdate({
      ...task,
      isCompleted: !task.isCompleted,
      isTimerRunning: false,
      timeRemaining: undefined
    });
  };

  const handleSubtaskUpdate = (subtask: Subtask, index: number) => {
    const updatedSubtasks = [...(task.subtasks || [])];
    updatedSubtasks[index] = subtask;
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ 
        type: "spring",
        stiffness: 200,
        damping: 25,
        opacity: { duration: 0.3 }
      }}
      className={`task-card p-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 ${
        task.isCompleted ? 'opacity-60' : ''
      }`}
    >
      <motion.div layout="position" className="flex items-start justify-between gap-3">
        <div 
          className="flex-1 flex items-start gap-2 cursor-pointer" 
          onClick={() => task.subtasks && setIsSubtasksCollapsed(!isSubtasksCollapsed)}
        >
          {task.subtasks && (
            <motion.div 
              layout="position"
              animate={{ rotate: isSubtasksCollapsed ? 0 : 90 }}
              className="mt-1"
            >
              <svg 
                className="w-4 h-4 text-zinc-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          )}
          <motion.div layout="position" className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editedTask.name}
                  onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
                  className="w-full bg-zinc-800/50 rounded-lg p-2 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <textarea
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  className="w-full h-20 bg-zinc-800/50 rounded-lg p-2 text-white placeholder-zinc-500 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={editedTask.duration_minutes}
                    onChange={(e) => setEditedTask({ ...editedTask, duration_minutes: parseInt(e.target.value) })}
                    className="w-24 bg-zinc-800/50 rounded-lg p-2 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    min="1"
                  />
                  <button onClick={handleSave} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg">
                    Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-zinc-700 text-white rounded-lg">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h4 className={`font-medium text-base ${task.isCompleted ? 'line-through text-zinc-500' : ''}`}>
                  {task.name}
                </h4>
                <p className={`text-sm text-zinc-400 ${task.isCompleted ? 'line-through' : ''}`}>
                  {task.description}
                </p>
                {!task.hasSubtasks && !task.isCompleted && (
                  <button
                    onClick={() => onGenerateSubtasks(task.id)}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Break into subtasks with AI
                  </button>
                )}
              </>
            )}
          </motion.div>
        </div>
        <motion.div layout="position" className="flex items-center gap-2">
          {!task.isCompleted && (
            <motion.div layout="position">
              <TimerPill
                duration={task.duration_minutes}
                isRunning={task.isTimerRunning || false}
                timeRemaining={task.timeRemaining}
                onStart={handleTimerStart}
                onPause={handleTimerPause}
                onStop={handleTimerStop}
              />
            </motion.div>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all"
            title="Edit task"
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </motion.div>
      </motion.div>

      <motion.div layout="position" className="mt-3 flex justify-end">
        <button
          onClick={handleComplete}
          className={`px-2.5 py-1 rounded-lg text-xs ${
            task.isCompleted
              ? 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-600/50'
              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          }`}
        >
          {task.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
        </button>
      </motion.div>

      <AnimatePresence>
        {task.subtasks && task.subtasks.length > 0 && !isSubtasksCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 space-y-1.5 pl-4 border-l-2 border-zinc-700"
          >
            {task.subtasks.map((subtask, index) => (
              <div
                key={subtask.id}
                className={`p-2 rounded-lg ${
                  subtask.isCompleted ? 'bg-zinc-800/20' : 'bg-zinc-800/30'
                } flex items-center gap-2`}
              >
                <input
                  type="checkbox"
                  checked={subtask.isCompleted}
                  onChange={() => {
                    handleSubtaskUpdate(
                      { ...subtask, isCompleted: !subtask.isCompleted },
                      index
                    );
                  }}
                  className="w-4 h-4 rounded border-zinc-600 text-zinc-900 bg-zinc-900 focus:ring-blue-500"
                />
                <div className="flex-1">
                  {subtask.isEditing ? (
                    <input
                      type="text"
                      value={subtask.name}
                      onChange={(e) => {
                        handleSubtaskUpdate(
                          { ...subtask, name: e.target.value },
                          index
                        );
                      }}
                      className="w-full bg-zinc-800/50 rounded-lg p-1.5 text-sm text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  ) : (
                    <span className={`text-sm ${subtask.isCompleted ? 'line-through text-zinc-500' : ''}`}>
                      {subtask.name}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSubtaskUpdate({ ...subtask, isEditing: true }, index)}
                    className="p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all"
                    title="Edit subtask"
                  >
                    <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const updatedSubtasks = task.subtasks?.filter((_, i) => i !== index) || [];
                      onUpdate({ ...task, subtasks: updatedSubtasks });
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-all"
                    title="Delete subtask"
                  >
                    <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}