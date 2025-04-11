import { gql } from "@apollo/client";

export const GET_CATEGORIES = gql`
  query GetCategories {
    rootCategories {
      id
      title
      slug
      ... on RootBranchCategory {
        iconUrl
        children {
          id
          title
          slug
        }
      }
      ... on RootLeafCategory {
        iconUrl
      }
    }
  }
`;

export const GET_CATEGORY_BY_SLUG = gql`
  query GetCategoryBySlug($slug: String!) {
    categoryBySlug(slug: $slug) {
      id
      title
      slug
      description
      ... on RootBranchCategory {
        iconUrl
        children {
          id
          title
          slug
        }
      }
      ... on NonRootBranchCategory {
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
        children {
          id
          title
          slug
        }
      }
      ... on RootLeafCategory {
        iconUrl
      }
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
    }
  }
`;

export const GET_FEATURED_CATEGORIES = gql`
  query GetFeaturedCategories {
    featuredCategories {
      id
      title
      slug
      ... on RootBranchCategory {
        iconUrl
      }
      ... on RootLeafCategory {
        iconUrl
      }
    }
  }
`;
