// Export all queries from their respective domain files
export * from "./productQueries";
export * from "./cartQueries";
export * from "./userQueries";
export * from "./categoryQueries";
export * from "./orderQueries";

// This pattern allows imports to use from '@/lib/queries' instead of directly
// from each file, while still maintaining separation of concerns
