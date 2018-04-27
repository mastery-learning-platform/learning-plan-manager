import mongoose from 'mongoose';

import { logger } from '../logger';
import { config } from '../config';

const log = logger('Mongo Connector');

const mongooseConfig = {
  autoReconnect: true,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
};

mongoose.connect(config.MONGODB_URL, mongooseConfig);

mongoose.connection.on('error', (err) => {
  log.error(err);
});

mongoose.connection.on('connection', () => {
  log.info('Connection to Mongo DB Established');
});

mongoose.connection.on('disconnection', () => {
  log.info('Connection to MongoDB Disconnected');
});

export default mongoose;
export { mongoose as MongoConnector };
