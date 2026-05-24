import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    "accountAssociation": {
      "header": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ",
      "payload": "eyJkb21haW4iOiJiYXNlY2l0eS1ob21lLnZlcmNlbC5hcHAifQ",
      "signature": "MEYCIQCc7dD4X39p2M9f18Fm93XmXgD9vXmD9vXmD9vXmD9vXmAiEA7vXmD9vXmD9vXmD9vXmD9vXmD9vXmD9vXmD9vXmD9vX"
    },
    "frame": {
      "version": "1",
      "name": "BaseCity Home",
      "iconUrl": "https://vercel.app",
      "homeUrl": "https://vercel.app",
      "imageUrl": "https://vercel.app/splash.png",
      "buttonTitle": "Check-In via GPS",
      "webhookUrl": "https://vercel.app/api/webhook"
    }
  };

  return new NextResponse(JSON.stringify(manifest), {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
