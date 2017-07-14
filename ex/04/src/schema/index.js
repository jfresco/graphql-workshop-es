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
    stories: [Item]
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

    async stories () {
      const stories = await getTopStories()
      return stories.map(getItem)
    },

    user (_, { id }) {
      return getUser(id)
    }
  },
  Item: {
    by: function({ by }) {
      return getUser(by)
    },
    kids: function ({ kids }) {
      return kids.map(getItem)
    },
    type: function({ type }) {
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
