#!/bin/sh
near dev-deploy target/wasm32-unknown-unknown/release/community_contract.wasm

echo "{\"contractName\": \"$(cat neardev/dev-account)\"}" > ../config.json
near call $(cat neardev/dev-account) new --accountId=levtester.testnet
near call $(cat neardev/dev-account) add_admins --accountId=levtester.testnet --args '{"new_admins": ["levl333.testnet"]}'
