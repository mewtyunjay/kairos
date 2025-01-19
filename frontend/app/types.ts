export interface Task {
  id: string;
  user_id?: string;
  name: string;
  description: string;
  duration_minutes: number;
  priority: number;
  date?: string;
  is_completed?: boolean;
  created_at?: string;
  updated_at?: string;
  isEditing?: boolean;
  isTimerRunning?: boolean;
  timeRemaining?: number;
  hasSubtasks?: boolean;
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  task_id?: string;
  name: string;
  description: string;
  duration_minutes: number;
  is_completed?: boolean;
  created_at?: string;
  updated_at?: string;
  isEditing?: boolean;
  isTimerRunning?: boolean;
  timeRemaining?: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
}

export interface TimerState {
  taskId: string | null;
  subtaskId: string | null;
  startTime: number | null;
  timeRemaining: number;
  isRunning: boolean;
}
  
  