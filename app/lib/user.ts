export const DEFAULT_USER = {
name:   'Default Admin',
  email:  'admin@elago.com',
  role:   'Admin',
  avatar: 'A',
} as const;

export type User = typeof DEFAULT_USER;
