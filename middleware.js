import { NextResponse } from 'next/server';

export function middleware(request) {
  const basicAuth = request.headers.get('authorization');

  // Permitir assets estáticos
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith('/_next') || 
    pathname.endsWith('.js') || 
    pathname.endsWith('.css') || 
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  if (!basicAuth) {
    return new Response('Autenticação requerida', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    });
  }

  const authValue = basicAuth.split(' ')[1];
  const [user, pass] = atob(authValue).split(':');

  const isValid =
    ['TGPT', 'Tania', 'Staff'].includes(user) &&
    pass === 'tamai123';

  if (isValid) return NextResponse.next();

  return new Response('Não autorizado', {
    status: 401,
  });
}

export const config = {
  matcher: ['/marcacoes', '/api/bookings'],
};
