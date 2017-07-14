module.exports = `
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
`
