import { NextResponse } from 'next/server';

export const runtime = 'edge';

// 根路径 llms.txt 重定向到英语版本
export async function GET() {
  return NextResponse.redirect(new URL('/en/llms.txt', 'https://aegisky.com'), 301);
}
