---
sidebar_position: 4
---

# Deployment

To deploy your own version of BAF wallet, you must go through the following steps:
- setting up discord application on discord's developer portal
- setting up a torus verifier
- choosing a "master near account"
- setting up environment variables
- deploying the API
- deploying the Bot
- deploying the frontend

## Discord Application

- See the [DiscordJS Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) for instructions on how to do this. You will need the Client ID and Bot Token from this step.

## Torus Verifier

Go to https://developer.tor.us/ and/or read [their instructions on how to set this up]( https://docs.tor.us/customauth/setting-up-verifiers/seting-up-verifiers). You will need your Client ID from the previous step.

## Near Account
- A NEAR account / private key for our API to use. This can be either testnet or mainnet (more on that later). The API only uses this to update some mappings in a smart contract, so it only needs to have a very small amount of NEAR to be able to pay the gas of doing so.

## Deployment

To build / run each component, you will need:

- `node`
- `near-cli`
- a clone of [the BAF Wallet repo](https://github.com/bafnetwork/baf-wallet-v3)

## Environment variables

See our example env configuration file at `/libs/env/.env.example` in the BAF Wallet repo for a list of environment variables. Each is annotated saying what components each variable is needed by. 

If you wish to run it locally, create a copy of the file in the same directory called `.env.dev` and populate all of the fields from the results from the previous steps.

Otherwise, each of the following steps will require some of the environment variables specified in `libs/

## Deploying the API

To deploy the API, build it by running `npx nx run api:build:test`. A single, optimized script will be placed in in `dist/apps/api`. Then, do `node scripts/create-dist-api-package-json.js` to generate a package.json in `dist/apps/api`

Copy that file to wherever you plan to run the API (e.g. a DigitalOcean droplet). To run the script, set up the environment variables it needs, namely:

```env
NEAR_SK
NEAR_MASTER_ACCOUNT_ID
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
```

Then run it with `npm start` within the `dist/apps/api`. It's totally OK to copy it somewhere else.


## Deploying the Bot

To deploy the Bot, build it by running `npx nx run bot:build:test`. A single, optimized script will be placed in `dist/apps/bot`. Then, do `node scripts/create-dist-bot-package-json.js` to generate a package.json in `dist/apps/bot`

To run the script, set up the environment variables it needs, namely:

```
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
DISCORD_BOT_TOKEN
BASE_WALLET_URL
```

Then run it with `npm start` within `dist/apps/bot`. It's totally OK to copy it somewhere else.


## Deploying the Frontend

To deploy the frontend, make sure you have set the environment variables it needs, namely:

```
BASE_WALLET_URL
DISCORD_CLIENT_ID
TORUS_VERIFIER_NAME
```

Once those environment variables are set, run `npx nx run frontend:build-deploy-test`. An optimized web bundle will be placed in `dist/apps/frontend` which you can copy and deploy to whatever static site host you wish.
