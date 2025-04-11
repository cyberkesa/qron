import {gql} from "@apollo/client";

export const GET_VIEWER = gql`
  query GetViewer {
    viewer {
      id
      name
      emailAddress
      phoneNumber
    }
  }
`;

export const LOGIN = gql`
  mutation Login($emailAddress: String!, $password: String!) {
    logIn(emailAddress: $emailAddress, password: $password) {
      ... on LogInSuccessResult {
        accessToken
        refreshToken
        user {
          id
          name
          emailAddress
        }
      }
      ... on LogInFailureResult {
        errorMessage
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logOut {
      ... on LogOutSuccessResult {
        success
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      ... on RegisterSuccessResult {
        accessToken
        refreshToken
        user {
          id
          name
          emailAddress
        }
      }
      ... on RegisterFailureResult {
        errorMessage
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ... on UpdateProfileSuccessResult {
        user {
          id
          name
          emailAddress
          phoneNumber
        }
      }
      ... on UpdateProfileFailureResult {
        errorMessage
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;
