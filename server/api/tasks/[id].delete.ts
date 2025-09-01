import { defineEventHandler, createError } from 'h3'
import type { TaskDTO } from '~/types/task'
import { readTasks, writeTasks } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = event.context.params!.id
  const tasks = await readTasks()

  const idx = tasks.findIndex((t: TaskDTO) => t.id === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Task not found' })

  const removed = tasks.splice(idx, 1)[0]
  await writeTasks(tasks)
  return removed
})
