import { ApolloServer } from '@apollo/server'

import { schema } from "./schema/index.js";


export const server = new ApolloServer({
  schema
});

await server.start();