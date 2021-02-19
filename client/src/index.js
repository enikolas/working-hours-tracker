import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/client';

import Main from './components/Main';
import apolloClient from './apolloClient';

import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <ApolloProvider client={apolloClient}>
    <Main />
  </ApolloProvider>,
  document.getElementById('root')
);

reportWebVitals();
