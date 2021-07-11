const {MongoClient} = require('mongodb');
const {client} = require('../db/db');
class AgentModel {
	static collectionName = 'agent_api';
	collectionName = 'agent_api';
	constructor({agent='',key='',client='',hash=''}){
		this.agent = agent;
		this.key = key;
		this.client = client;
		this.hash = hash;
	}

	static async getAgents(query=''){
		query = query!=''?query:{};
		return client.db().collection(this.collectionName).find(query).toArray();
	}
}

module.exports = AgentModel;