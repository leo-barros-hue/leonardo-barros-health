export type TaskStatus = 'pendente' | 'em-andamento' | 'concluido';

export interface Task {
  id: string;
  title: string;
  description?: string;
  time?: string;
  date: string;
  status: TaskStatus;
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  'pendente': 'bg-amber-50 text-amber-700 border-amber-200',
  'em-andamento': 'bg-blue-50 text-blue-700 border-blue-200',
  'concluido': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; dot: string }> = {
  'pendente': { label: 'Pendente', color: 'text-amber-600', dot: 'bg-amber-500' },
  'em-andamento': { label: 'Em Andamento', color: 'text-blue-600', dot: 'bg-blue-500' },
  'concluido': { label: 'Concluído', color: 'text-emerald-600', dot: 'bg-emerald-500' },
};
