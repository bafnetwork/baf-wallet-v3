import * as bodyParser from 'body-parser';
import express from 'express';
import { RegisterRoutes } from '../build/routes';
import { constants } from './app/config/constants';
import * as cors from 'cors';
import { setGlobalContract } from '@baf-wallet/global-contract';
import { Chain, Env } from '@baf-wallet/interfaces';
import { getNearChain, initNearChain } from '@baf-wallet/global-state';
import { BafError } from '@baf-wallet/errors';

const app = express();

async function initContracts() {
  const masterAccount = await getNearChain().accounts.lookup(
    constants.chainParams[Chain.NEAR].masterAccountID
  );
  await setGlobalContract(masterAccount);
}

async function init() {
  await initNearChain(constants.chainParams[Chain.NEAR], constants.env);
  await initContracts();
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use(bodyParser.json());
  const whitelist = [
    'http://localhost:8080',
    'https://baf-wallet-deploy-frontend.vercel.app',
  ];
  const corsOptions = {
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else if (
        // If the env is TEST or DEV, check against the following REGEX string to
        // allow for frontend Vercel branch deploys to be testable
        (constants.env === Env.TEST || constants.env === Env.DEV) &&
        /^https:\/\/baf\-wallet\-v2\-git\-.{1,100}\-baf\-wallet\.vercel\.app$/.test(
          origin
        )
      ) {
        callback(null, true);
      } else {
        callback(BafError.BlockedByCors());
      }
    },
  };
  app.use(cors(corsOptions));

  RegisterRoutes(app);

  const port = process.env.PORT || 3333;
  const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/`);
  });
  server.on('error', console.error);
}
init();
