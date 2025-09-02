<template>
  <div class="kanban">
    <div
      class="col"
      v-for="(tasks, status) in columns"
      :key="status"
      :data-status="status"
    >
      <h3 class="col-title">{{ statusLabels[status] }} ({{ tasks.length }})</h3>
      <draggable
        :list="tasks"
        group="tasks"
        item-key="id"
        class="drag-area"
        :clone="cloneTask"
        @change="onChange($event, status)"
        @start="dragStart"
        @end="dragEnd"
      >
        <template #item="{ element }">
          <div class="card" :class="{ 'is-dragging': element.id === currentlyDragging }">
            <h4 class="card-title">{{ element.title }}</h4>
            <p class="card-desc">{{ element.description }}</p>
            <div class="actions">
              <button class="edit-btn" @click="$emit('edit', element)">Изменить</button>
              <button class="delete-btn" @click="$emit('delete', element)">Удалить</button>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import draggable from 'vuedraggable'
import type { TaskDTO, TaskStatus } from '~/types/task'

const props = defineProps<{ tasks: TaskDTO[] }>()
const emit = defineEmits(['edit', 'delete', 'update:status'])

const statusLabels: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done'
}

// Используем computed для реактивного разделения задач по статусам
const columns = computed(() => {
  return {
    'todo': props.tasks.filter(t => t.status === 'todo'),
    'in-progress': props.tasks.filter(t => t.status === 'in-progress'),
    'done': props.tasks.filter(t => t.status === 'done')
  }
})

const currentlyDragging = ref<string | null>(null)

// Функция для клонирования задачи
function cloneTask(task: TaskDTO) {
  return { ...task }
}

function onChange(event: any, targetStatus: TaskStatus) {
  // Если задача была перемещена (не просто внутри той же колонки)
  if (event.added) {
    const movedTask = event.added.element

    // Эмитируем событие с обновленной задачей
    const updatedTask = {
      ...movedTask,
      status: targetStatus
    }

    emit('edit', updatedTask)

    // Также эмитим отдельное событие для изменения статуса
    emit('update:status', {
      taskId: movedTask.id, // string тип
      newStatus: targetStatus
    })
  }
}

function dragStart(event: any) {
  currentlyDragging.value = event.item._underlying_vm_.id
}

function dragEnd() {
  currentlyDragging.value = null
}
</script>

<style scoped>
.kanban {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: #f0f0f0;
  border-radius: 10px;
}

.col {
  flex: 1;
  background: #eaeaea;
  padding: 12px;
  border-radius: 8px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.col-title {
  margin-bottom: 12px;
  font-weight: bold;
  font-size: 16px;
  text-align: center;
}

.drag-area {
  flex-grow: 1;
  min-height: 100px;
}

.card {
  background: white;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 6px;
  cursor: grab;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid #42b883;
}

.card:active {
  cursor: grabbing;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.card.is-dragging {
  opacity: 0.7;
  background: #f0f0f0;
  transform: rotate(5deg);
}

.card-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.edit-btn {
  background: #3b82f6;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.edit-btn:hover {
  background: #2563eb;
}

.delete-btn {
  background: #ef4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.delete-btn:hover {
  background: #b91c1c;
}
</style>