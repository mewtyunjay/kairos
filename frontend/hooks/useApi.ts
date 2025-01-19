import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Task, Subtask } from '../app/types'

export function useApi() {
  const getTodaysTasks = useCallback(async (userId: string) => {
    try {
      // Get today's date in UTC
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(startOfToday.getDate() + 1);

      console.log('Fetching tasks with params:', {
        userId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startOfToday: startOfToday.toISOString(),
        endOfToday: endOfToday.toISOString()
      });
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found when fetching tasks');
        return [];
      }
      
      if (session.user.id !== userId) {
        console.error('Session user ID does not match provided user ID:', {
          sessionUserId: session.user.id,
          providedUserId: userId
        });
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*)')
        .eq('user_id', userId)
        .gte('created_at', startOfToday.toISOString())
        .lt('created_at', endOfToday.toISOString())
        .order('priority', { ascending: false })

      if (error) {
        console.error('Error fetching tasks:', {
          error,
          errorMessage: error.message,
          details: error.details,
          hint: error.hint,
          userId,
          dateRange: {
            start: startOfToday.toISOString(),
            end: endOfToday.toISOString()
          }
        });
        return [];
      }

      console.log('Successfully fetched tasks:', {
        count: data?.length || 0,
        userId,
        dateRange: {
          start: startOfToday.toISOString(),
          end: endOfToday.toISOString()
        }
      });

      return data as (Task & { subtasks: Subtask[] })[]
    } catch (error) {
      console.error('Unexpected error fetching tasks:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        userId
      });
      return [];
    }
  }, [])

  const createTask = useCallback(async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
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

      console.log('Successfully created task:', {
        taskId: data.id,
        name: data.name
      });

      return data;
    } catch (error) {
      console.error('Unexpected error creating task:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        task
      });
      throw error;
    }
  }, [])

  const createSubtask = useCallback(async (subtask: Omit<Subtask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
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

      console.log('Successfully created subtask:', {
        subtaskId: data.id,
        taskId: subtask.task_id,
        name: data.name
      });

      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Unexpected error creating subtask:', {
          error: error.message,
          stack: error.stack,
          subtask
        });
      }
      throw error;
    }
  }, [])

  const updateTaskCompletion = useCallback(async (taskId: string, isCompleted: boolean) => {
    try {
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

      console.log('Successfully updated task completion:', {
        taskId,
        isCompleted
      });
    } catch (error) {
      console.error('Unexpected error updating task completion:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        taskId,
        isCompleted
      });
      throw error;
    }
  }, [])

  const updateSubtaskCompletion = useCallback(async (subtaskId: string, isCompleted: boolean) => {
    try {
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

      console.log('Successfully updated subtask completion:', {
        subtaskId,
        isCompleted
      });
    } catch (error) {
      console.error('Unexpected error updating subtask completion:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
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