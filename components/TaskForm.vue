<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useTaskStore } from '~/stores/taskStore'
import type { TaskDTO, TaskStatus } from '~/types/task'
import { PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<TaskDTO>,
    required: false
  }
})

const emit = defineEmits<{
  (e: 'save', taskData: { title: string; description?: string; status?: TaskStatus }): void
}>()

const store = useTaskStore()

const form = reactive({
  title: props.modelValue?.title ?? '',
  description: props.modelValue?.description ?? '',
  status: props.modelValue?.status ?? 'todo' as TaskStatus
})

// обновление формы при смене редактируемой задачи
watch(() => props.modelValue, (task) => {
  form.title = task?.title ?? ''
  form.description = task?.description ?? ''
  form.status = task?.status ?? 'todo'
}, { immediate: true })

// мгновенно обновляем стор при редактировании через форму
watch(form, (newForm) => {
  if (props.modelValue?.id) {
    store.update(props.modelValue.id, { ...newForm })
  }
}, { deep: true })

function onSubmit() {
  if (!props.modelValue?.id) {
    emit('save', { ...form })
    form.title = ''
    form.description = ''
    form.status = 'todo'
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="mb-4 space-y-2">
    <input v-model="form.title" placeholder="Title" class="border px-2 py-1 rounded w-full" />
    <input v-model="form.description" placeholder="Description" class="border px-2 py-1 rounded w-full" />
    <select v-model="form.status" class="border px-2 py-1 rounded w-full">
      <option value="todo">To Do</option>
      <option value="in-progress">In Progress</option>
      <option value="done">Done</option>
    </select>
    <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded">
      Add Task
    </button>
  </form>
</template>
