const jwt = require('jsonwebtoken');

exports.authToken = async (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	try{
		let checked = await jwt.verify(token,"mewSecretToken");
		console.log('token',checked);
		next();
	}catch(err){
		res.status(403).json({
			status:false,
			error:err
		});
	}
	
};