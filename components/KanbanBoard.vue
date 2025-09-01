<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { TaskDTO, TaskStatus } from '~/types/task'

const props = defineProps<{
  tasks: TaskDTO[]
}>()

const emits = defineEmits<{
  (e: 'edit', task: TaskDTO): void
  (e: 'delete', task: TaskDTO): void
  (e: 'updateStatus', payload: { task: TaskDTO; status: TaskStatus }): void
}>()

function moveTask(task: TaskDTO, newStatus: TaskStatus) {
  emits('updateStatus', { task, status: newStatus })
}
</script>

<template>
  <div class="flex gap-4">
    <div class="flex-1 border p-2 rounded">
      <h3 class="font-bold mb-2">To Do</h3>
      <div v-for="task in tasks.filter(t => t.status === 'todo')" :key="task.id" class="border p-2 mb-2 rounded">
        <h4>{{ task.title }}</h4>
        <p>{{ task.description }}</p>
        <div class="flex gap-1 mt-1">
          <button @click="emits('edit', task)" class="px-2 py-1 bg-blue-500 text-white rounded">Edit</button>
          <button @click="emits('delete', task)" class="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
          <button @click="moveTask(task, 'in-progress')" class="px-2 py-1 bg-yellow-300 rounded">→ In Progress</button>
          <button @click="moveTask(task, 'done')" class="px-2 py-1 bg-green-300 rounded">→ Done</button>
        </div>
      </div>
    </div>

    <div class="flex-1 border p-2 rounded">
      <h3 class="font-bold mb-2">In Progress</h3>
      <div v-for="task in tasks.filter(t => t.status === 'in-progress')" :key="task.id" class="border p-2 mb-2 rounded">
        <h4>{{ task.title }}</h4>
        <p>{{ task.description }}</p>
        <div class="flex gap-1 mt-1">
          <button @click="emits('edit', task)" class="px-2 py-1 bg-blue-500 text-white rounded">Edit</button>
          <button @click="emits('delete', task)" class="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
          <button @click="moveTask(task, 'todo')" class="px-2 py-1 bg-gray-300 rounded">← To Do</button>
          <button @click="moveTask(task, 'done')" class="px-2 py-1 bg-green-300 rounded">→ Done</button>
        </div>
      </div>
    </div>

    <div class="flex-1 border p-2 rounded">
      <h3 class="font-bold mb-2">Done</h3>
      <div v-for="task in tasks.filter(t => t.status === 'done')" :key="task.id" class="border p-2 mb-2 rounded">
        <h4>{{ task.title }}</h4>
        <p>{{ task.description }}</p>
        <div class="flex gap-1 mt-1">
          <button @click="emits('edit', task)" class="px-2 py-1 bg-blue-500 text-white rounded">Edit</button>
          <button @click="emits('delete', task)" class="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
          <button @click="moveTask(task, 'todo')" class="px-2 py-1 bg-gray-300 rounded">← To Do</button>
          <button @click="moveTask(task, 'in-progress')" class="px-2 py-1 bg-yellow-300 rounded">← In Progress</button>
        </div>
      </div>
    </div>
  </div>
</template>
