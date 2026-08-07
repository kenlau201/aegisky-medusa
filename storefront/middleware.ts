import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 白皮书要求：防租户级SaaS隔离中间件
// 校验 X-AEGISKY-TENANT-ID 请求头
// 缺失返回 401，格式错误返回 400

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function middleware(request: NextRequest) {
  // 仅拦截 control-tower API 路由
  if (!request.nextUrl.pathname.startsWith('/api/control-tower')) {
    return NextResponse.next();
  }

  const tenantHeader = request.headers.get('X-AEGISKY-TENANT-ID');

  // 缺失租户头 -> 401 Unauthorized
  if (!tenantHeader) {
    return NextResponse.json(
      {
        error: 'Security Breach: Missing Security Access Fingerprint',
        code: 'TENANT_HEADER_MISSING',
        message: 'X-AEGISKY-TENANT-ID header is required for all control tower API calls',
      },
      { status: 401 }
    );
  }

  // UUID格式错误 -> 400 Bad Request
  if (!UUID_REGEX.test(tenantHeader)) {
    return NextResponse.json(
      {
        error: 'Security Breach: Tampered or Corrupted Tenant Token',
        code: 'TENANT_ID_INVALID',
        message: 'X-AEGISKY-TENANT-ID must be a valid UUID format',
      },
      { status: 400 }
    );
  }

  // 捕获客户端首选语言，默认为英语
  const acceptLanguage = request.headers.get('Accept-Language') || 'en';
  const primaryLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();

  // 将验证过的隔离域标识和语言写入请求头，传递给API路由
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenantHeader);
  requestHeaders.set('x-accept-language', primaryLang);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: '/api/control-tower/:path*',
};
