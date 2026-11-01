// Protection des espaces privés. L'espace gestion n'est visible que pour le compte admin
// (vérifié ici via le jeton, puis à nouveau en base dans chaque page et route API).
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname.startsWith('/gestion') && req.nextauth.token?.role !== 'ADMIN') {
      return NextResponse.rewrite(new URL('/introuvable', req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: '/connexion' },
  }
)

export const config = { matcher: ['/gestion/:path*', '/compte/:path*'] }
