const { userLoader, itemLoader } = require('./loaders')

module.exports = {
  by ({ by }) {
    return userLoader.load(by)
  },
  kids ({ kids }) {
    return itemLoader.loadMany(kids)
  },
  type ({ type }) {
    return type.toUpperCase()
  }
}
