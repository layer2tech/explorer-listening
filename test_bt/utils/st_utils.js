const {  migrateMercuryDb } = require('./utils')
const { upsertMany } = require('./getReqs.js')
const { getConfig } = require('./config.js')

module.exports = {
	STMigration
}

const CONFIG = getConfig()

async function STMigration( client, db ){
	try{
  		const [txArray, scArray] = await migrateMercuryDb(client)
		// Get data for migration
	  	await upsertMany(db,CONFIG.dbName,CONFIG.statechains, "statechain_id", scArray, false)
	  	await upsertMany(db,CONFIG.dbName,CONFIG.transactions, "statechain_id", txArray)
	  	// Update/Insert data
  	}
  	catch(err){
  		console.log('Error in migration: ',err)
  	}
}