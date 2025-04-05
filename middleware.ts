import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

// Перехватываем все запросы
export function middleware(request: NextRequest) {
  // Перехватываем стандартную страницу 404
  if (request.nextUrl.pathname === '/_not-found') {
    // Перенаправляем на нашу кастомную страницу 404
    return NextResponse.redirect(new URL('/404', request.url));
  }

  return NextResponse.next();
}

// Указываем, на каких маршрутах срабатывает middleware
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};