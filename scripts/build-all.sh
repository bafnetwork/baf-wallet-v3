npm i
npm run client-gen
npx nx run api:build:test
node scripts/create-dist-api-package-json.js
echo 'npm start' > dist/apps/api/Procfile
npx nx run bot:build:test
npx nx build-deploy-test frontend
node scripts/create-dist-bot-package-json.js
echo 'worker: npm start' > dist/apps/bot/Procfile
cd docs && npm i && npm run build