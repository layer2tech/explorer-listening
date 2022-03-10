const { bech32 } = require('bech32')
const { getArgsHasTestnet } = require('./config.js')

module.exports = {
	encodeSCEAddress,
	isBTC,
	removeNullValues,
	getAllStatechainsTransactions,
	getAllBatchTransfers,
	migrateBatchTransfers,
	migrateMercuryDb
}


function removeNullValues (obj){
	var removedNulls = obj
	Object.keys(removedNulls).forEach(key => {
	        if (obj[key] === null || obj[key] === undefined) {
	        delete obj[key];
        }
	});
	return removedNulls
}

const getDbSchema = (db, schema) => {
    var dbSchema = db.db(schema);
    return dbSchema
}

function encodeSCEAddress(proof_key, testnet = false){
	if(proof_key.substring(0,2) === 'tb' || proof_key.substring(0,2)=== 'bc'){
		return proof_key
	}
	let prefix
	if(getArgsHasTestnet()){
		prefix = 'tc'
	}
	else{
		prefix = 'sc'
	}
	
  	let words = bech32.toWords(Buffer.from(proof_key, 'hex'))
  	
  	return bech32.encode(prefix, words)
}

function isBTC(address){
	console.log('isBTC',address)
	if(address){
		let prefix = address.substring(0,2)
	
		if(prefix === 'tb' || prefix === 'bc'){
			return 'WITHDRAWAL'
		}
		else{
			return 'TRANSFER'
		}
	}
	else{ return null }
}

async function migrateMercuryDb(client){
	try{
  
	  	let data = await getAllStatechainsTransactions(client)
	  	const [txArray, scArray] = sortStatechainsTransactions(data.rows)
	  	return [txArray, scArray]

	} catch(e){
		console.log('Error: ', e)
	}
}

async function migrateBatchTransfers(client){
	try{
		let data = await getAllBatchTransfers(client)
		const btArray = sortBatchTransfers(data.rows)
		return btArray
	}catch(err){
		console.log('Error: ', err)
	}
}

async function getAllStatechainsTransactions(client){
    let dbSC = "statechainentity.statechain"
    let dbUS = "statechainentity.usersession"
    return await client.query(`SELECT ${dbSC}.id as statechain_id,
        ${dbSC}.amount, 
        ${dbSC}.lockeduntil as locktime,
        ${dbSC}.chain,
        ${dbSC}.confirmed,
        ${dbUS}.txbackup,
        ${dbUS}.txwithdraw 
        FROM ${dbSC}
        INNER JOIN ${dbUS} 
        ON ${dbSC}.ownerid = ${dbUS}.id
        AND ${dbSC}.confirmed = true`)
}

async function getAllBatchTransfers(client){

    return await client.query(`SELECT id as batch_id, statechains 
        FROM statechainentity.transferbatch
        WHERE finalized = true`)
}

function sortBatchTransfers(data){
	const btArray = []
	
	data.map( item => {
		btArray.push({
			batch_id: item.batch_id,
			statechains: JSON.parse(item.statechains),
			finalized_at: Date.now()
		})
	})
	
	return btArray
}


function sortStatechainsTransactions(data){
    const txArray = []
    const scArray = []

    data.map(item => {
        try{
         	var statechain_id = item.statechain_id
	
         	var chain = JSON.parse(item.chain).chain
         	var locktime = item.locktime
         	var confirmed = item.confirmed
         	var txBackup = JSON.parse(item.txbackup)
         	let amount
        	
   
		
        	if(item.txwithdraw){
        		let txWithdraw = JSON.parse(item.txwithdraw)
        		var event = "WITHDRAWAL"
        	        var txid_vout = txWithdraw.input[0].previous_output
        		var address = chain[chain.length - 1].data
                	amount = 0

                	txBackup.output.map(output => { 	
                		amount += output.value 
                	})
                	
                	// Output total fee
                	amount += 141
                	// Add withdrawal fee

            	} else{
                // Add event DEPOSIT or TRANSFER
                	var txid_vout = txBackup.input[0].previous_output
                	var address = encodeSCEAddress(chain[chain.length-1].data)
                	amount = parseInt(item.amount)
                	if(chain[0].next_state === null){
                		var event = "DEPOSIT"
                	}
                	else{
                    		var event = "TRANSFER"
                	}

            	}
            let statechain = {
                statechain_id: statechain_id,
                txid_vout: txid_vout,
                amount: amount,
                chain: chain,
                locktime: locktime,
                confirmed: confirmed,
                updated_at: Date.now()
            }

            let transaction = {
                statechain_id: statechain_id,
                txid_vout:txid_vout,
                amount: amount,
                address: address,
                event: event,
                locktime: locktime,
                inserted_at: Date.now()
            }

            txArray.push(transaction)
            scArray.push(statechain)

        } catch(err){
            console.log('ERROR sortStatechainsTransactions: ', err)
        }
    
    })

    return [txArray, scArray]
}