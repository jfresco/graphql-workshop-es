const express = require('express')
const bodyParser = require('body-parser')
const { graphql } = require('graphql')
const schema = require('./schema')
const app = express()

app.use(bodyParser.json())

app.get('/hello', function (req, res) {
  res.status(200).send('world!')
})

app.post('/graphql', async function (req, res) {
  const result = await graphql(schema, req.body.query)
  res.send(JSON.stringify(result, null, 2))
})

app.listen(3000, function () {
  console.log('Our Node server is up and running on port 3000! Try http://localhost:3000/hello')
})
