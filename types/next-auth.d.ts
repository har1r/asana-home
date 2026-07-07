/**
 * types/next-auth.d.ts
 *
 * Module augmentation for next-auth to formally declare `id` and `role`
 * on Session.user, User, and JWT using the strongly-typed UserRoleType
 * instead of a loose `string`.
 *
 * This eliminates all `(session.user as any).role` and `(token as any).id`
 * casts that previously silenced the TypeScript compiler.
 */

import { DefaultSession, DefaultUser } from 'next-auth';
import { UserRoleType } from '@/lib/constants';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRoleType;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: UserRoleType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRoleType;
  }
}
