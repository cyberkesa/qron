import { gql } from "@apollo/client";

export const GET_ORDERS = gql`
  query GetOrders {
    viewer {
      orders {
        id
        number
        status
        createdAt
        totalPrice
        items {
          id
          product {
            id
            name
            images {
              id
              url
            }
          }
          quantity
          price
        }
        shippingAddress {
          id
          fullName
          street
          city
          region
          postalCode
          phoneNumber
        }
      }
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      number
      status
      createdAt
      totalPrice
      items {
        id
        product {
          id
          name
          price
          images {
            id
            url
          }
          slug
        }
        quantity
        price
      }
      shippingAddress {
        id
        fullName
        street
        city
        region
        postalCode
        phoneNumber
      }
      paymentMethod
      shippingMethod
    }
  }
`;

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      ... on CreateOrderSuccessResult {
        order {
          id
          number
          status
          totalPrice
        }
      }
      ... on CreateOrderFailureResult {
        errorMessage
      }
      ... on UnexpectedError {
        message
      }
    }
  }
`;
