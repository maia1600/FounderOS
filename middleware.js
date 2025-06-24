import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const USERS = {
  TGPT: 'password123',
  Tânia: 'password123',
  Staff: 'password123',
};

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Permitir GET sem autenticação
  if (method === 'GET') {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const [, base64Credentials] = basicAuth.split(' ');
    const credentials = atob(base64Credentials);
    const [user, password] = credentials.split(':');

    if (USERS[user] && USERS[user] === password) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('x-user', user);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  const res = new NextResponse('Autenticação necessária', { status: 401 });
  res.headers.set('www-authenticate', 'Basic realm="TamaiProtected"');
  return res;
}

export const config = {
  matcher: ['/marcacoes'],
};

