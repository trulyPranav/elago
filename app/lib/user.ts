export const DEFAULT_USER = {
  name:   'Rohan Sharma',
  email:  'admin@elago.com',
  role:   'Admin',
  avatar: 'RS',
} as const;

export type User = typeof DEFAULT_USER;
