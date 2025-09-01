<template>
  <div class="grid gap-2">
    <div v-for="task in tasks" :key="task.id" class="border p-2 rounded">
      <h3 class="font-bold truncate">{{ task.title }}</h3>
      <p class="text-gray-600 truncate">{{ task.description }}</p>
      <p :class="statusClass(task.status)" class="mt-2 px-2 py-1 rounded text-sm w-max">{{ task.status }}</p>
      <div class="mt-2 flex gap-2">
        <button @click="$emit('edit', task)" class="px-2 py-1 bg-blue-500 text-white rounded">Edit</button>
        <button @click="$emit('delete', task.id)" class="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskDTO } from '~/types/task'

const props = defineProps<{
  tasks: TaskDTO[]
}>()

const emit = defineEmits<{
  (e: 'edit', task: TaskDTO): void
  (e: 'delete', id: string): void
}>()

function statusClass(status: string) {
  if (status === 'done') return 'bg-green-100 text-green-800'
  if (status === 'in-progress') return 'bg-yellow-100 text-yellow-800'
  return 'bg-gray-100 text-gray-800'
}
</script>
