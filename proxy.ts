import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    // Protect all routes except auth endpoints, login page, and static resources
    '/((?!api/auth|login|_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
