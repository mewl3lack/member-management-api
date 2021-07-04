const express = require('express');

const router  = express.Router()
const {authToken} = require('../middleware/authToken');
const { listTransactionLogController } = require('../controller/transactionLogController');

router.get('/getList',authToken,listTransactionLogController);

module.exports = router;