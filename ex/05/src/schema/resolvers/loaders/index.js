const DataLoader = require('dataloader')
const { getItem, getUser, getTopStories } = require('../../../hnclient')

const itemLoader = new DataLoader(ids => Promise.all(ids.map(getItem)))

const allTopStoriesLoader = new DataLoader(keys => Promise.all(keys.map(getTopStories)))

const topStoriesLoader = new DataLoader(async params => Promise.all(params.map(async ({ page, count } = {}) => {
  const stories = await allTopStoriesLoader.load('all')
  return itemLoader.loadMany(page && count
    ? stories.slice(page * count, (page * count) + count)
    : stories)
})))

const userLoader = new DataLoader(ids => Promise.all(ids.map(getUser)))

module.exports = {
  itemLoader,
  allTopStoriesLoader,
  topStoriesLoader,
  userLoader
}
