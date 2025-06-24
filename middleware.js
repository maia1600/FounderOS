import { NextResponse } from 'next/server';

const validUsers = {
  TGPT: 'tamai123',
  Tânia: 'tamai123',
  Staff: 'tamai123',
};

export function middleware(req) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new Response('Authentication Required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="TAMAI Access"',
      },
    });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const [username, password] = atob(base64Credentials).split(':');

  if (!validUsers[username] || validUsers[username] !== password) {
    return new Response('Invalid Credentials', {
      status: 403,
    });
  }

  // Autenticação válida: adiciona cabeçalho personalizado
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-resolved', username);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Aplica o middleware apenas nas rotas de API
export const config = {
  matcher: ['/api/:path*'],
};
