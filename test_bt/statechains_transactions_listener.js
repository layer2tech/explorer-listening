const { removeNullValues, encodeSCEAddress, getStatechainsTransactionsByID, sortStatechainsTransactions } = require('./utils/utils.js')
const {  get, updateOne } = require('./utils/getReqs.js')
const { functionOnDBs } = require('./utils/dbConnection.js')
const { STMigration } = require('./utils/st_utils.js')
const { getConfig } = require('./utils/config.js')

const checkNotUndefined = (lib) => {
	if(lib === undefined || lib === null){
		throw Error(`${lib} not found`);
	}
}

// mongodb config
var MongoClient = require('mongodb').MongoClient;
checkNotUndefined(MongoClient);

const pg =  require('pg');
checkNotUndefined(pg);

const CONFIG = getConfig();
checkNotUndefined(CONFIG);

functionOnDBs( STMigration )

console.log("config: ".CONFIG)

var client = new pg.Client(CONFIG.mercuryDb).connect(async function(err, client) {
  console.log("Connected to pg!")

  if(err) {
    console.log(err);
  }
  
  console.log('client value is: ', client);
  
  //LISTEN to statechain table
  var query = client.query("LISTEN statechain_changed")
  
  client.on('notification', function(msg) {
	MongoClient.connect(CONFIG.explorerURI, async function (err,db){
		
		console.log('Connected to MongoDB!')

		if(err) throw err

		if(msg){
			var id = JSON.parse(msg.payload).record
			var operation = JSON.parse(msg.payload).operation
		}
		try{
			console.log('Statechain ID Record updated: ',id)

			console.log('Querying DB...')
			let data = await getStatechainsTransactionsByID(client,id)
			console.log('Sorting Data...')
			const [txArray, scArray] = sortStatechainsTransactions(data.rows)
			console.log('Inserting...')
			
			// //update already existing entry
			let idObj = {"statechain_id": id}
			

			if(scArray[0]){
				console.log('INSERTED Statechains: ', scArray[0])
				await updateOne(db,CONFIG.dbName,CONFIG.statechains, idObj, scArray[0])
			}
			if(txArray[0]){
				console.log('INSERTED Transactions: ', txArray[0])
				await updateOne(db, CONFIG.dbName, CONFIG.transactions, idObj, txArray[0], true)	
			}
			
  						
		}
		catch(err){
			console.log('Error: ', err)
		}				
			})
		})

	
})