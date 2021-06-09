const express = require('express');

const router  = express.Router()
const {authToken} = require('../middleware/authToken');
const { listMembersController, addMembersController} = require('../controller/memberController');

router.get('/getList',authToken,listMembersController);
router.post('/addMember',authToken,addMembersController);

module.exports = router;