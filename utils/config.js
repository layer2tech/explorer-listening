require('dotenv').config()

module.exports = {
	getConfig
}

function getArgsHasTestnet(){
	if(process.argv.includes("TESTNET")){
		return true
	}
	else{
		return false
	}
}

function getConfig(){
	const testnet = getArgsHasTestnet()

	if(testnet){
		console.log('setting testnet config')
		let config = {
			explorerURI: process.env.EXPLORER_URI,
			mercuryAPI: process.env.TESTNET_MERCURY_API,
			mercuryDb: process.env.TESTNET_MERCURY_DB,
			dbName: process.env.DB_NAME,
			statechains: process.env.TESTNET_STATECHAINS,
			transactions: process.env.TESTNET_TRANSACTIONS,
			batchtransfers: process.env.TESTNET_BATCH_TRANSFERS
			}
		return config
	}
	else{
		console.log('Setting MAINNET config')
		let config = {
			explorerURI: process.env.EXPLORER_URI,
			mercuryAPI: process.env.MAINNET_MERCURY_API,
			mercuryDb: process.env.MAINNET_MERCURY_DB,
			dbName: process.env.DB_NAME,
			statechains: process.env.MAINNET_STATECHAINS,
			transactions: process.env.MAINNET_TRANSACTIONS,
			batchtransfers: process.env.MAINNET_BATCH_TRANSFERS
		}
		return config
	}
}