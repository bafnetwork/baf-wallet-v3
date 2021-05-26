cd scripts/testing-contracts/near
git clone git@github.com:near-examples/NFT.git || true
cd NFT
npm run build:rs
near dev-deploy contracts/rust/target/wasm32-unknown-unknown/release/nep4_rs.wasm
