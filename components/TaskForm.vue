<script setup lang="ts">
import { reactive, computed, onUnmounted } from 'vue'
import { useTaskStore } from '~/stores/taskStore'
import type { TaskDTO, TaskStatus } from '~/types/task'

const props = defineProps({
  modelValue: {
    type: Object as PropType<TaskDTO | null>,
    required: false,
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

// Реактивная форма
const form = reactive({
  title: '',
  description: '',
  status: 'todo' as TaskStatus
})

// Вычисляемое свойство для синхронизации с props
const currentTask = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Заполняем форму данными при монтировании, если есть modelValue
if (props.modelValue) {
  form.title = props.modelValue.title
  form.description = props.modelValue.description || ''
  form.status = props.modelValue.status
}

// Сброс формы
const resetForm = () => {
  form.title = ''
  form.description = ''
  form.status = 'todo'
}

// Таймер для дебаунса
let updateTimeout: NodeJS.Timeout | null = null

// Обработчик изменений полей (для дебаунса при редактировании)
const onFieldChange = () => {
  // Если не редактируем существующую задачу, выходим
  if (!props.isEditing || !props.modelValue?.id) {
    return
  }

  // Очищаем предыдущий таймаут
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }

  // Устанавливаем новый таймаут для обновления
  updateTimeout = setTimeout(() => {
    if (props.modelValue?.id) {
      store.update(props.modelValue.id, { ...form })
      emit('update', {
        id: props.modelValue.id,
        ...form
      })
    }
  }, 300)
}

// Обработчик отправки формы
function onSubmit() {
  if (!form.title.trim()) return

  if (props.modelValue?.id && props.isEditing) {
    // Явное обновление при сохранении
    store.update(props.modelValue.id, { ...form })
    emit('update', {
      id: props.modelValue.id,
      ...form
    })
    emit('update:modelValue', null)
  } else {
    // Создание новой задачи
    emit('save', { ...form })
    resetForm()
  }
}

// Обработчик отмены
function onCancel() {
  emit('update:modelValue', null)
  resetForm()
}

// Очистка таймера при размонтировании
onUnmounted(() => {
  if (updateTimeout) {
    clearTimeout(updateTimeout)
  }
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="mb-4 space-y-2 p-4 border rounded">
    <h2 class="text-lg font-bold mb-2">
      {{ isEditing ? 'Edit Task' : 'Create New Task' }}
    </h2>

    <input
        v-model="form.title"
        @input="onFieldChange"
        placeholder="Title *"
        required
        class="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <textarea
        v-model="form.description"
        @input="onFieldChange"
        placeholder="Description"
        rows="3"
        class="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    <select
        v-model="form.status"
        @change="onFieldChange"
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