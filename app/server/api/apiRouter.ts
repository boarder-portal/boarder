import bodyParser from 'body-parser';
import { Request } from 'express';
import PromiseRouter from 'express-promise-router';

import { LoginParams, RegisterParams } from 'common/types/requestParams';

import getDB from 'server/db/getDB';
import writeDB from 'server/db/writeDB';

const apiRouter = PromiseRouter();

apiRouter
  .use(bodyParser.json())
  .get('/user', async (req, res) => {
    res.status(200).json(req.session.user || null);
  })
  .post('/register', async (req: Request<unknown, unknown, RegisterParams, unknown>, res) => {
    const { user } = req.body;

    const db = await getDB();

    db.users.push(user);

    await writeDB(db);

    req.session.user = {
      login: user.login,
    };

    res.status(200).json(req.session.user);
  })
  .post('/login', async (req: Request<unknown, unknown, LoginParams, unknown>, res) => {
    const { user } = req.body;

    const db = await getDB();

    const authUser = db.users.find(({ login, password }) => login === user.login && password === user.password);

    if (!authUser) {
      throw new Error('No such user.');
    }

    req.session.user = {
      login: authUser.login,
    };

    res.status(200).json(req.session.user);
  })
  .post('/logout', async (req: Request, res) => {
    req.session.destroy?.();

    res.status(200).send({});
  });

export default apiRouter;
