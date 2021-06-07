const express = require('express');

const router  = express.Router()
const {authToken} = require('../middleware/authToken');
const { listEmployeesController} = require('../controller/memberController');

router.get('/getList',authToken,listEmployeesController);

module.exports = router;