#!/bin/sh
near dev-deploy target/wasm32-unknown-unknown/release/global_contract.wasm

echo "{\"contractName\": \"$(cat neardev/dev-account)\"}" > ../config.json
near call $(cat neardev/dev-account) new --accountId=levtester.testnet
