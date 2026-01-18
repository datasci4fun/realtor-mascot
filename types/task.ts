export interface Task {
  id: string
  title: string
  description?: string
  leadId?: string
  leadName?: string
  leadEmail?: string
  assignedTo: string
  assignedToName?: string
  createdBy: string
  createdByName?: string
  dueDate?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TaskFilters {
  status?: string
  priority?: string
  assignedTo?: string
  leadId?: string
  dueDate?: 'overdue' | 'today' | 'week' | 'all'
  search?: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  leadId?: string
  assignedTo: string
  dueDate?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  assignedTo?: string
  dueDate?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
}

export interface TaskStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
}
