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
      return getUser(id)
    }
  },
  Item: {
    by ({ by }) {
      return getUser(by)
    },
    kids ({ kids }) {
      return kids.map(getItem)
    },
    type ({ type }) {
      return type.toUpperCase()
    }
  },
  User: {
    submitted ({ submitted }) {
      return submitted.map(getItem)
    }
  }
}

const itemLoader = new DataLoader(ids => Promise.all(ids.map(getItem)))

const topStoriesLoader = new DataLoader(async params => Promise.all(params.map(async ({ page, count } = {}) => {
  const stories = await getTopStories()
  if (page && count) {
    return itemLoader.loadMany(stories.slice(page * count, (page * count) + count))
  }

  return itemLoader.loadMany(stories)
})))

module.exports = makeExecutableSchema({ typeDefs, resolvers })
