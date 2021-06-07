const express = require('express');

const router  = express.Router()
const { addUserController, loginController} = require('../controller/userController');
const {authToken} = require('../middleware/authToken');


router.get('/', (req, res, next) => {
    res.send('Employee api')
})
router.post('/addUser',addUserController);
router.post('/login', loginController);
router.get('/check', authToken , (req, res, next)=>{
	res.send('check');
});
module.exports = router;