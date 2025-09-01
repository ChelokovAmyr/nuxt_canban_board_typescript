import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TaskDTO, TaskStatus } from '~/types/task'
import { $fetch } from 'ofetch'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<TaskDTO[]>([])

  async function fetchAll() {
    tasks.value = await $fetch<TaskDTO[]>('/api/tasks')
  }

  async function add(task: { title: string; description?: string; status?: TaskStatus }) {
    const newTask = await $fetch<TaskDTO>('/api/tasks', {
      method: 'POST',
      body: task
    })
    tasks.value.push(newTask)
  }

  async function update(id: string, data: Partial<Pick<TaskDTO, 'title' | 'description' | 'status'>>) {
    const updated = await $fetch<TaskDTO>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: data
    })
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) tasks.value[idx] = updated
  }

  async function remove(id: string) {
    await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    tasks.value = tasks.value.filter(t => t.id !== id)
  }

  return { tasks, fetchAll, add, update, remove }
})
