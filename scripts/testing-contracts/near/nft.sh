#!/bin/bash

if [ -z $1 ]; then
  echo 'Expected to be run as ./scripts/testing-contracts/near/nft.sh [NFT Owner AccountID]'
  exit 1
fi
cd scripts/testing-contracts/near
git clone git@github.com:bafnetwork/core-contracts.git || true
cd core-contracts/
git checkout nft-simple
git stash
git pull
cd nft-simple
./build.sh
cd ../../
# Deploy, get the address, and AWK to remove the newlines
near dev-deploy core-contracts/nft-simple/target/wasm32-unknown-unknown/release/nft_simple.wasm | awk -F'Done deploying to |\n' '{print $2}' | awk 'NF' >../../nft-contract.txt
rm -r neardev-nft || true
mv neardev ../../../testing-configs/neardev-nft
cat ../../../testing-configs/neardev-nft/dev-account | xargs -n 1 -I {} near call {} new --args '{"owner_id": "levtester.testnet", "metadata":{"spec": "lev-test", "name":"levtest", "symbol": "LEV"}}' --accountId "levtester.testnet"
cat ../../../testing-configs/neardev-nft/dev-account | xargs -n 1 -I {} near call {} nft_mint_test_nft --args "{\"owner\": \"$1\", \"token_id\": \"coolbeans\"}" --accountId "levtester.testnet"
