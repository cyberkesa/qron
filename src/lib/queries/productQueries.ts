import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts(
    $after: String
    $first: Int!
    $sortOrder: ProductSortOrder!
    $searchQuery: String
    $categoryId: ID
  ) {
    products(
      after: $after
      first: $first
      sortOrder: $sortOrder
      searchQuery: $searchQuery
      categoryId: $categoryId
    ) {
      edges {
        cursor
        node {
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
            ... on NonRootLeafCategory {
              ancestors {
                id
                title
                slug
              }
              parent {
                id
                title
                slug
              }
            }
            ... on RootLeafCategory {
              iconUrl
            }
          }
          stockAvailabilityStatus
          quantityMultiplicity
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($slug: String!) {
    productBySlug(slug: $slug) {
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
        ... on NonRootLeafCategory {
          ancestors {
            id
            title
            slug
          }
          parent {
            id
            title
            slug
          }
        }
        ... on RootLeafCategory {
          iconUrl
        }
      }
      stockAvailabilityStatus
      quantityMultiplicity
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts(
    $after: String
    $first: Int!
    $sortOrder: ProductSortOrder!
    $searchQuery: String!
  ) {
    products(
      after: $after
      first: $first
      sortOrder: $sortOrder
      searchQuery: $searchQuery
    ) {
      edges {
        cursor
        node {
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
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
