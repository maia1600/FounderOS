import { NextResponse } from 'next/server'

export function middleware(req) {
  const basicAuth = req.headers.get('authorization')
  const url = req.nextUrl

  // Permitir ficheiros estáticos e rota de marcações sem autenticação
  const publicPaths = [
    '/favicon.ico',
    '/manifest.json',
    '/robots.txt',
    '/marcacoes',
  ]
  const staticAssets = url.pathname.startsWith('/_next')

  const isPublic = publicPaths.includes(url.pathname) || staticAssets

  if (isPublic) {
    return NextResponse.next()
  }

  // Autenticação básica para rotas protegidas
  const validUsers = {
    'TGPT': 'tamai123',
    'Tania': 'tamai123',
    'Staff': 'tamai123',
  }

  if (basicAuth) {
    const [_, encoded] = basicAuth.split(' ')
    const decoded = Buffer.from(encoded, 'base64').toString()
    const [user, pwd] = decoded.split(':')

    if (validUsers[user] === pwd) {
      return NextResponse.next()
    }
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Área Segura"',
    },
  })
}
