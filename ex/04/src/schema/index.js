const { makeExecutableSchema } = require('graphql-tools')
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
    title: String!
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
      return getItem(id)
    },

    async stories (_, { page, count }) {
      const stories = await getTopStories()
      if (page && count) {
        return stories
          .slice(page * count, (page * count) + count)
          .map(getItem)
      }

      return stories.map(getItem)
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

module.exports = makeExecutableSchema({ typeDefs, resolvers })
