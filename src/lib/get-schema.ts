import {ApolloClient, InMemoryCache} from '@apollo/client';

import {schemaQuery} from './schema-query';

const client = new ApolloClient({
  uri: 'https://api.tovari-kron.ru/v1/graphql',
  cache: new InMemoryCache(),
});

async function getSchema() {
  try {
    const result = await client.query({query: schemaQuery});
    console.log(JSON.stringify(result.data, null, 2));
  } catch (error) {
    console.error('Error fetching schema:', error);
  }
}

getSchema();