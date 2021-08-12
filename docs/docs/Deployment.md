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

### API


```env
NEAR_SK
NEAR_MASTER_ACCOUNT_ID
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
```


### Bot

```
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
DISCORD_BOT_TOKEN
BASE_WALLET_URL
```

### Frontend


```
BASE_WALLET_URL
DISCORD_CLIENT_ID
TORUS_VERIFIER_NAME
```

## Running locally

If you have all of the environment variables set up, you shoud be able to run all three locally via `npm run dev`.

## Build

To build the bot, frontend, API, and docs site in one go, run `scripts/build-all.sh` from the root directory of the repo. The results will be placed in `dist/apps/bot`, `dist/apps/frontend`, and `dist/apps/api` respectively.

## Deploy 

After building, you can simply copy `dist/apps/api` and `dist/apps/bot` to wherever you want to run them. For the frontend in `dist/apps/frontend`, it's a typical javascript app bundle, so you can take those files and deploy them pretty much wherever you want.

If you're using a managed host like Heroku/Vercel that likes pulling from a github repo, we reccomend setting up a sepearate "deploy repo" for the relevant components (frontend, bot, and/or api) and pushing the contents of their respecitive `dist/apps/` subdirectories to those repos. 

For example, here's ours:
* Frontend: https://github.com/bafnetwork/baf-wallet-deploy-frontend
* Bot: https://github.com/bafnetwork/baf-wallet-deploy-bot
* API: https://github.com/bafnetwork/baf-wallet-deploy-api

### Using CI

If you want to do this through through CI, we do, and our github actions workflow is also open source and can be found in the `.github` directory of this repo.

To adapt this for your usage, find the invocations of `seanmiddleditch/gha-publish-to-git` and change `repository` to the relevant deploy repo you're using for the api, bot, and frontend. Feel free to remove the step for deploying the docs site.

Then you'll need to add the `GITHUB_TOKEN` and `GH_PAT` secrets to your GHA configuration - see [this](https://github.com/seanmiddleditch/gha-publish-to-git#publish-to-git) to learn more 
