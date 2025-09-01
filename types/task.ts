export type TaskStatus = 'todo' | 'in-progress' | 'done'

export interface TaskDTO {
  id: string
  title: string
  description: string
  status: TaskStatus
  createdAt: string
}
