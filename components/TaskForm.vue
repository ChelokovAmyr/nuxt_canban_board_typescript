<script setup lang="ts">
import { reactive, computed, onUnmounted } from 'vue'
import { useTaskStore } from '~/stores/taskStore'
import type { TaskDTO, TaskStatus } from '~/types/task'

const props = defineProps({
  modelValue: {
    type: Object as PropType<TaskDTO | null>,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: TaskDTO | null): void
  (e: 'save', taskData: { title: string; description?: string; status?: TaskStatus }): void
  (e: 'update', taskData: { id: string; title: string; description?: string; status?: TaskStatus }): void
}>()

const store = useTaskStore()

// Таймер для авто-сохранения
let updateTimeout: NodeJS.Timeout | null = null
onUnmounted(() => {
  if (updateTimeout) clearTimeout(updateTimeout)
})

// Форму делаем реактивной, но значения берем из props через computed
const form = reactive({
  title: computed({
    get: () => props.modelValue?.title ?? '',
    set: (val) => {
      if (props.modelValue) props.modelValue.title = val
      triggerAutoSave()
    }
  }),
  description: computed({
    get: () => props.modelValue?.description ?? '',
    set: (val) => {
      if (props.modelValue) props.modelValue.description = val
      triggerAutoSave()
    }
  }),
  status: computed({
    get: () => props.modelValue?.status ?? 'todo',
    set: (val) => {
      if (props.modelValue) props.modelValue.status = val
      triggerAutoSave()
    }
  })
})

// Сброс формы
function resetForm() {
  if (!props.modelValue) {
    form.title = ''
    form.description = ''
    form.status = 'todo'
  }
}

// Авто-сохранение при редактировании
function triggerAutoSave() {
  if (props.isEditing && props.modelValue?.id) {
    if (updateTimeout) clearTimeout(updateTimeout)
    updateTimeout = setTimeout(() => {
      const taskId = props.modelValue!.id
      const updatedData = {
        title: form.title,
        description: form.description,
        status: form.status
      }
      store.update(taskId, updatedData)
      emit('update', { id: taskId, ...updatedData })
    }, 300)
  }
}

// Сохранение через submit
function onSubmit() {
  if (!form.title.trim()) return

  const modelValue = props.modelValue

  if (modelValue?.id && props.isEditing) {
    const updatedData = {
      title: form.title,
      description: form.description,
      status: form.status
    }
    store.update(modelValue.id, updatedData)
    emit('update', { id: modelValue.id, ...updatedData })
    emit('update:modelValue', null)
  } else {
    emit('save', {
      title: form.title,
      description: form.description,
      status: form.status
    })
    resetForm()
  }
}

function onCancel() {
  emit('update:modelValue', null)
  resetForm()
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="mb-4 space-y-2 p-4 border rounded">
    <h2 class="text-lg font-bold mb-2">
      {{ isEditing ? 'Edit Task' : 'Create New Task' }}
    </h2>

    <input
        v-model="form.title"
        placeholder="Title *"
        required
        class="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <textarea
        v-model="form.description"
        placeholder="Description"
        rows="3"
        class="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <select
        v-model="form.status"
        class="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="todo">To Do</option>
      <option value="in-progress">In Progress</option>
      <option value="done">Done</option>
    </select>

    <div class="flex gap-2 pt-2">
      <button
          type="submit"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        {{ isEditing ? 'Update Task' : 'Add Task' }}
      </button>

      <button
          v-if="isEditing"
          type="button"
          @click="onCancel"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
      >
        Cancel
      </button>
    </div>
  </form>
</template>
