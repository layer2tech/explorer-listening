const { getConfig } = require('./config.js')

module.exports = {
	functionOnDBs,
	listenToDBs
}

// mongodb config
var MongoClient = require('mongodb').MongoClient;
const pg =  require('pg');

const CONFIG = getConfig()

async function functionOnDBs( dbFunction ){
// dbFunction: type: async function - function on db that accepts client & db as args
	var client = new pg.Client(CONFIG.mercuryDb).connect(async function(err, client) {
  		console.log("Connected to pg!")
 		if(err) {
    		console.log(err);
  		}
  	
  
		MongoClient.connect(CONFIG.explorerURI, async function (err,db){
			
			if(err) throw err
			
			await dbFunction(client,db)
			//await deleteAll(db, 'test', 'batchtransfers')
			})

	
	})
}


async function listenToDBs( listenFunc, dbFunction ){
// listenFunc: type: str - name of trigger function on DB
// dbFunction: type: async function - function on db that accepts msg, client & db as args

	var client = new pg.Client(CONFIG.mercuryDb).connect(async function(err, client) {
  		console.log("Connected to pg!")
 		if(err) {
    		console.log(err);
  		}
  		
  		 //LISTEN to transferbatch table
  		var query = client.query(`LISTEN ${listenFunc}`)
  	
  		client.on('notification', function(msg) {
			MongoClient.connect(CONFIG.explorerURI, async function (err,db){
				
				if(err) throw err
				
				await dbFunction(msg, client,db)
				})
			})
	})
}
