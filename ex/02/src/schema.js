const { GraphQLObjectType, GraphQLSchema, GraphQLString } = require('graphql')

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: function () {
          return 'world'
        }
      }
    }
  })
})
