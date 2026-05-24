import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    "accountAssociation": {
      "header": "eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ",
      "payload": "eyJkb21haW4iOiJiYXNlY2l0eS1ob21lLnZlcmNlbC5hcHAifQ",
      "signature": "MHcCAQEEInsiZG9tYWluIjogImJhc2VjaXR5LWhvbWUudmVyY2VsLmFwcCJ9oAoGCCqGSM49AwEHoUQDQgAE"
    },
    "frame": {
      "version": "1",
      "name": "BaseCity Home",
      "iconUrl": "https://vercel.app",
      "homeUrl": "https://basecity-home.vercel.app",
      "imageUrl": "https://vercel.app",
      "buttonTitle": "Check-In via GPS",
      "webhookUrl": "https://vercel.app"
    }
  };

  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });
}
