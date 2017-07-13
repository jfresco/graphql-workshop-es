const express = require('express')
const bodyParser = require('body-parser')
const { graphql } = require('graphql')

const { getTopStories, getItem, getUser } = require('./hnclient')
const schema = require('./schema')

const app = express()

app.use(bodyParser.json())

app.post('/graphql', async function (req, res) {
  const result = await graphql(schema, req.body.query)
  res.send(JSON.stringify(result, null, 2))
})

app.get('/test', async function (req, res, next) {
  try {
    const stories = await getTopStories()
    // Tomo el ID de la primer story y obtengo todos sus datos
    const story = await getItem(stories[0])
    // y de esa story obtengo el autor y todos sus datos
    const author = await getUser(story.by)
    res.status(200).send({
      stories,
      story,
      author
    })
  } catch (e) {
    next(e)
  }
})

app.listen(3000, function () {
  console.log('Our Node server is up and running on port 3000!')
})
