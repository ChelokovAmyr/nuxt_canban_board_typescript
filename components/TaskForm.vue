<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue'
import type { TaskDTO, TaskStatus } from '~/types/task'

const props = defineProps<{ modelValue?: TaskDTO }>()
const emit = defineEmits<{ (e: 'save', task: { title: string; description?: string; status?: TaskStatus }): void }>()

const title = ref(props.modelValue?.title ?? '')
const description = ref(props.modelValue?.description ?? '')
const status = ref<TaskStatus>(props.modelValue?.status ?? 'todo')

watch(() => props.modelValue, val => {
  title.value = val?.title ?? ''
  description.value = val?.description ?? ''
  status.value = val?.status ?? 'todo'
})

function onSubmit() {
  emit('save', { title: title.value, description: description.value, status: status.value })
  title.value = ''
  description.value = ''
  status.value = 'todo'
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-2">
    <input v-model="title" placeholder="Title" required class="border px-2 py-1 rounded"/>
    <input v-model="description" placeholder="Description" class="border px-2 py-1 rounded"/>
    <select v-model="status" class="border px-2 py-1 rounded">
      <option value="todo">Todo</option>
      <option value="in-progress">In Progress</option>
      <option value="done">Done</option>
    </select>
    <button type="submit" class="bg-blue-500 text-white px-2 py-1 rounded">Save</button>
  </form>
</template>
