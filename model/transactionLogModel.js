const {MongoClient} = require('mongodb');
const {client} = require('../db/db');
const ObjectId = require('mongodb').ObjectId; 

class TransactionLogModel {
	static collectionName = 'transaction_log';
	collectionName = 'transaction_log';
	constructor({
		id='',
		type='',
		status='',
		bank_acc_vendor_origin='',
		bank_acc_no_origin='',
		bank_acc_vendor_destination='',
		bank_acc_no_destination='',
		user_member_id='',
		amount='',
		date='',
		dateTime=''
	}){
		this._id = id;
		this.type = type;
		this.status = status;
		this.bank_acc_vendor_origin = bank_acc_vendor_origin;
		this.bank_acc_no_origin = bank_acc_no_origin;
		this.bank_acc_vendor_destination = bank_acc_vendor_destination;
		this.bank_acc_no_destination = bank_acc_no_destination;
		this.user_member_id = user_member_id;
		this.amount = amount;
		this.date = date;
		this.dateTime = dateTime;
	}

	setStatus(status=''){
		if(status!=''){
			this.status=status;
		}else{
			throw new Error('Status empty.');
		}
	}

	setId(id=''){
		if(id!=''){
			this._id=id;
		}else{
			throw new Error('Id empty.');
		}
	}

	async addTransactionLog(){
		await client.connect();
		return client.db().collection(this.collectionName).insertOne({
        	'type':this.type,
        	'status':this.status,
        	'bank_acc_vendor_origin':this.bank_acc_vendor_origin,
        	'bank_acc_no_origin':this.bank_acc_no_origin,
        	'bank_acc_vendor_destination':this.bank_acc_vendor_destination,
        	'bank_acc_no_destination':this.bank_acc_no_destination,
        	'user_member_id':this.user_member_id,
        	'amount':this.amount,
        	'date':this.date,
        	'dateTime':this.dateTime,
        	'createAt':new Date(),
        	'updateAt':new Date(),
        });
	}

	async updateTransactionLog(){
		if(this._id!=''){
			await client.connect();
			let objId = new ObjectId(this._id);
			console.log('objId',objId);
			let updateVal = {$set:{}};
			if(this.type!=''){
				updateVal['$set']['type']=this.type;
			}
			if(this.status!=''){
				updateVal['$set']['status']=this.status;
			}
			if(this.bank_acc_vendor_origin!=''){
				updateVal['$set']['bank_acc_vendor_origin']=this.bank_acc_vendor_origin;
			}
			if(this.bank_acc_no_origin!=''){
				updateVal['$set']['bank_acc_no_origin']=this.bank_acc_no_origin;
			}
			if(this.bank_acc_vendor_destination!=''){
				updateVal['$set']['bank_acc_vendor_destination']=this.bank_acc_vendor_destination;
			}
			if(this.bank_acc_no_destination!=''){
				updateVal['$set']['bank_acc_no_destination']=this.bank_acc_no_destination;
			}
			if(this.user_member_id!=''){
				updateVal['$set']['user_member_id']=this.user_member_id;
			}
			if(this.amount!=''){
				updateVal['$set']['amount']=this.amount;
			}
			if(this.date!=''){
				updateVal['$set']['date']=this.date;
			}
			if(this.dateTime!=''){
				updateVal['$set']['dateTime']=this.dateTime;
			}
			updateVal['$set']['updateAt'] = new Date();
	        return client.db().collection(this.collectionName).updateOne({_id:objId},updateVal);
		}else{
			throw 'Id empty.';
		}
	}

	static async getTransaction(query='',limit=0){
		query = query!=''?query:[{$match:{}}];
		console.log(query);
		let $match = query.filter(row=>row?.$match)[0];
		let $lookup = query.filter(row=>row?.$lookup)[0];
		try{
			if(typeof $match?.$match?.id !== 'undefined' && $match?.$match?.id!=''){
				let objId = new ObjectId($match.$match.id);
				$match.$match._id = objId;
				let queryArr = [];
				delete $match.$match?.id;
				queryArr.push($match);
				if(typeof $lookup !== 'undefined')queryArr.push($lookup);
				await client.connect();
				return client.db().collection(this.collectionName).aggregate(queryArr).toArray();
			}else{
				if(typeof $match?.$match?.user_member_id !== 'undefined' && $match?.$match?.user_member_id!=''){
					let memberObjId = new ObjectId($match.$match.user_member_id);
					$match.$match.user_member_id = memberObjId;
				}
				let queryArr = [];
				queryArr.push($match);
				if(typeof $lookup !== 'undefined')queryArr.push($lookup);
				console.log(queryArr);
				await client.connect();
				if(limit!=0){
					return client.db().collection(this.collectionName).aggregate(queryArr).limit(limit).toArray();
				}else{
					return client.db().collection(this.collectionName).aggregate(queryArr).toArray();
				}
			}
		}catch(err){
			throw err;
		}
	}

}

module.exports = TransactionLogModel;