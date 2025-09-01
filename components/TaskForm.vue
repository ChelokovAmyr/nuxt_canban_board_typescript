<script setup lang="ts">
import { reactive, watch, ref, onUnmounted } from 'vue'
import { useTaskStore } from '~/stores/taskStore'
import type { TaskDTO, TaskStatus } from '~/types/task'

const props = defineProps({
  modelValue: {
    type: Object as PropType<TaskDTO>,
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

// Локальное состояние формы
const form = reactive({
  title: '',
  description: '',
  status: 'todo' as TaskStatus
})

// Сбрасываем форму к значениям по умолчанию
const resetForm = () => {
  form.title = ''
  form.description = ''
  form.status = 'todo'
}

// Обновляем форму при изменении редактируемой задачи
watch(() => props.modelValue, (task) => {
  if (task) {
    form.title = task.title
    form.description = task.description || ''
    form.status = task.status
  } else {
    resetForm()
  }
}, { immediate: true })

// Дебаунс для избежания частых обновлений
let updateTimeout: NodeJS.Timeout | null = null

watch(form, (newForm) => {
  // Если редактируем существующую задачу и есть ID
  if (props.modelValue?.id && props.isEditing) {
    // Дебаунсим обновления чтобы не спамить API
    if (updateTimeout) clearTimeout(updateTimeout)

    updateTimeout = setTimeout(() => {
      store.update(props.modelValue.id, { ...newForm })
      // Также эмитим обновление для родительского компонента
      emit('update', {
        id: props.modelValue.id,
        ...newForm
      })
    }, 300)
  }
}, { deep: true })

// Очищаем таймер при размонтировании
onUnmounted(() => {
  if (updateTimeout) clearTimeout(updateTimeout)
})

function onSubmit() {
  if (!form.title.trim()) return // Защита от пустого заголовка

  if (props.modelValue?.id && props.isEditing) {
    // Редактирование существующей задачи
    store.update(props.modelValue.id, { ...form })
    emit('update', {
      id: props.modelValue.id,
      ...form
    })
  } else {
    // Создание новой задачи
    emit('save', { ...form })
    resetForm()
  }
}

function onCancel() {
  if (props.isEditing) {
    emit('update:modelValue', null)
  }
  resetForm()
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="mb-4 space-y-2 p-4 border rounded">
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