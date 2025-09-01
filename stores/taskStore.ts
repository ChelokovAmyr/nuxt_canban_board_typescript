import { defineStore } from 'pinia'
import type { TaskDTO, TaskStatus } from '~/types/task'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as TaskDTO[]
  }),
  actions: {
    async fetchAll() {
      this.tasks = await $fetch<TaskDTO[]>('/api/tasks')
    },
    async add(task: { title: string; description?: string; status?: TaskStatus }) {
      const newTask = await $fetch<TaskDTO>('/api/tasks', {
        method: 'POST',
        body: task
      })
      this.tasks.push(newTask)
    },
    async update(id: string, data: Partial<{ title: string; description?: string; status?: TaskStatus }>) {
      const updated = await $fetch<TaskDTO>(`/api/tasks/${id}`, {
        method: 'PUT',
        body: data
      })
      const idx = this.tasks.findIndex(t => t.id === id)
      if (idx !== -1) this.tasks[idx] = updated
    },
    async remove(id: string) {
      await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      this.tasks = this.tasks.filter(t => t.id !== id)
    }
  }
})
