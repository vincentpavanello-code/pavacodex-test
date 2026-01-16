import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
    APOLLO_API_KEY: !!process.env.APOLLO_API_KEY,
  })
}
