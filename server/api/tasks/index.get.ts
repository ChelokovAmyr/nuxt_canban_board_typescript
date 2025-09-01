import { defineEventHandler } from 'h3'
import { readTasks } from '../../utils/db'

export default defineEventHandler(async () => {
  return await readTasks()
})
