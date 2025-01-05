export interface Task {
    name: string;
    description: string;
    confirmed: boolean | undefined;
}

export interface SubTask {
    name: string;
    duration_minutes: number;
    description: string;
    completed?: boolean;
}

export interface DetailedTask extends Task {
    duration_minutes: number;
    priority: number;
    subtasks: SubTask[];
    isExpanded?: boolean;
}
  
  