// Canonical export surface for GraphQL operations
// Note: Use the consolidated queries until domain modules are unified
export * from '../queries';

// This pattern allows imports to use from '@/lib/queries' instead of directly
// from each file, while still maintaining separation of concerns
