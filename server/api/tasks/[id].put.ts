import { defineEventHandler, readBody, createError } from 'h3'
import type { TaskDTO, TaskStatus } from '~/types/task'
import { readTasks, writeTasks } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = event.context.params!.id
  const body = await readBody<Partial<{ title: string; description: string; status: TaskStatus }>>(event)

  const tasks = await readTasks()
  const idx = tasks.findIndex(t => t.id === id)
  if (idx === -1) throw createError({ statusCode: 404, statusMessage: 'Task not found' })

  const task = tasks[idx]!

  const updatedTask: TaskDTO = {
    id: task.id,
    createdAt: task.createdAt,
    title: body.title ?? task.title,
    description: body.description ?? task.description,
    status: body.status ?? task.status
  }

  tasks[idx] = updatedTask
  await writeTasks(tasks)
  return updatedTask
})
