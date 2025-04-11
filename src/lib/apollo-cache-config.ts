import {InMemoryCache, makeVar, TypePolicies} from '@apollo/client';

// Reactive variables for client-side state
export const cartItemsVar = makeVar<any[]>([]);
export const isLoggedInVar = makeVar<boolean>(false);
export const currentRegionVar = makeVar<{id: string; name: string}|null>(null);

/**
 * Optimized cache configuration to reduce network requests
 * and improve data consistency.
 */

// Set up type policies for entity merging and cache normalization
const typePolicies: TypePolicies = {
  Query: {
    fields: {
      // Cart field reads from reactive variable
      cart: {
        read() {
          return {
            id: 'client-cart',
            items: {
              edges: cartItemsVar().map(item => ({node: item})),
              decimalTotalPrice: cartItemsVar().reduce(
                  (acc, item) => acc + (item.product.price * item.quantity), 0),
              pageInfo: {hasNextPage: false, endCursor: null}
            }
          };
        }
      },
      // Viewer field policy for auth state
      viewer: {
        read(_, {readField}) {
          if (!isLoggedInVar()) return null;
          // This returns the cached viewer if it exists
          return readField('viewer') || null;
        }
      },
      // Paginated products queries with proper merge
      products: {
        // Merge functions that properly combines paginated results
        merge(existing, incoming, {args}) {
          // On first fetch or when not paginating
          if (!existing || !args) return incoming;

          // For pagination, merge the edges and pageInfo
          const existingEdges = existing.edges || [];
          const incomingEdges = incoming.edges || [];

          return {
            ...incoming,
            edges: [...existingEdges, ...incomingEdges],
          };
        },
        // Read function to handle cache reads with variables
        read(existing, {args, toReference}) {
          if (!existing) return existing;

          // Return full cached result if no pagination args or filtered args
          if (!args?.after) return existing;

          // Filter results based on pagination args
          return {
            ...existing,
            edges: existing.edges.filter((edge: any) => {
              // Filter logic based on args
              return true;  // Add filtering if needed
            })
          };
        }
      }
    }
  },
  // Define key fields for Apollo entities
  Product: {
    keyFields: ['id'],
    fields: {
      // Optimize image loading with default values
      images: {
        read(existing) {
          if (!existing || !existing.length) {
            // Default placeholder image if none exists
            return [{id: 'placeholder', url: '/placeholder.jpg'}];
          }
          return existing;
        }
      }
    }
  },
  Category: {
    keyFields: ['id'],
    fields: {
      // Implement custom cache control for categories
      children: {
        merge(existing, incoming) {
          return incoming;  // Always use latest data for children
        }
      }
    }
  },
  CartItem: {
    keyFields: ['id'],
    fields: {
      quantity: {
        read(existing) {
          return existing || 0;
        }
      }
    }
  },
  // Add pagination handling for connections
  PaginatedProductsResponse: {
    fields: {
      edges: {
        merge(existing = [], incoming = []) {
          return [...existing, ...incoming];
        }
      }
    }
  }
};

// Create a properly configured cache
export const createCache = () => {
  return new InMemoryCache({
    typePolicies,
    possibleTypes: {
      // Define possible interface implementations
      Category: [
        'RootBranchCategory', 'RootLeafCategory', 'NonRootBranchCategory',
        'NonRootLeafCategory'
      ],
      CartItemResult: ['CartItem'],
    },
    // Cache size and expiration configuration
    addTypename: true,  // Always add __typename to improve cache hit rate
  });
};

// Helper function to reset cache for testing or logout
export const resetCache = (cache: InMemoryCache) => {
  cartItemsVar([]);
  isLoggedInVar(false);
  currentRegionVar(null);
  cache.reset();
};

export default createCache;