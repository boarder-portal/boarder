import { gql } from 'apollo-boost';

export const GET_USER_QUERY = gql`
  query getUser {
    getUser {
      login
    }
  }
`;

export const LOGIN_QUERY = gql`
  mutation login($user: UserLoginInput!) {
    login(user: $user) {
      login
    }
  }
`;

export const REGISTER_QUERY = gql`
  mutation register($user: AddUserInput!) {
    register(user: $user) {
      login
    }
  }
`;
