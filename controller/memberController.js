const jwt = require('jsonwebtoken');
const MemberModel = require('../model/memberModel');
const AgentModal = require('../model/agentModel');
const AgentMemberModal = require('../model/agentMemberModel');
const axios = require('axios');
const md5 = require('md5');

exports.listMembersController = async (req, res, next)=>{
	try{
		let query = req.body.query||req.query.query;
		let queryStr = typeof query !== 'undefined'?query:'{}';
		let result = await MemberModel.getMember(JSON.parse(queryStr));
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

exports.addMembersController = async (req, res, next)=>{
	let {tel_no, bank_acc_vendor, bank_acc_no, first_name, last_name, social_source, pin, line_id} = req.body;

	if(!(tel_no&&bank_acc_vendor&&bank_acc_no&&first_name&&last_name&&social_source&&pin&&line_id)){
		res.status(400).json({
			status:false,
			error:'Fields can not be empty.'
		});
	}
	try{
		const checkMemberExist = await MemberModel.getMember({tel_no:tel_no});
		if(checkMemberExist.length==0){
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
		    let addedMember = await Member.addMember();
		    if(addedMember.result.ok==1){
		    	let statusMessages = [];
		    	let agents = await AgentModal.getAgents();
		    	await Promise.all(
		    		agents.map(async agent=>{
		    			let md5Hash = md5(`${tel_no}:${pin}:${agent.agent}`);
		    			let createdApi = await axios({
		    				method:'POST',
		    				url:`https://topup-sportbook88.askmebet.io/v0.1/partner/member/create/${agent.key}`,
		    				data:{memberLoginName:tel_no,memberLoginPass:pin,signature:md5Hash}
		    			});
		    			if(createdApi.status!=200||createdApi.data.code!=0){
		    				statusMessages.push(`Agent:${agent.agent} create failed.`);
		    			}else{
		    				let agentMember = new AgentMemberModal({
		    					member_id:addedMember.insertedId,
		    					agent:agent.agent,
		    					username:createdApi.data.result.username,
		    					password:pin
		    				});
		    				await agentMember.addAgentMemberModel();
		    				statusMessages.push(`Agent:${agent.agent} create success.`);
		    			}
		    		})
		    	);
		    	res.status(201).json({
		            status:true,
		            message:statusMessages
		        });
		    }
		}else{
			res.status(500).json({
				status:false,
				error:'Telephone no. exists.'
			});
		}
	}catch(err){
		res.status(500).json({
			status:false,
			error:err.message
		});
	}
}

exports.updateMemberController = async (req, res, next)=>{
	let { id, bank_acc_vendor, bank_acc_no, first_name, last_name, social_source, pin, line_id} = req.body;
	let updateVal = {};
	if(typeof id !=='undefined'&&id!=''){
		try{
			updateVal['id'] = id;
			if(typeof bank_acc_vendor !=='undefined'&&bank_acc_vendor!=''){
				updateVal['bank_acc_vendor'] = bank_acc_vendor;
			}
			if(typeof bank_acc_no !=='undefined'&&bank_acc_no!=''){
				updateVal['bank_acc_no'] = bank_acc_no;
			}
			if(typeof first_name !=='undefined'&&first_name!=''){
				updateVal['first_name'] = first_name;
			}
			if(typeof last_name !=='undefined'&&last_name!=''){
				updateVal['last_name'] = last_name;
			}
			if(typeof social_source !=='undefined'&&social_source!=''){
				updateVal['social_source'] = social_source;
			}
			if(typeof pin !=='undefined'&&pin!=''){
				updateVal['pin'] = pin;
			}
			if(typeof line_id !=='undefined'&&line_id!=''){
				updateVal['line_id'] = line_id;
			}
			const Member = new MemberModel(updateVal);
			let updateMember = await Member.updateMember();
			if(updateMember.result.ok==1){
				res.status(200).json({
					status:true,
					message:`${id} Updated.`
				});
			}else{
				res.status(500).json({
					status:false,
					error:'Cannot update member.'
				});
			}
		}catch(err){
			res.status(500).json({
				status:false,
				error:err.message
			});
		}
	}else{
		res.status(400).json({
			status:false,
			error:'Id empty.'
		});
	}
}