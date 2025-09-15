import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get the logo file path
    const logoPath = path.join(process.cwd(), 'public', 'email-assets', 'mokmzansi-logo.PNG');
    
    // Check if file exists
    if (!fs.existsSync(logoPath)) {
      return new NextResponse('Logo not found', { status: 404 });
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(logoPath);
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error serving logo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}