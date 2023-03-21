require('dotenv').config()

module.exports = {
	getConfig,
	getArgsHasTestnet
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
			mercuryDb: {
				"user": process.env.TEST_MERCURY_DB_USER,
				"host": process.env.TEST_MERCURY_DB_HOST,
				"database": process.env.TEST_MERCURY_DB_NAME,
				"password": process.env.TEST_MERCURY_DB_PASS,
				"port": process.env.TEST_MERCURY_DB_PORT
		   },
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
			mercuryDb: {
				"user": process.env.MERCURY_DB_USER,
				"host": process.env.MERCURY_DB_HOST,
				"database": process.env.MERCURY_DB_NAME,
				"password": process.env.MERCURY_DB_PASS,
				"port": process.env.MERCURY_DB_PORT,
				"ssl": true
		   },
			dbName: process.env.DB_NAME,
			statechains: process.env.MAINNET_STATECHAINS,
			transactions: process.env.MAINNET_TRANSACTIONS,
			batchtransfers: process.env.MAINNET_BATCH_TRANSFERS
		}
		return config
	}
}
