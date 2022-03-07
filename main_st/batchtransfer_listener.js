const { get, insertOne } = require('./utils/getReqs.js') 

const { functionOnDBs } = require('./utils/dbConnection.js')
const { BTMigration } = require('./utils/bt_utils.js')
const { getConfig } = require('./utils/config.js')

// mongodb config
var MongoClient = require('mongodb').MongoClient;
const pg =  require('pg');

const CONFIG = getConfig()

functionOnDBs(BTMigration)


var client = new pg.Client(CONFIG.mercuryDb).connect(async function(err, client) {
  console.log("Connected to pg!")
  if(err) {
    console.log(err);
  }

  
  //LISTEN to transferbatch table
  var query = client.query("LISTEN transferbatch_changed")
  
  client.on('notification', function(msg) {
	MongoClient.connect(CONFIG.explorerURI, async function (err,db){

		if(err) throw err

		if(msg){
			var id = JSON.parse(msg.payload).record
		}
		try{
			let batchtransfer = await get(CONFIG.mercuryAPI,'info/transfer-batch', id)

			let batchTransferEntry = {
				batch_id: id,
				statechains: batchtransfer.state_chains,
				finalized_at: Date.now()
			}
			console.log('statechains: ',batchTransferEntry.statechains)
			
  			if(batchtransfer.finalized){
  				// Enter new batch transfer entry
                    		await insertOne(db, CONFIG.dbName, CONFIG.batchtransfers, batchTransferEntry, true)
                    		
			}
  						
			}
		catch(err){
			console.log('Error: ', err)
		}				
			})
		})

	
})