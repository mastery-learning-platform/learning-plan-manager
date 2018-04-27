import { app } from '../app';
import { config } from '../config';
import { logger } from '../logger';

const log = logger('www');
app.listen(config.PORT, () => {
  log.info(`Server started at port ${config.PORT}`);
});
