const { itemLoader } = require('./loaders')

module.exports = {
  submitted ({ submitted }) {
    return itemLoader.loadMany(submitted.slice(0, 10))
  }
}
