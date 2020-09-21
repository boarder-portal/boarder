import { gql } from 'apollo-server';

const typeDefs = gql`
  type User {
    login: String!
  }

  input AddUserInput {
    login: String!
    password: String!
  }

  input UserLoginInput {
    login: String!
    password: String!
  }

  type Query {
    getUser: User
  }

  type Mutation {
    register(user: AddUserInput!): User!
    login(user: UserLoginInput!): User!
    logout: Boolean!
  }
`;

export default typeDefs;
