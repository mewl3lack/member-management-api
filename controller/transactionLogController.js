const TransactionLogModel = require('../model/transactionLogModel');

exports.listTransactionLogController = async (req, res, next)=>{
	try{
		let query = req.body.query||req.query.query;
		let queryStr = typeof query !== 'undefined'?query:'{}';
		let result = await TransactionLogModel.getTransaction(JSON.parse(queryStr));
		res.status(200).json({
			status:true,
			result:result
		});
	}catch(err){
		res.status(500).json({
			status:false,
			error:err.message
		});
	}
}