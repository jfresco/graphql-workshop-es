module.exports = `
  type Query {
    item(id: Int!): Item
    stories(page: Int, count: Int): [Item]
    user(id: String!): User
  }
`
