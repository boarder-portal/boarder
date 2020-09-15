import { ApolloServer } from 'apollo-server-express';

import typeDefs from 'server/graphql/schema';
import resolvers from 'server/graphql/resolvers';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    session: req.session,
  }),
});

export default apolloServer;
