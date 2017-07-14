const express = require('express')
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express')
const bodyParser = require('body-parser')
const schema = require('./schema')

const app = express()

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }))

app.listen(3000, function () {
  console.log('Our Node server is up and running on port 3000!')
})
