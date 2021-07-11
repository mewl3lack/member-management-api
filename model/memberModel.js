const {MongoClient} = require('mongodb');
const {client} = require('../db/db');
const ObjectId = require('mongodb').ObjectId; 
class MemberModel {
	static collectionName = 'user_members';
	collectionName = 'user_members';
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
        return client.db().collection(this.collectionName).insertOne({
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
		if(typeof query?.id !== 'undefined' && query?.id!=''){
			let objId = new ObjectId(query.id);
			return client.db().collection(this.collectionName).find({_id:objId}).toArray();
		}else{			
			if(typeof query?.createAt !== 'undefined' && query?.createAt!=''){
				if(typeof query?.createAt === 'string'){
					query.createAt = new Date(query.createAt);
				}else if(typeof query?.createAt === 'object'){
					for (const property in query?.createAt) {
						query.createAt[property] = new Date(query.createAt[property]);
					}
				}
			}
			if(typeof query?.updateAt !== 'undefined' && query?.updateAt!=''){
				if(typeof query?.updateAt === 'string'){
					query.updateAt = new Date(query.updateAt);
				}else if(typeof query?.updateAt === 'object'){
					for (const property in query?.updateAt) {
						query.updateAt[property] = new Date(query.updateAt[property]);
					}
				}
			}
			return client.db().collection(this.collectionName).find(query).toArray();
		}
        
	}

	async updateMember(){
		if(this._id!=''){
			let objId = new ObjectId(this._id);
			let updateVal = {$set:{}};
			if(this.bank_acc_vendor!=''){
				updateVal['$set']['bank_acc_vendor']=this.bank_acc_vendor;
			}
			if(this.bank_acc_no!=''){
				updateVal['$set']['bank_acc_no']=this.bank_acc_no;
			}
			if(this.first_name!=''){
				updateVal['$set']['first_name']=this.first_name;
			}
			if(this.last_name!=''){
				updateVal['$set']['last_name']=this.last_name;
			}
			if(this.social_source!=''){
				updateVal['$set']['social_source']=this.social_source;
			}
			if(this.pin!=''){
				updateVal['$set']['pin']=this.pin;
			}
			if(this.line_id!=''){
				updateVal['$set']['line_id']=this.line_id;
			}
			if(this.status!=''){
				updateVal['$set']['status']=this.status;
			}
				updateVal['$set']['updateAt']=this.updateAt;
	        return client.db().collection(this.collectionName).updateOne({_id:objId},updateVal);
		}else{
			throw 'Id empty.';
		}
	}

}
module.exports = MemberModel;
