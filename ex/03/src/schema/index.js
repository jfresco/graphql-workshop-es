const { GraphQLObjectType, GraphQLSchema, GraphQLString } = require('graphql')

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      items: {
        type: GraphQLString,
        resolve: function () {
          return 'world'
        }
      }
    }
  })
})
