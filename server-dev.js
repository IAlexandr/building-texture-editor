import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import webpackConfig from './webpack.config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import routers from './lib/server/routers';
import options from './options';
import { routes, checkAccess, cookiesSession } from 'basic-auth';
import createStore from './lib/server/authStore';

const app = express();

const router = new express.Router();
const store = createStore();
router.use(routes(store));

app.use(cors({ origin: true }));

app.use(bodyParser.json({ limit: '1024mb' }));
app.use(cookiesSession());
app.use('/api', router);

routers(app);

const httpServer = http.Server(app);

webpackConfig.output.path = '/';

const compiler = webpack(webpackConfig);

const server = new WebpackDevServer(compiler, {
  contentBase: './dist',
  hot: true,
  historyApiFallback: true,
  proxy: {
    '/api/*': 'http://localhost:4000'
  }
});

server.listen(options.PORT, () => {
  httpServer.listen(4000);
  /* eslint-disable no-console */
  console.log('App server listening on port ', options.PORT);
  console.log('Build app...');

  /* eslint-enable no-console */
});
