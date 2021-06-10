#!/bin/sh
near dev-deploy target/wasm32-unknown-unknown/release/community_contract.wasm | echo
near call dev-1623353929808-71316364508823 new --accountId=levtester.testnet
near call dev-1623353929808-71316364508823 add_admins --accountId=levtester.testnet --args '{"new_admins": ["levl333.testnet"]}'
