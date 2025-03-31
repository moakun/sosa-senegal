import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as z from 'zod';

// Validation schema for POST requests
const postSchema = z.object({
  email: z.string().email("Email invalide")
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email requis' },
      { status: 400 }
    );
  }

  try {
    const user = await db.senegalUser.findUnique({
      where: { email },
      select: { 
        gotAttestation: true,
        fullName: true,
        companyName: true 
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur Sénégal non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      gotAttestation: user.gotAttestation,
      userDetails: {
        name: user.fullName,
        company: user.companyName
      }
    });
  } catch (error) {
    console.error('[SENEGAL_ATTESTATION_GET] Error:', error);
    return NextResponse.json(
      { error: 'Erreur du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = postSchema.parse(body);

    // Verify user exists before update
    const existingUser = await db.senegalUser.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Utilisateur Sénégal non trouvé' },
        { status: 404 }
      );
    }

    // Update attestation status
    const updatedUser = await db.senegalUser.update({
      where: { email },
      data: { 
        gotAttestation: true,
        attestationDate: new Date() // Add timestamp of when attestation was granted
      },
      select: {
        gotAttestation: true,
        attestationDate: true
      }
    });

    return NextResponse.json({
      success: true,
      gotAttestation: updatedUser.gotAttestation,
      attestationDate: updatedUser.attestationDate
    });
  } catch (error) {
    console.error('[SENEGAL_ATTESTATION_POST] Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur du serveur' },
      { status: 500 }
    );
  }
}