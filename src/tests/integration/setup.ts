import { execSync } from 'node:child_process'
import { PrismaClient } from '../../generated/prisma'
import { beforeAll, afterAll } from 'vitest'
import path from 'path'

const prisma = new PrismaClient()



beforeAll(async () => {
  console.log('Resetting test database...')
  execSync(`npx prisma migrate reset --force --skip-seed --schema=prisma/schema.prisma`, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '../../../'),
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_TEST }
  })
})

afterAll(async () => {
  await prisma.$disconnect()
})