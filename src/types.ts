export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: number;
  created_at: string;
  due_date: string | null;
  reminder_date: string | null;
  completed: boolean;
  completed_at: string | null;
  position: number;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface TaskWithLabels {
  task: Task;
  labels: Label[];
}

export type ViewMode = 'all' | 'by-label' | 'completed';
export type SortBy = 'position' | 'priority' | 'created_at' | 'due_date';
export type SortOrder = 'asc' | 'desc';

export interface TaskFilter {
  label_id?: string | null;
  priority?: number | null;
  completed?: boolean | null;
  search?: string | null;
  sort_by?: string | null;
  sort_order?: string | null;
  limit?: number | null;
}
