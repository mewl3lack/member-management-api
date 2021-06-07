const jwt = require('jsonwebtoken');
const MemberModel = require('../model/memberModel');

exports.listEmployeesController = async (req, res, next)=>{
	let query = req.body?.query||req.query?.query;
	let queryStr = typeof query !== 'undefined'?query:'{}';
	let result = await MemberModel.getMember(JSON.parse(queryStr));
	res.send(result);
}