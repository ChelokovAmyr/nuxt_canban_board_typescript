<script setup lang="ts">
import { reactive, watch, onUnmounted } from 'vue'
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

// Форма — независимая реактивная копия
const form = reactive({
  title: '',
  description: '',
  status: 'todo' as TaskStatus
})

// Сбрасываем форму
const resetForm = () => {
  form.title = ''
  form.description = ''
  form.status = 'todo'
}

// ------------------ Watch за props.modelValue ------------------
// Один аккуратный watch для синхронизации формы с внешним значением
watch(
    () => props.modelValue,
    (task) => {
      if (task) {
        form.title = task.title
        form.description = task.description || ''
        form.status = task.status
      } else {
        resetForm()
      }
    },
    { immediate: true }
)

// ------------------ Авто-сохранение ------------------
let updateTimeout: NodeJS.Timeout | null = null

const triggerAutoSave = () => {
  const model = props.modelValue
  if (!model?.id || !props.isEditing) return

  if (updateTimeout) clearTimeout(updateTimeout)
  updateTimeout = setTimeout(() => {
    store.update(model.id, { ...form })
    emit('update', { id: model.id, ...form })
  }, 300)
}

// Слежение за формой для авто-сохранения
watch(
    form,
    () => {
      triggerAutoSave()
    },
    { deep: true }
)

// Очистка таймера при размонтировании
onUnmounted(() => {
  if (updateTimeout) clearTimeout(updateTimeout)
})

// ------------------ Сохранение через submit ------------------
function onSubmit() {
  if (!form.title.trim()) return

  const model = props.modelValue

  if (model?.id && props.isEditing) {
    store.update(model.id, { ...form })
    emit('update', { id: model.id, ...form })
    emit('update:modelValue', null)
  } else {
    emit('save', { ...form })
    resetForm()
  }
}

// ------------------ Отмена ------------------
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
