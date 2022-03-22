const axios = require('axios')

module.exports = {
	get,
	insertOne,
	updateOne,
	upsertMany,
	deleteAll
}

const TIMEOUT = 20000

const getDbSchema = (db, schema) => {
    var dbSchema = db.db(schema);
    return dbSchema
}

async function get (endpoint, path, params){
    try {
        const url = endpoint + "/" + (path + (Object.entries(params).length === 0 ? "" : "/" + params)).replace(/^\/+/, '');

        const config = {
            method: 'get',
            url: `${url}`,
            headers: { 'Accept': 'application/json' }
        }

        let res = await axios(config)

        let return_data = res.data

        return return_data

    } catch (err) {
      throw err;
    }
}


async function insertOne (db, schema, collectionName, newEntry, close = false ) {
    // MongoDB insert newEntry
    // schema = string name of schema
    // collection = string name of collection
    // newEntry = JSON Object

    var dbSchema = getDbSchema(db,schema)
    await dbSchema.collection(collectionName).insertOne(newEntry, async function (err, res){
        if(err){
            console.log('Error: ', err)
            throw err
        }
        console.log('1 document inserted')
        if(close){ db.close() }
    })
}

async function updateOne (db, schema, collectionName, idObj, newEntry, close = false){
    //update already existing entry
    var dbSchema = getDbSchema(db,schema)
    await dbSchema.collection(collectionName).updateOne(idObj,{ $set: newEntry},{upsert: true}, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
        if( close ){ db.close() }
    });
}

async function upsertMany(db,schema,collectionName, idKey, data, closeDb = true){
	let dbCloseIndicator = 0
	let close = false
	
	console.log('Upserting many...')
	
	await data.map(async item => {
		let idObj = {[idKey]: item[idKey]}
		dbCloseIndicator += 1
		
		if(dbCloseIndicator === data.length){
			if(closeDb){close = true}
		}
		
		await updateOne(db, schema, collectionName, idObj, item, close)
	})
}



async function deleteAll (db, schema, collectionName, closeDb = false){
    //update already existing entry
    var dbSchema = getDbSchema(db,schema)
    dbSchema.collection(collectionName).deleteMany( {} , function(err, res) {
        if (err) throw err;
        console.log("documents deleted");
        if(closeDb){
            db.close();
        }
    });
}