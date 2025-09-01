<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '~/stores/taskStore'
import TaskForm from '~/components/TaskForm.vue'
import KanbanBoard from '~/components/KanbanBoard.vue'
import type { TaskDTO, TaskStatus } from '~/types/task'

const store = useTaskStore()
const editingTask = ref<TaskDTO | undefined>(undefined)
const currentTab = ref<'grid' | 'kanban'>('grid')

// Функции для TaskForm
function onSave(taskData: { title: string; description?: string; status?: TaskStatus }) {
  if (editingTask.value) {
    store.update(editingTask.value.id, taskData)
    editingTask.value = undefined
  } else {
    store.add(taskData)
  }
}

// Функции для KanbanBoard
function editTask(task: TaskDTO) {
  editingTask.value = task
}

function deleteTask(task: TaskDTO) {
  if (task.id) store.remove(task.id)
}

function changeTaskStatus({ task, status }: { task: TaskDTO; status: TaskStatus }) {
  store.update(task.id, { status })
}
</script>

<template>
  <h1>Tasks Dashboard</h1>

  <!-- Форма для добавления / редактирования задачи -->
  <TaskForm @save="onSave" :modelValue="editingTask" />

  <!-- Вкладки -->
  <div class="tabs mt-4 mb-2">
    <button @click="currentTab = 'grid'" :class="{ 'font-bold': currentTab === 'grid' }">Grid</button>
    <button @click="currentTab = 'kanban'" :class="{ 'font-bold': currentTab === 'kanban' }">Kanban</button>
  </div>

  <!-- Grid View -->
  <div v-if="currentTab === 'grid'" class="grid gap-2">
    <div v-for="task in store.tasks" :key="task.id" class="border p-2 rounded">
      <h3 class="font-bold truncate">{{ task.title }}</h3>
      <p class="text-gray-600 truncate">{{ task.description }}</p>
      <p :class="statusClass(task.status)" class="mt-2 px-2 py-1 rounded text-sm w-max">{{ task.status }}</p>
      <div class="mt-2 flex gap-2">
        <button @click="editTask(task)" class="px-2 py-1 bg-blue-500 text-white rounded">Edit</button>
        <button @click="deleteTask(task)" class="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
      </div>
    </div>
  </div>

  <!-- Kanban View -->
  <div v-else>
    <KanbanBoard
      :tasks="store.tasks"
      @edit="editTask"
      @delete="deleteTask"
      @updateStatus="changeTaskStatus"
    />
  </div>
</template>

<script lang="ts">
function statusClass(status: TaskStatus) {
  switch (status) {
    case 'todo':
      return 'bg-gray-100 text-gray-800'
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800'
    case 'done':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>
