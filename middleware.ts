import { NextRequest, NextResponse } from 'next/server';

// Temporarily disable middleware - all requests pass through
// This is a debugging step to isolate if middleware is causing the hang
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match nothing - disable middleware completely
    '/((?!.*)/)',
  ],
};
