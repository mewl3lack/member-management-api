const axios = require('axios');
const TransactionLogModel = require('../model/transactionLogModel');
const MemberModel = require('../model/memberModel');
const AgentModel = require('../model/agentModel');
const AgentMemberModel = require('../model/agentMemberModel');
const redis = require('redis');
const { queueOpts } = require('../queue/queueRedis');
const Queue = require('bull');
const md5 = require('md5');

// const client = redis.createClient(); // this creates a new client By default redis.createClient() will use 127.0.0.1 and port 6379.

const extractRemark = (remark='')=>{
	if(remark.search('KBANK')!=-1){
		let accountNo = remark.split(' ')[2];
		return {accountNo:accountNo.split('X')[1],accountVendor:'KBANK'};
	}else if(remark.search('SCB')!=-1){
		let accountNo = remark.split(' ')[2];
		return {accountNo:accountNo.split('x')[1],accountVendor:'SCB'};
	}else if(remark.search('GSB')!=-1){
		let accountNo = remark.split(' ')[2];
		return {accountNo:accountNo.split('X')[1],accountVendor:'GSB'};
	}
}

exports.checkTransaction = async ()=>{
	try{
		const params = new URLSearchParams();

		let nowDate = new Date();
		nowDate.setSeconds(nowDate.getSeconds()+25200);
		// console.log('nowDate',nowDate.toISOString());

		params.append('startdate', '2021-07-01');
		params.append('enddate', '2021-07-30');
		let transactions = await axios.post('https://ufa56g.com/api_scb.php?id=1&transactions',params);
		if(transactions?.status==200){
			if(transactions.data?.success==1&&transactions.data?.result){
				let transactionLogTop = await TransactionLogModel.getTransaction([],1); // get first transaction log.
				console.log('transactionLogTop',transactionLogTop);
				let transactionCursorDateTime = transactionLogTop.length!=0?transactionLogTop[0].dateTime:null;
				let cursorDate = transactionCursorDateTime?new Date(transactionCursorDateTime):null;
				if(cursorDate){
					cursorDate.setSeconds(cursorDate.getSeconds()+25200); //set time to GMT+7 timezone
				}
				// reverse
				let result = transactions.data?.result.reverse();
				// cut array
				result = transactionCursorDateTime?result.slice(result.findIndex(e=>e.txnDateTime==transactionCursorDateTime)+1,result.length):result;
				
				// console.log('result',result);

				let depositQueue = new Queue('deposit transaction',queueOpts);
				depositQueue.process(depositQueueProcess);
				depositQueue.on('completed',depositQueueComplete);

				result.map((tran)=>{
					let txnDateTime = tran?.txnDateTime;
					let txnDateObj = new Date(txnDateTime);
					txnDateObj.setSeconds(txnDateObj.getSeconds()+25200); //set time to GMT+7 timezone
					let resultDate = null;
					if(cursorDate){
						resultDate = txnDateObj - cursorDate;
					}
					if(resultDate>0||resultDate==null){ // if transaction newer than cursor date or not have cursor date
						depositQueue.add(tran,{ delay: 500 }); //add deposit queue
						console.log('Add queue:'+txnDateTime);
					}

				});
			}else{

			}
		}else{
			throw `Connection is ${transactions?.status}`;
		}
	}catch(err){
		console.error(err.message);
	}

}

const depositQueueProcess = async (job,done)=>{
	// client.on("connect", function() {
	// 	console.log("Redis client connected");
	// });
	// client.on("error", function(err) {
	// 	console.log("Something went wrong " + err);
	// });

	// console.log('job',job.data);

	let checkTransactionLog = await TransactionLogModel.getTransaction([{$match:{dateTime:job.data?.txnDateTime}}]);
	job.progress(15);
	// check tran log

	if(checkTransactionLog.length==0){ // if not exists
		// console.log('job.data?.txnRemark',job.data?.txnRemark);
		let extractRemarkResult = extractRemark(job.data?.txnRemark);
		// console.log('extractRemarkResult',extractRemarkResult);
		job.progress(25);
		//check member
		let checkMember = await MemberModel.getMember({$and:[{bank_acc_vendor:extractRemarkResult.accountVendor},{bank_acc_no:{$regex:`.*${extractRemarkResult.accountNo}`}}]});
		job.progress(35);
		
		if(checkMember.length!=0){
			let memberId = checkMember[0]?._id;
			let date = job.data?.txnDateTime.split('T')[0];
			let transactionLog = new TransactionLogModel({
				type:'DEP',
				status:'Pending',
				bank_acc_vendor_origin:extractRemarkResult.accountVendor,
				bank_acc_no_origin:extractRemarkResult.accountNo,
				bank_acc_vendor_destination:'SCB',
				bank_acc_no_destination:'6192749087',
				user_member_id:memberId,
				amount:job.data?.txnAmount,
				date:date,
				dateTime:job.data?.txnDateTime

			});
			let transactionLogAdded = await transactionLog.addTransactionLog();
			job.progress(45);
			if(transactionLogAdded.result?.ok==1){
				//Add credit
				let addedCredit = await addCredit(memberId,job.data?.txnAmount);
				job.progress(60);
				if(addedCredit){
					let tranLogInsertedId = transactionLogAdded.insertedId;
					let updateTranLogObj = new TransactionLogModel({
						id:tranLogInsertedId,
						status:'COMPLETED'
					});
					let updatedTranLog = await updateTranLogObj.updateTransactionLog();
					job.progress(75);
					if(updatedTranLog?.result?.ok==1){
						job.progress(100);
						done();
					}
					console.log('updatedTranLog',updatedTranLog);
				}
			}else{
				done(new Error('Transaction log cannot insert in DB.'));
			}

			// console.log('transactionLogAdded',transactionLogAdded);
		}else{
			done(new Error('Account no not exists.'));
		}
	}else{
		done(new Error('Transaction log exists.'));
	}


	// add tran log

	//

	// return await executeRedisCommand(client, job);
}

const depositQueueComplete = (job, result) =>{
  console.log("result::", result);
}

// const executeRedisCommand = (client, job) =>
//   new Promise((resolve, reject) => {
//     client.INCR(`${job.data.txnDateTime}`, (error, result) => {
//       resolve(result);
//     });
//   });

 const addCredit = (userId='',amount='')=>{
 	if(userId&&amount){
 		return new Promise(async (resolve, reject)=>{
	 		let agent = await AgentModel.getAgents({}); //get agent
	 		if(agent.length!=0){
	 			//get agent member to add credit
	 			let agentMember = await AgentMemberModel.getAgentMember({$and:[{member_id:userId},{agent:agent[0].agent}]});
	 			// console.log('agentMember',agentMember);
	 			if(agentMember.length!=0){
	 				let md5Hash = md5(`${amount}:${agentMember[0].username}:${agent[0].agent}`);

	 				let depositApi = await axios({
	    				method:'POST',
	    				url:`https://topup-sportbook88.askmebet.io/v0.1/partner/member/deposit/${agent[0].key}/${agentMember[0].username}`,
	    				data:{amount:amount,signature:md5Hash}
	    			});
	    			if(depositApi.status==200&&depositApi.data.code==0){
	    				resolve(true);
	    			}

	 			}else{
		 			reject(new Error('Not have agent member.'));
	 			}
	 		}else{
	 			reject(new Error('Not have agent.'));
	 		}
	 	});
 	}
 }