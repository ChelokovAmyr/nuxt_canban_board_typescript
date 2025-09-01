<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTaskStore } from '~/stores/taskStore'
import type { TaskDTO, TaskStatus } from '~/types/task'

const store = useTaskStore()
const editingTask = ref<TaskDTO | undefined>(undefined)

// Загружаем задачи при монтировании
onMounted(async () => {
  try {
    await store.fetchAll()
  } catch (err) {
    console.error('Failed to load tasks:', err)
  }
})

// Редактирование задачи
function editTask(task: TaskDTO) {
  editingTask.value = { ...task }
}

// Удаление задачи
async function deleteTask(task: TaskDTO) {
  if (!task.id) return
  try {
    await store.remove(task.id)
  } catch (err) {
    console.error('Failed to delete task:', err)
  }
}

// Сохранение из формы
function onSave(taskData: { title: string; description?: string; status?: TaskStatus }) {
  if (editingTask.value) {
    store.update(editingTask.value.id, taskData)
    editingTask.value = undefined
  } else {
    store.add(taskData)
  }
}

// Вспомогательная функция для классов статусов
function statusClass(status: TaskStatus) {
  switch (status) {
    case 'todo': return 'bg-gray-100 text-gray-800'
    case 'in-progress': return 'bg-yellow-100 text-yellow-800'
    case 'done': return 'bg-green-100 text-green-800'
  }
}
</script>

<template>
  <h1 class="text-2xl font-bold mb-4">Tasks Dashboard</h1>

  <TaskForm @save="onSave" :modelValue="editingTask" />

  <div class="mt-4 space-y-2">
    <div v-for="task in store.tasks" :key="task.id" class="border p-2 rounded flex justify-between items-center">
      <div>
        <h3 class="font-bold">{{ task.title }}</h3>
        <p class="text-gray-600">{{ task.description }}</p>
        <p :class="statusClass(task.status)" class="mt-1 px-2 py-1 rounded text-sm w-max">{{ task.status }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="editTask(task)" class="px-2 py-1 bg-blue-500 text-white rounded">Edit</button>
        <button @click="deleteTask(task)" class="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
      </div>
    </div>
  </div>
</template>
