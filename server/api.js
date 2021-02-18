const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schema');
const { authenticate } = require('./authentication');

module.exports = (port) => new ApolloServer({
  typeDefs,
  resolvers,
  context: authenticate,
  playground: {
    settings: {
      'editor.theme': 'light',
    },
    tabs: [
      {
        endpoint: `http://127.0.0.1:${process.env.PORT || 3000}/graphql`,
        query: `
{
  health {
    version
  }
}
        `,
      },
    ],
  },
});
