import { beforeAll, afterAll } from 'vitest'
import { execSync } from 'node:child_process'
import path from 'path'
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

beforeAll(async () => {
  // Ensure test DB URL is defined
  if (!process.env.DATABASE_URL_TEST) {
    throw new Error('DATABASE_URL_TEST is not defined!')
  }

  console.log('Resetting test database...')

  // First: run migrations on the child process with the test env
  execSync(
    'npx prisma migrate reset --force --skip-seed --schema=prisma/schema.prisma',
    {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '../../../'),
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_TEST },
    }
  )

  // **Then** override the main process so our PrismaClient sees the test DB
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST

  // Now create the client
  prisma = new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL },
    }
  })
})

afterAll(async () => {
  await prisma.$disconnect()
})

// Optionally export prisma for tests
export { prisma }