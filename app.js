const express = require('express')
const bodyParser = require('body-parser')

const app = express();

const user = require('./route/user')
app.use(bodyParser.urlencoded({extended:false}))

app.use('/api', user)

app.listen(3000, () => {
    console.log('running at 3000')
})