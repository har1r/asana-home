import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

async function authHandler(req: any, ctx: any) {
  const params = await ctx.params;
  return handler(req, { ...ctx, params });
}

export { authHandler as GET, authHandler as POST };

