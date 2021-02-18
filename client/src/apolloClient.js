import { ApolloClient, InMemoryCache } from '@apollo/client';

import { getAuthToken } from './components/authentication/token';

const token = getAuthToken();

const authorizationHeader = token ? `Bearer ${token}` : null;

const apolloClient = new ApolloClient({
  uri: 'http://127.0.0.1:3000/graphql',
  cache: new InMemoryCache(),
  headers: {
    authorization: authorizationHeader
  }
});

export default apolloClient;
