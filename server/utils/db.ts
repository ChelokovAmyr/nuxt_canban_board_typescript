import { promises as fs } from 'fs'
import type { TaskDTO, TaskStatus } from '~/types/task'
import { join } from 'path'
import { randomUUID } from 'crypto'

const TASKS_FILE = join(process.cwd(), 'server/data/tasks.json')

export async function readTasks(): Promise<TaskDTO[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8')
    return JSON.parse(data) as TaskDTO[]
  } catch {
    return []
  }
}

export async function writeTasks(tasks: TaskDTO[]) {
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8')
}

export function cryptoRandomId() {
  return randomUUID()
}
