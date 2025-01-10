import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Task, Subtask } from '../app/types'

export function useApi() {
  const getTodaysTasks = useCallback(async (userId: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (now.getHours() < 4) {
      today.setDate(today.getDate() - 1);
    }
    
    const formattedDate = today.toISOString().split('T')[0];
    
    console.log('Fetching tasks for date:', formattedDate, 'in timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone, 'current time:', now.toLocaleTimeString());
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*, subtasks(*)')
      .eq('user_id', userId)
      .eq('date', formattedDate)
      .order('priority', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', {
        error,
        errorMessage: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    return data as (Task & { subtasks: Subtask[] })[]
  }, [])

  const createTask = useCallback(async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', {
        error,
        errorMessage: error.message,
        details: error.details,
        hint: error.hint,
        task
      });
      throw error;
    }
    return data
  }, [])

  const createSubtask = useCallback(async (subtask: Omit<Subtask, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('subtasks')
      .insert(subtask)
      .select()
      .single()

    if (error) {
      console.error('Error creating subtask:', {
        error,
        errorMessage: error.message,
        details: error.details,
        hint: error.hint,
        subtask
      });
      throw error;
    }
    return data
  }, [])

  const updateTaskCompletion = useCallback(async (taskId: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: isCompleted })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task completion:', {
        error,
        errorMessage: error.message,
        details: error.details,
        hint: error.hint,
        taskId,
        isCompleted
      });
      throw error;
    }
  }, [])

  const updateSubtaskCompletion = useCallback(async (subtaskId: string, isCompleted: boolean) => {
    const { error } = await supabase
      .from('subtasks')
      .update({ is_completed: isCompleted })
      .eq('id', subtaskId)

    if (error) {
      console.error('Error updating subtask completion:', {
        error,
        errorMessage: error.message,
        details: error.details,
        hint: error.hint,
        subtaskId,
        isCompleted
      });
      throw error;
    }
  }, [])

  return {
    getTodaysTasks,
    createTask,
    createSubtask,
    updateTaskCompletion,
    updateSubtaskCompletion,
  }
} 