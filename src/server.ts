import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import eventRoutes from './routes/eventRoutes.js'
import calendarRoutes from './routes/calendarRoutes.js'
import userRoutes from './routes/userRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import authRoutes from './routes/authRoutes.js'

import { verifyToken } from './middleware/authMiddleware.js'
import { expressMiddleware } from '@apollo/server/express4'

import { buildContext } from './graphql/context.js'


import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';


import { ApolloServer } from '@apollo/server'
import { schema } from "./graphql/schema/index.js"


dotenv.config()
const app = express()

// app.use(cors())
// app.use(express.json())

// app.use('/api/events', eventRoutes)
// app.use('/api/calendars', verifyToken, calendarRoutes)
// app.use('/api/users', userRoutes)
// app.use('/api/categories', categoryRoutes)
// app.use('/api/auth', authRoutes)

// This `app` is the returned value from `express()`.
const httpServer = createServer(app);

// Creating the WebSocket server
const wsServer = new WebSocketServer({
  // This is the `httpServer` we created in a previous step.
  server: httpServer,
  // Pass a different path here if app.use
  // serves expressMiddleware at a different path
  path: '/subscriptions',
});

const serverCleanup = useServer({ schema }, wsServer);
// await apolloServer.start();

const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();
app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  express.json(), 
  expressMiddleware(server, {
    context: async ({ req }) => buildContext({ req }),
  }),
);

const PORT = process.env.PORT || 4000
httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})