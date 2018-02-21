import { BoarderClientError } from '../helpers';

export default (app) => {
  app.on('error', (err) => {
    if (!(err instanceof BoarderClientError)) {
      console.log('Middleware error:', err);
    }
  });
};
