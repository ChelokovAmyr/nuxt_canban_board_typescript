<template>
  <div class="kanban">
    <div class="col" v-for="(tasks, status) in columns" :key="status">
      <h3>{{ statusLabels[status] }}</h3>
      <draggable
        v-model="columns[status]"
        group="tasks"
        item-key="id"
        @end="onDragEnd"
      >
        <template #item="{ element }">
          <div class="card">
            <h4>{{ element.title }}</h4>
            <p>{{ element.description }}</p>
            <div class="actions">
              <button @click="$emit('edit', element)">Edit</button>
              <button @click="$emit('delete', element)">Delete</button>
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import draggable from 'vuedraggable'
import type { TaskDTO, TaskStatus } from '~/types/task'

const props = defineProps<{ tasks: TaskDTO[] }>()
const emit = defineEmits(['edit', 'delete'])

const statusLabels: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done'
}

// Разбиваем задачи по колонкам
const columns = reactive<Record<TaskStatus, TaskDTO[]>>({
  'todo': [],
  'in-progress': [],
  'done': []
})

watch(() => props.tasks, (tasks) => {
  columns['todo'] = tasks.filter(t => t.status === 'todo')
  columns['in-progress'] = tasks.filter(t => t.status === 'in-progress')
  columns['done'] = tasks.filter(t => t.status === 'done')
}, { immediate: true })

function onDragEnd(evt: any) {
  const movedTask: TaskDTO = evt.item._underlying_vm_
  const newStatus = evt.to.dataset.status as TaskStatus
  if (movedTask.status !== newStatus) {
    movedTask.status = newStatus
    emit('edit', movedTask) // чтобы store обновил статус через onEdit
  }
}
</script>

<style scoped>
.kanban { display:flex; gap:12px }
.col { flex:1; background:#f5f5f5; padding:8px; border-radius:8px }
.card { background:white; margin-bottom:8px; padding:8px; border-radius:6px; cursor:grab; }
</style>
