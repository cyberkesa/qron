import {gql} from "@apollo/client";

export const GET_CART = gql`
  query GetCart {
    cart {
      id
      items(first: 100) {
        edges {
          node {
            id
            product {
              id
              name
              description
              price
              images {
                id
                url
              }
              slug
              category {
                id
                title
                slug
              }
              stockAvailabilityStatus
              quantityMultiplicity
            }
            quantity
          }
        }
        decimalTotalPrice
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!, $quantity: Int!) {
    updateCartItemQuantity(productId: $productId, quantity: $quantity) {
      ... on UpdateCartItemQuantitySuccessResult {
        cart {
          id
          items(first: 100) {
            edges {
              node {
                id
                product {
                  id
                  name
                  price
                }
                quantity
              }
            }
            decimalTotalPrice
          }
        }
      }
      ... on UpdateCartItemQuantityFailureResult {
        errorMessage
      }
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($productId: ID!) {
    updateCartItemQuantity(productId: $productId, quantity: 0) {
      ... on UpdateCartItemQuantitySuccessResult {
        cart {
          id
          items(first: 100) {
            edges {
              node {
                id
                product {
                  id
                  name
                  price
                }
                quantity
              }
            }
            decimalTotalPrice
          }
        }
      }
      ... on UpdateCartItemQuantityFailureResult {
        errorMessage
      }
    }
  }
`;
