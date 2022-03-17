const { insertOne } = require('./utils/getReqs.js') 

const { functionOnDBs } = require('./utils/dbConnection.js')
const { BTMigration } = require('./utils/bt_utils.js')
const { getConfig } = require('./utils/config.js')

// mongodb config
var MongoClient = require('mongodb').MongoClient;
const pg =  require('pg');
const { getBatchTransferById, sortBatchTransfers } = require('./utils/utils.js');

const CONFIG = getConfig()

functionOnDBs(BTMigration)
// Update data with entire DB

console.log("config: ".CONFIG)

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
			console.log('Batch Tx ID Record updated: ',id)

			console.log('Querying DB...')
			let data = await getBatchTransferById(client,id)
			// Query DB for Batch Transfer Data

			console.log('Sorting Data...')
			const btArray = sortBatchTransfers(data.rows)
			// Sort data for explorer db
			
			if(btArray[0]){
				console.log('INSERTED Swap: ',btArray[0])
				await insertOne(db, CONFIG.dbName, CONFIG.batchtransfers, btArray[0], true)
				// insert btArray[0] into explorer DB
			}
  						
			}
		catch(err){
			console.log('Error: ', err)
		}				
			})
		})

	
})