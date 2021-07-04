const TransactionLogModel = require('../model/transactionLogModel');

exports.listTransactionLogController = async (req, res, next)=>{
	let query = req.body.query||req.query.query;
	let queryStr = typeof query !== 'undefined'?query:'{}';
	let result = await TransactionLogModel.getTransaction(JSON.parse(queryStr));
	res.send(result);
}