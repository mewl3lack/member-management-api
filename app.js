const express = require('express')
const bodyParser = require('body-parser')

const cron = require('node-cron');
const Arena = require('bull-arena');
const Bull = require('bull');

const app = express();

const user = require('./route/user')
const member = require('./route/member')
const transactionLog = require('./route/transactionLog')
const { checkTransaction } = require('./job/checkTransactionJob');

const {client} = require('./db/db');

app.use(bodyParser.urlencoded({extended:false}))

app.use('/api/employee', user)

app.use('/api/member', member)

app.use('/api/transactionLog', transactionLog)

cron.schedule('*/5 * * * * *', function() {
  checkTransaction();
});


app.use('/api',
Arena(
    {
    	Bull,
      queues: [
        {
          name: "deposit transaction",
          hostId: "Worker",
          redis: {
            host: "0.0.0.0",
            port: 6379
          }
        }
      ]
    },
    {
      basePath: "/arena",
      disableListen: false
    }
  )
);
client.connect(() => {
    app.listen(3001, () => {
        console.log('running at 3001')
    })
});