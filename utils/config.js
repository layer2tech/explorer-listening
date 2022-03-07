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
				"port": process.env.MERCURY_DB_PORT
		   },
			dbName: process.env.DB_NAME,
			statechains: process.env.MAINNET_STATECHAINS,
			transactions: process.env.MAINNET_TRANSACTIONS,
			batchtransfers: process.env.MAINNET_BATCH_TRANSFERS
		}
		return config
	}
}


EXPLORER_URI =  "mongodb://Mercury:Dux7MYeVff8xhnLt@108.61.117.115:27017/?retryWrites=true&w=majority"
TESTNET_MERCURY_API = "http://78.141.223.118:32452"
TEST_MERCURY_DB_USER = "mercury"
TEST_MERCURY_DB_HOST = "psql.mercurywallet.io"
TEST_MERCURY_DB_NAME = "test7"
TEST_MERCURY_DB_PASS = "3c6CJe4rg8My8j"
TEST_MERCURY_DB_PORT = 5434
DB_NAME = "notifications"
TESTNET_STATECHAINS = "statechains_tests"
TESTNET_TRANSACTIONS = "transactions_tests"
TESTNET_BATCH_TRANSFERS = "batchtransfers_tests"