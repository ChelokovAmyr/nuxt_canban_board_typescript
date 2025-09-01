<template>
  <ul>
    <li v-for="task in tasks" :key="task.id" class="border-b py-2 flex justify-between items-center">
      <div>
        <h3 class="font-bold">{{ task.title }}</h3>
        <p class="text-gray-600">{{ task.description }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="onEdit(task)" class="px-2 py-1 bg-blue-500 text-white rounded">Edit</button>
        <button @click="onDelete(task.id)" class="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { TaskDTO } from '~/types/task'

interface Props {
  tasks: TaskDTO[]
  onEdit: (task: TaskDTO) => void
  onDelete: (id: string) => void
}
const props = defineProps<Props>()
</script>
