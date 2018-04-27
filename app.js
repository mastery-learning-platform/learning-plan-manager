import express from 'express';
import graphqlHTTP from 'express-graphql';

import { MongoConnector } from './connectors';
import { schema } from './api';

const app = express();

app.use('/graphql', graphqlHTTP(req => ({
  schema,
  graphiql: true,
  context: {
    request: req,
    mongo: MongoConnector,
  },
  tracing: true,
})));

export default app;
export { app };
