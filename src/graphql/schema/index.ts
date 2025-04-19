// schema/index.ts

import { makeSchema } from 'nexus'
import { join } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'

import * as types from './allTypes.js' 

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const schema = makeSchema({
  types,
  outputs: {
    schema: join(__dirname, '..', '..', '..', 'generated', 'schema.graphql'),
    typegen: join(__dirname, '..', '..', '..', 'node_modules/@types/nexus-typegen/index.d.ts'),
  },
  contextType: {
    module: join(__dirname, '..', 'context.ts'),
    export: 'Context',
  },
})
