# TODO: and move to somewhere else
#!/bin/sh
near call $(cat neardev/dev-account) init_community --accountId=levtester.testnet \
	--args '{"guild_id": "795052635132395570", "new_admins": ["levtester.testnet", "levtester.testnet"]}'
	# CMU Blockchain Group Discord
