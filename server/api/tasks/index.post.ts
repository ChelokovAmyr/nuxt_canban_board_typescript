import { defineEventHandler, readBody, createError } from 'h3'
import type { TaskDTO, TaskStatus } from '~/types/task'
import { readTasks, writeTasks, cryptoRandomId } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<{ title: string; description?: string; status?: TaskStatus }>>(event)

  if (!body.title) throw createError({ statusCode: 400, statusMessage: 'Title is required' })

  const tasks = await readTasks()
  const now = new Date().toISOString()

  const newTask: TaskDTO = {
    id: cryptoRandomId(),
    title: body.title,
    description: body.description ?? '',
    status: body.status ?? 'todo',
    createdAt: now
  }

  tasks.push(newTask)
  await writeTasks(tasks)
  return newTask
})
