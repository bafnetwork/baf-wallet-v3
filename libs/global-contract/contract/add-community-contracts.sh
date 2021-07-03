# TODO: and move to somewhere else
#!/bin/sh
near call $(cat neardev/dev-account) init_community --accountId=sladuca2.testnet \
	--args '{"guild_id": "795052635132395570", "new_admins": ["levtester.testnet", "sladuca2.testnet"]}'
	# CMU Blockchain Group Discord
