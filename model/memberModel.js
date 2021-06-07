const {MongoClient} = require('mongodb');
const {client} = require('../db/db');
class MemberModel {
	constructor({tel_no='',bank_acc_vendor='',bank_acc_no='',first_name='',last_name='',social_source='',pin='',line_id='',status=0,id=0}){
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

	static async getMember(query=''){
		query = query!=''?query:{};
        await client.connect();
		return client.db().collection('user_members').find(query).toArray();
	}

}
module.exports = MemberModel;