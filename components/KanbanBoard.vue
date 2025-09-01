<template>
  <div class="flex gap-4">
    <div v-for="status in statuses" :key="status" class="flex-1 border p-2 rounded">
      <h4 class="font-bold mb-2">{{ status }}</h4>
      <div v-for="task in tasksByStatus(status)" :key="task.id" class="border p-2 mb-2 rounded bg-white">
        <h5 class="font-bold">{{ task.title }}</h5>
        <p class="text-gray-600">{{ task.description }}</p>
        <div class="mt-1 flex gap-1">
          <button @click="onEdit(task)" class="px-2 py-1 bg-blue-500 text-white rounded text-sm">Edit</button>
          <button @click="onDelete(task.id)" class="px-2 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskDTO, TaskStatus } from '~/types/task'

interface Props {
  tasks: TaskDTO[]
  onEdit: (task: TaskDTO) => void
  onDelete: (id: string) => void
}
const props = defineProps<Props>()
const statuses: TaskStatus[] = ['todo', 'in-progress', 'done']

function tasksByStatus(status: TaskStatus) {
  return props.tasks.filter(t => t.status === status)
}
</script>
