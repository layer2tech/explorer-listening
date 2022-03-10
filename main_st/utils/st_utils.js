const {  migrateMercuryDb } = require('./utils')
const { upsertMany } = require('./getReqs.js') 

module.exports = {
	STMigration
}

async function STMigration( client, db ){
	try{
  		const [txArray, scArray] = await migrateMercuryDb(client)
		// Get data for migration
	  	await upsertMany(db,"notifications","statechains_tests", "statechain_id", scArray, false)
	  	await upsertMany(db,"notifications","transactions_tests", "statechain_id", txArray)
	  	// Update/Insert data
  	}
  	catch(err){
  		console.log('Error in migration: ',err)
  	}
}