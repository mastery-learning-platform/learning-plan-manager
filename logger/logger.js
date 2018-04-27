import bunyan from 'bunyan';
import { config } from '../config';

const logger = source => bunyan.createLogger({ name: `${config.APP_NAME}_${source}` });

export default logger;
export { logger };
