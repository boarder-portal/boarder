import { gql } from 'apollo-server';

const typeDefs = gql`
  type Company {
    name: String!
  }

  type Query {
    getCompany(name: String!): Company!
  }
`;

export default typeDefs;
