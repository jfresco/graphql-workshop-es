const request = require('request-promise-native')

const baseURL = 'https://hacker-news.firebaseio.com/v0'

module.exports.getItem = function (id) {
  return request.get(`${baseURL}/item/${id}.json`, { json: true })
}

module.exports.getTopStories = function () {
  return request.get(`${baseURL}/topstories.json`, { json: true })
}

module.exports.getUser = function (id) {
  return request.get(`${baseURL}/user/${id}.json`, { json: true })
}
