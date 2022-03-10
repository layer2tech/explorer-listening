const {  migrateBatchTransfers } = require('./utils')
const { upsertMany } = require('./getReqs.js') 

module.exports = {
	BTMigration,
	BTUpdate
}

async function BTMigration(client, db){
	try{
  		const batch = await migrateBatchTransfers(client)
		// Get data for migration
		
	  	await upsertMany(db,"notifications","batchtransfers_tests", "batch_id", batch)
	  	// Update/Insert data
  	}
  	catch(err){
  		console.log('Error in migration: ',err)
  	}
}

async function BTUpdate(msg, client, db){
	if(msg){
		var id = JSON.parse(msg.payload).record
	}
	try{
		let batchtransfer = await get(serverURL,'info/transfer-batch', id)
		
		let batchTransferEntry = {
			batch_id: id,
			statechains: batchtransfer.state_chains,
			finalized_at: Date.now()
		}
		console.log('statechains: ',batchTransferEntry.statechains)
			
  		if(batchtransfer.finalized){
  			// Enter new batch transfer entry
               	await insertOne(db, "test", "batchtransfers", batchTransferEntry, true)
                    		
		}
  						
		}
	catch(err){
		console.log('Error: ', err)
	}
}