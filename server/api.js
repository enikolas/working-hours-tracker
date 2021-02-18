const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schema');

module.exports = (port) => new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const HEADER_REGEX = /Bearer (.*)$/;

    const authorization = req.headers.authorization || '';
    const authorizationHeader = HEADER_REGEX.exec(authorization);
  
    const token = authorizationHeader && authorizationHeader[1];
  
    if (!token) {
      return null;
    }
  
    return { token };
  },
  playground: {
    settings: {
      'editor.theme': 'light',
    },
    tabs: [
      {
        endpoint: `http://127.0.0.1:${process.env.PORT || 3000}/graphql`,
        query: `
mutation signIn($user: String!, $password: String!) {
  signIn(user: $user, password: $password) {
    token
  }
}
        `,
        variables: JSON.stringify({
          user: 'john',
          password: '1234',
        }, null, 2),
      },
    ],
  },
});
