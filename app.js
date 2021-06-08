const express = require('express')
const bodyParser = require('body-parser')

const app = express();

const user = require('./route/user')
const member = require('./route/member')
app.use(bodyParser.urlencoded({extended:false}))

app.use('/api/employee', user)

app.use('/api/member', member)

app.listen(3001, () => {
    console.log('running at 3001')
})