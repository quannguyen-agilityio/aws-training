/**
 * Application Navigation Routes Constants.
 */
export const ROUTES = {
  HOME: '/',
  ADMIN: '/admin',
} as const;

/**
 * Union type of all valid application route paths.
 */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
