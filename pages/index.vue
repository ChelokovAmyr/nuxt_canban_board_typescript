<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTaskStore } from '~/stores/taskStore'
import type { TaskDTO, TaskStatus } from '~/types/task'
import TaskForm from '~/components/TaskForm.vue'
import TaskGrid from '~/components/TaskGrid.vue'

const store = useTaskStore()
const editingTask = ref<TaskDTO | undefined>(undefined)
const currentTab = ref<'list' | 'grid'>('list')

onMounted(async () => {
  await store.fetchAll()
})

function editTask(task: TaskDTO) {
  editingTask.value = { ...task }
}

async function deleteTask(task: TaskDTO) {
  if (!task.id) return
  await store.remove(task.id)
}

function onSave(taskData: { title: string; description?: string; status?: TaskStatus }) {
  if (editingTask.value) {
    store.update(editingTask.value.id, taskData)
    editingTask.value = undefined
  } else {
    store.add(taskData)
  }
}
</script>

<template>
  <h1 class="text-2xl font-bold mb-4">Tasks Dashboard</h1>

  <div class="mb-4 flex gap-2">
    <button
      @click="currentTab = 'list'"
      :class="currentTab==='list' ? 'bg-blue-500 text-white' : 'bg-gray-200'"
      class="px-4 py-2 rounded"
    >
      List
    </button>
    <button
      @click="currentTab = 'grid'"
      :class="currentTab==='grid' ? 'bg-blue-500 text-white' : 'bg-gray-200'"
      class="px-4 py-2 rounded"
    >
      Grid
    </button>
  </div>

  <TaskForm @save="onSave" :modelValue="editingTask" />

  <div v-if="currentTab==='list'" class="mt-4 space-y-2">
    <div
      v-for="task in store.tasks"
      :key="task.id"
      class="border p-2 rounded flex justify-between items-center"
    >
      <div>
        <h3 class="font-bold">{{ task.title }}</h3>
        <p class="text-gray-600">{{ task.description }}</p>
        <p class="mt-1 px-2 py-1 rounded text-sm w-max" :class="{
          'bg-gray-100 text-gray-800': task.status==='todo',
          'bg-yellow-100 text-yellow-800': task.status==='in-progress',
          'bg-green-100 text-green-800': task.status==='done'
        }">{{ task.status }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="editTask(task)" class="px-2 py-1 bg-blue-500 text-white rounded">Edit</button>
        <button @click="deleteTask(task)" class="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
      </div>
    </div>
  </div>

  <div v-else>
    <TaskGrid :tasks="store.tasks" @edit="editTask" @delete="deleteTask" />
  </div>
</template>
