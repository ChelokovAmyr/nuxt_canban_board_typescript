<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTaskStore } from '~/stores/taskStore'
import type { TaskDTO, TaskStatus } from '~/types/task'
import TaskForm from '~/components/TaskForm.vue'
import TaskGrid from '~/components/TaskGrid.vue'

const store = useTaskStore()
const editingTask = ref<TaskDTO | null>(null)
const currentTab = ref<'list' | 'kanban'>('list')

// ---------------- Fetch tasks on mount ----------------
onMounted(async () => {
  await store.fetchAll()
})

// ---------------- Task operations ----------------
function editTask(task: TaskDTO) {
  editingTask.value = { ...task } // делаем копию для редактирования
}

async function deleteTask(task: TaskDTO) {
  if (!task.id) return
  if (confirm(`Вы уверены удалить "${task.title}"?`)) {
    await store.remove(task.id)
  }
}

function onSave(taskData: { title: string; description?: string; status?: TaskStatus }) {
  if (editingTask.value && editingTask.value.id) {
    store.update(editingTask.value.id, taskData)
    editingTask.value = null
  } else {
    store.add(taskData)
  }
}

function updateTaskStatus({ taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) {
  if (taskId) {
    const task = store.tasks.find(t => t.id === taskId)
    if (task) {
      store.update(taskId, { ...task, status: newStatus })
    }
  }
}

// ---------------- Reactive computed statistics ----------------
const totalTasks = computed(() => store.tasks.length)
const todoTasks = computed(() => store.tasks.filter(t => t.status === 'todo').length)
const inProgressTasks = computed(() => store.tasks.filter(t => t.status === 'in-progress').length)
const doneTasks = computed(() => store.tasks.filter(t => t.status === 'done').length)

// ---------------- CSS helper ----------------
function statusClass(status: TaskStatus) {
  switch (status) {
    case 'todo': return 'bg-gray-100 text-gray-800'
    case 'in-progress': return 'bg-yellow-100 text-yellow-800'
    case 'done': return 'bg-green-100 text-green-800'
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-3xl font-bold mb-6 text-gray-800">Дешборд с тасками</h1>

    <!-- Tab Navigation -->
    <div class="mb-6 flex gap-2 border-b border-gray-200 pb-4">
      <button
          @click="currentTab = 'list'"
          :class="[
          'px-6 py-2 rounded-lg font-medium transition-colors',
          currentTab === 'list'
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        📋 Постраничный вывод
      </button>
      <button
          @click="currentTab = 'kanban'"
          :class="[
          'px-6 py-2 rounded-lg font-medium transition-colors',
          currentTab === 'kanban'
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        ]"
      >
        🗂️ Канбан Доска
      </button>
    </div>

    <!-- Task Form -->
    <div class="mb-8">
      <TaskForm
          @save="onSave"
          :modelValue="editingTask"
          @update:modelValue="editingTask = $event"
      />
    </div>

    <!-- List View -->
    <div v-if="currentTab === 'list'" class="space-y-3">
      <div
          v-for="task in store.tasks"
          :key="task.id"
          class="border border-gray-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-bold text-lg text-gray-800 mb-2">{{ task.title }}</h3>
            <p class="text-gray-600 mb-3">{{ task.description || 'No description' }}</p>
            <div class="flex items-center gap-3">
              <span
                  :class="[statusClass(task.status), 'px-3 py-1 rounded-full text-sm font-medium capitalize']"
              >
                {{ task.status }}
              </span>
              <span class="text-sm text-gray-500">
                Создан: {{ new Date(task.createdAt).toLocaleDateString() }}
              </span>
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <button
                @click="editTask(task)"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              ✏️ Изменить
            </button>
            <button
                @click="deleteTask(task)"
                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              🗑️ Удалить
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
          v-if="store.tasks.length === 0"
          class="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
      >
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">No tasks yet</h3>
        <p class="text-gray-500">Create your first task to get started!</p>
      </div>
    </div>

    <!-- Kanban View -->
    <div v-else>
      <TaskGrid
          :tasks="store.tasks"
          @edit="editTask"
          @delete="deleteTask"
          @update:status="updateTaskStatus"
      />
    </div>

    <!-- Statistics -->
    <div v-if="store.tasks.length > 0" class="mt-8 pt-6 border-t border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div class="text-2xl font-bold text-gray-800">{{ totalTasks }}</div>
          <div class="text-sm text-gray-600">Всего тасок</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div class="text-2xl font-bold text-blue-600">{{ todoTasks }}</div>
          <div class="text-sm text-gray-600">To Do</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div class="text-2xl font-bold text-yellow-600">{{ inProgressTasks }}</div>
          <div class="text-sm text-gray-600">In Progress</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div class="text-2xl font-bold text-green-600">{{ doneTasks }}</div>
          <div class="text-sm text-gray-600">Done</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}

button {
  transition: all 0.2s ease-in-out;
}

button:active {
  transform: scale(0.98);
}
</style>