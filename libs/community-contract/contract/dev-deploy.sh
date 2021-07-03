#!/bin/sh
near dev-deploy target/wasm32-unknown-unknown/release/community_contract.wasm

echo "{\"contractName\": \"$(cat neardev/dev-account)\"}" > ../config.json
near call $(cat neardev/dev-account) new --accountId=sladuca2.testnet
near call $(cat neardev/dev-account) add_admins --accountId=sladuca2.testnet --args '{"new_admins": ["levl333.testnet", "sladuca2.testnet"]}'
