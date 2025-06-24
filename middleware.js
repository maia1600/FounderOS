import { NextResponse } from 'next/server';

export function middleware(req) {
  const basicAuth = req.headers.get('authorization');
  const url = req.nextUrl;

  // ⚠️ Ignorar middleware para chamadas à API
  if (url.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    if (
      (user === 'TGPT' || user === 'Tania' || user === 'Staff') &&
      pwd === 'tamai123'
    ) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Autenticação necessária', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

