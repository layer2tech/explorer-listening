const { removeNullValues, encodeSCEAddress } = require('./utils/utils.js')
const {  get, updateOne } = require('./utils/getReqs.js')
const { functionOnDBs } = require('./utils/dbConnection.js')
const { STMigration } = require('./utils/st_utils.js')
const { getConfig } = require('./utils/config.js')

const checkNotUndefined = () => {
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
			console.log('This is the ID',id)
			let statechain = await get(CONFIG.mercuryAPI,'info/statechain', id)
			let statecoin = await get(CONFIG.mercuryAPI,'info/statecoin', id)

			let statechainEntry = {
				statechain_id: id,
				txid_vout: statechain.utxo,
				amount: statechain.amount,
				chain: statechain.chain,
				locktime: statechain.locktime,
				confirmed: statechain.confirmed,
				updated_at: Date.now(),
			}
			console.log('SC entry: ',statechain)		
			
			let transactionEntry = {
				statechain_id: id,
				txid_vout: statechain.utxo,
				amount: statechain.amount,
				address: statecoin?.statecoin?.data? encodeSCEAddress(statecoin.statecoin.data, true) : null,
				event: null,
				locktime: statechain.locktime,
				inserted_at: Date.now()
			}
			console.log('transactionEntry: ', statecoin)
			//add address
			

			//update already existing entry
			let idObj = {"statechain_id": id}
			if(operation === "UPDATE" && statechainEntry.amount !== 0){
				transactionEntry.event = "TRANSFER"
			}
			
			if(statechainEntry.amount === 0 ){
			
				console.log('WITHDRAWAL IN ACTION AMOUNT IS 0')
				transactionEntry.event = "WITHDRAWAL"
				
				// removing txid as they are incorrect on withdrawal
				// update made via statechain id, txid doesn't change so no need to be updated
				transactionEntry.txid_vout = null
				transactionEntry.amount = null
				
				statechainEntry.txid_vout = null
				statechainEntry.amount = null
			}
			if(operation === "INSERT"){
				transactionEntry.event = "DEPOSIT"
			}

			statechainEntry = removeNullValues(statechainEntry)
			transactionEntry = removeNullValues(transactionEntry)

			console.log('submit sc : ', statechainEntry)
			console.log('submit t :', transactionEntry)
			

			await updateOne(db,CONFIG.dbName,CONFIG.statechains, idObj, statechainEntry)
			await updateOne(db, CONFIG.dbName, CONFIG.transactions, idObj, transactionEntry, true)	
  						
		}
		catch(err){
			console.log('Error: ', err)
		}				
			})
		})

	
})
		