import express from 'express';
import graphqlHTTP from 'express-graphql';
import bodyParser from 'body-parser';
import { maskErrors } from 'graphql-errors';

import { MongoConnector } from './connectors';
import { schema } from './api';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

maskErrors(schema);

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
