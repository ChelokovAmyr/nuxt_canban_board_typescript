<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TaskForm from '~/components/TaskForm.vue'
import { useTaskStore } from '~/stores/taskStore'
import type { TaskDTO, TaskStatus } from '~/types/task'

const store = useTaskStore()
const editingTask = ref<TaskDTO | undefined>(undefined)

onMounted(() => {
  store.fetchAll()
})

function onSave(taskData: { title: string; description?: string; status?: TaskStatus }) {
  if (editingTask.value) {
    store.update(editingTask.value.id, taskData)
    editingTask.value = undefined
  } else {
    store.add(taskData)
  }
}

function editTask(task: TaskDTO) {
  editingTask.value = { ...task }
}

function deleteTask(id: string) {
  store.remove(id)
}
</script>

<template>
  <h1>Tasks Dashboard</h1>
  <TaskForm @save="onSave" :modelValue="editingTask" />
  <div class="mt-4">
    <div v-for="task in store.tasks" :key="task.id" class="border p-2 rounded mb-2">
      <h3 class="font-bold">{{ task.title }}</h3>
      <p>{{ task.description }}</p>
      <p>{{ task.status }}</p>
      <button @click="editTask(task)" class="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
      <button @click="deleteTask(task.id)" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
    </div>
  </div>
</template>
