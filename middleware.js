import { NextResponse } from 'next/server';

export function middleware(request) {
  const authHeader = request.headers.get('authorization');
  const basicAuth = authHeader?.split(' ')[1];
  const validAuth = Buffer.from('tamai:segredo123').toString('base64');

  if (basicAuth === validAuth) {
    return NextResponse.next();
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Tamai Area"',
    },
  });
}

export const config = {
  matcher: ['/marcacoes'],
};
