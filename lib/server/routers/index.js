import express, { Router } from 'express';
import options from '../../../options';
import path from 'path';

const routers = [
];

const mainRouter = Router();

mainRouter.get('/', function (req, res) {
  res.json({
    version: options.version
  });
});

const root = '/api/';

export default (app) => {
  app.use(root, mainRouter);
  routers.forEach((r) => {
    const { route, router } = r;
    app.use(root + route, router);
  });
  app.use(root + 'files', express.static(path.resolve(process.cwd(), options.sourceDirPath)));
};
