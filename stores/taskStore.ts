import { defineStore } from 'pinia'
import type { TaskDTO, TaskStatus } from '~/types/task'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as TaskDTO[]
  }),
  actions: {
    async fetchAll() {
      try {
        this.tasks = await $fetch<TaskDTO[]>('/api/tasks')
      } catch (err) {
        console.error('Failed to fetch tasks:', err)
        this.tasks = []
      }
    },

    async add(taskData: { title: string; description?: string; status?: TaskStatus }) {
      try {
        const newTask = await $fetch<TaskDTO>('/api/tasks', {
          method: 'POST',
          body: taskData
        })
        this.tasks.push(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    },

    async update(
      id: string,
      taskData: Partial<Pick<TaskDTO, 'title' | 'description' | 'status'>>
    ) {
      const idx = this.tasks.findIndex(t => t.id === id)
      if (idx === -1) return

      // оптимистично обновляем локально
      this.tasks[idx] = { ...this.tasks[idx], ...taskData }

      try {
        const updatedTask = await $fetch<TaskDTO>(`/api/tasks/${id}`, {
          method: 'PUT',
          body: taskData
        })
        this.tasks[idx] = updatedTask
      } catch (err) {
        console.error('Failed to update task:', err)
      }
    },

    async remove(id: string) {
      try {
        await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
        this.tasks = this.tasks.filter(t => t.id !== id)
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }
  }
})
