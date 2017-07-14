const { itemLoader, topStoriesLoader, userLoader } = require('./loaders')

module.exports = {
  item (_, { id }) {
    return itemLoader.load(id)
  },

  async stories (_, { page, count }) {
    return topStoriesLoader.load({ page, count })
  },

  user (_, { id }) {
    return userLoader.load(id)
  }
}
