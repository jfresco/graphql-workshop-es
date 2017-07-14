const { makeExecutableSchema } = require('graphql-tools')
const DataLoader = require('dataloader')
const { getItem, getUser, getTopStories } = require('../hnclient')

const typeDefs = [`
  type User {
    about: String
    created: Int
    delay: Int,
    id: String!
    karma: Int!
    submitted: [Item]
  }

  enum ITEM_TYPE {
    JOB
    STORY
    COMMENT
    POLL
    POLLOPT
  }

  type Item {
    id: Int!
    by: User!
    kids: [Item]
    score: Int!
    time: Int
    title: String
    type: ITEM_TYPE
    url: String
    text: String
    dead: Boolean
  }

  type Query {
    item(id: Int!): Item
    stories(page: Int, count: Int): [Item]
    user(id: String!): User
  }

  schema {
    query: Query
  }
`]

const resolvers = {
  Query: {
    item (_, { id }) {
      return itemLoader.load(id)
    },

    async stories (_, { page, count }) {
      return topStoriesLoader.load({ page, count })
    },

    user (_, { id }) {
      return userLoader.load(id)
    }
  },
  Item: {
    by ({ by }) {
      return userLoader.load(by)
    },
    kids ({ kids }) {
      return itemLoader.loadMany(kids)
    },
    type ({ type }) {
      return type.toUpperCase()
    }
  },
  User: {
    submitted ({ submitted }) {
      return itemLoader.loadMany(submitted.slice(0, 10))
    }
  }
}

const itemLoader = new DataLoader(ids => Promise.all(ids.map(getItem)))

const allTopStoriesLoader = new DataLoader(keys => Promise.all(keys.map(getTopStories)))

const topStoriesLoader = new DataLoader(async params => Promise.all(params.map(async ({ page, count } = {}) => {
  const stories = await allTopStoriesLoader.load('all')
  return itemLoader.loadMany(page && count
    ? stories.slice(page * count, (page * count) + count)
    : stories)
})))

const userLoader = new DataLoader(ids => Promise.all(ids.map(getUser)))

module.exports = makeExecutableSchema({ typeDefs, resolvers })
