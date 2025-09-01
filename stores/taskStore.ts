import { defineStore } from 'pinia'
import type { TaskDTO, TaskStatus } from '~/types/task'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as TaskDTO[]
  }),

  actions: {
    // ------------------ Fetch all tasks ------------------
    async fetchAll() {
      try {
        const data = await $fetch<TaskDTO[]>('/api/tasks')
        this.tasks = data
      } catch (err) {
        console.error('Failed to fetch tasks:', err)
        this.tasks = []
      }
    },

    // ------------------ Add a new task ------------------
    async add(taskData: { title: string; description?: string; status?: TaskStatus }) {
      try {
        const newTask = await $fetch<TaskDTO>('/api/tasks', {
          method: 'POST',
          body: taskData
        })
        // реактивно добавляем в массив
        this.tasks.push(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    },

    // ------------------ Update existing task ------------------
    async update(
        id: string,
        taskData: Partial<Pick<TaskDTO, 'title' | 'description' | 'status'>>
    ) {
      const idx = this.tasks.findIndex(t => t.id === id)
      if (idx === -1) return

      const oldTask = this.tasks[idx]!  // <-- говорим TS: точно есть

      // ------------------ Локальное обновление (оптимистично) ------------------
      this.tasks[idx] = {
        id: oldTask.id,
        title: taskData.title ?? oldTask.title,
        description: taskData.description ?? oldTask.description,
        status: taskData.status ?? oldTask.status,
        createdAt: oldTask.createdAt
      }

      try {
        // ------------------ Обновление на сервере ------------------
        const updatedTask = await $fetch<TaskDTO>(`/api/tasks/${id}`, {
          method: 'PUT',
          body: taskData
        })
        // ------------------ Синхронизация с сервером ------------------
        this.tasks[idx] = updatedTask
      } catch (err) {
        console.error('Failed to update task:', err)
        // ------------------ При ошибке перезагружаем данные с сервера ------------------
        await this.fetchAll()
      }
    },

    // ------------------ Remove task ------------------
    async remove(id: string) {
      try {
        await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
        // реактивно удаляем
        this.tasks = this.tasks.filter(t => t.id !== id)
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }
  }
})
