const jwt = require('jsonwebtoken');
const MemberModel = require('../model/memberModel');

exports.listMembersController = async (req, res, next)=>{
	let query = req.body.query||req.query.query;
	let queryStr = typeof query !== 'undefined'?query:'{}';
	let result = await MemberModel.getMember(JSON.parse(queryStr));
	res.send(result);
}

exports.addMembersController = async (req, res, next)=>{
	let {tel_no, bank_acc_vendor, bank_acc_no, first_name, last_name, social_source, pin, line_id} = req.body;

	if(!(tel_no&&bank_acc_vendor&&bank_acc_no&&first_name&&last_name&&social_source&&pin&&line_id)){
		res.status(400).json({
			status:false,
			error:'Fields can not be empty.'
		});
	}
	try{
		const Member = new MemberModel({
	    	tel_no:tel_no,
	    	bank_acc_vendor: bank_acc_vendor,
	    	bank_acc_no: bank_acc_no,
	    	first_name: first_name,
	    	last_name: last_name,
	    	social_source: social_source,
	    	pin: pin,
	    	line_id: line_id,
	    });
	    console.log(Member);
	    let addedMember = await Member.addMember();
	    if(addedMember.result.ok==1){
	    	res.status(201).json({
	            status:true,
	            message:"Member created."
	        });
	    }
	}catch(err){
		res.status(500).json({
			status:false,
			error:err.message
		});
	}

	// console.log(tel_no,first_name,last_name);
	// res.send('Connected');
}