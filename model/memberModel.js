const {MongoClient} = require('mongodb');
const {client} = require('../db/db');
const ObjectId = require('mongodb').ObjectId; 
class MemberModel {
	constructor({tel_no='',bank_acc_vendor='',bank_acc_no='',first_name='',last_name='',social_source='',pin='',line_id='',status=1,id=0}){
		this._id=id;
		this.tel_no=tel_no;
		this.bank_acc_vendor=bank_acc_vendor;
		this.bank_acc_no=bank_acc_no;
		this.first_name=first_name;
		this.last_name=last_name;
		this.social_source=social_source;
		this.pin=pin;
		this.line_id=line_id;
		this.status=status;
		this.createAt = new Date();
		this.updateAt = new Date();
	}

	async addMember(){
        await client.connect();
        return client.db().collection('user_members').insertOne({
        	'tel_no':this.tel_no,
        	'bank_acc_vendor':this.bank_acc_vendor,
        	'bank_acc_no':this.bank_acc_no,
        	'first_name':this.first_name,
        	'last_name':this.last_name,
        	'social_source':this.social_source,
        	'pin':this.pin,
        	'line_id':this.line_id,
        	'status':this.status,
        	'createAt':this.createAt,
        	'updateAt':this.updateAt,
        });

	}

	static async getMember(query=''){
		query = query!=''?query:{};
		if(typeof query.id !== 'undefined' && query.id!=''){
			let objId = new ObjectId(query.id);
			await client.connect();
			return client.db().collection('user_members').find({_id:objId}).toArray();
		}else{
			await client.connect();
			return client.db().collection('user_members').find(query).toArray();
		}
        
	}

}
module.exports = MemberModel;
