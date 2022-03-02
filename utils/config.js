const CONFIG = require('../settings.json')

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
	// console.log('isTestnet?: ',testnet)
	// console.log(CONFIG)
	if(testnet){
		console.log('setting testnet config')
		let config = {
			explorerURI: CONFIG.explorerURI,
			mercuryAPI: CONFIG.testnet_mercuryAPI,
			mercuryDb: CONFIG.testnet_mercuryDb,
			dbName: CONFIG.dbName,
			statechains: CONFIG.testnet_statechains,
			transactions: CONFIG.testnet_transactions,
			batchtransfers: CONFIG.testnet_batchtransfers
			}
		return config
	}
	else{
		console.log('Setting mainnet config')
		let config = {
			explorerURI: CONFIG.explorerURI,
			mercuryAPI: CONFIG.mainnet_mercuryAPI,
			mercuryDb: CONFIG.mainnet_mercuryDb,
			dbName: CONFIG.dbName,
			statechains: CONFIG.mainnet_statechains,
			transactions: CONFIG.mainnet_transactions,
			batchtransfers: CONFIG.mainnet_batchtransfers
		}
		return config
	}
}