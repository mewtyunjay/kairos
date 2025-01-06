export interface Task {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  priority: number;
  isEditing?: boolean;
  isTimerRunning?: boolean;
  timeRemaining?: number;
  hasSubtasks?: boolean;
  subtasks?: Subtask[];
}

export interface Subtask {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  isCompleted: boolean;
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
  
  