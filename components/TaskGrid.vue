<template>
  <div class="kanban">
    <div
      class="col"
      v-for="(tasks, status) in columns"
      :key="status"
      :data-status="status"
    >
      <h3 class="col-title">{{ statusLabels[status] }}</h3>
      <draggable
        v-model="columns[status]"
        group="tasks"
        item-key="id"
        @end="onDragEnd"
      >
        <template #item="{ element }">
          <div class="card">
            <h4 class="card-title">{{ element.title }}</h4>
            <p class="card-desc">{{ element.description }}</p>
            <div class="actions">
              <button class="edit-btn" @click="$emit('edit', element)">Edit</button>
              <button class="delete-btn" @click="$emit('delete', element)">Delete</button>
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
import { useTaskStore } from '~/stores/taskStore'

const props = defineProps<{ tasks: TaskDTO[] }>()
const emit = defineEmits(['edit', 'delete'])

const store = useTaskStore()

const statusLabels: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done'
}

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
    // сразу обновляем стор и сервер
    store.update(movedTask.id, { status: newStatus })
  }
}
</script>

<style scoped>
.kanban { display:flex; gap:16px; padding:12px; background:#f0f0f0; border-radius:10px }
.col { flex:1; background:#eaeaea; padding:12px; border-radius:8px; min-height:300px; display:flex; flex-direction:column }
.col-title { margin-bottom:12px; font-weight:bold; font-size:16px; text-align:center }
.card { background:white; margin-bottom:10px; padding:10px; border-radius:6px; cursor:grab; box-shadow:0 2px 6px rgba(0,0,0,0.1); transition:transform 0.2s, box-shadow 0.2s }
.card:active { cursor:grabbing; transform:scale(1.02); box-shadow:0 4px 12px rgba(0,0,0,0.2) }
.card-title { font-weight:600; margin-bottom:4px }
.card-desc { font-size:14px; color:#555; margin-bottom:8px }
.actions { display:flex; gap:8px; justify-content:flex-end }
.edit-btn { background:#3b82f6; color:white; padding:4px 8px; border-radius:4px; border:none; cursor:pointer }
.edit-btn:hover { background:#2563eb }
.delete-btn { background:#ef4444; color:white; padding:4px 8px; border-radius:4px; border:none; cursor:pointer }
.delete-btn:hover { background:#b91c1c }
</style>
