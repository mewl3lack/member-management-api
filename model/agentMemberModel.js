const {MongoClient} = require('mongodb');
const {client} = require('../db/db');
const ObjectId = require('mongodb').ObjectId; 

class AgentMemberModel {
	static collectionName 	= 'agent_member';
	collectionName 			= 'agent_member';
	constructor({member_id='',agent='',username='',password=''}){
		this.member_id = member_id;
		this.agent = agent;
		this.username = username;
		this.password = password;
		this.createAt = new Date();
		this.updateAt = new Date();
	}

	static async getAgentMember(query=''){
		query = query!=''?query:{};
		if(typeof query.id !== 'undefined' && query.id!=''){
			let objId = new ObjectId(query.id);
			await client.connect();
			return client.db().collection(this.collectionName).find({_id:objId}).toArray();
		}else{
			await client.connect();
			return client.db().collection(this.collectionName).find(query).toArray();
		}
        
	}

	async addAgentMemberModel(){
        await client.connect();
        return client.db().collection(this.collectionName).insertOne({
        	member_id:this.member_id,
        	agent:this.agent,
        	username:this.username,
        	password:this.password,
        	createAt:this.createAt,
        	updateAt:this.updateAt
        });
	}
}

module.exports = AgentMemberModel;