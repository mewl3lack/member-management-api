const {MongoClient} = require('mongodb');
const {client} = require('../db/db');
class UserModel {
    constructor({username='', password='', id=0}) {
        this.username = username;
        this.password = password;
        this.id = id;
        this.createAt = new Date();
        this.updateAt = new Date();
    }

    async registerUser() {
        return client.db().collection('user_employees').insertOne({'username':this.username,'password':this.password,'createAt':this.createAt,'updateAt':this.updateAt});
        // return db.execute('INSERT INTO USER (email, password, createAt, updateAt) VALUES(?, ?, ?, ?)',
        // [this.email, this.password, this.createAt, this.updateAt])
    }

    static async findUserByUsername ({username=''}) {
        return client.db().collection('user_employees').find({'username':username}).toArray();
    }

}

module.exports = UserModel;