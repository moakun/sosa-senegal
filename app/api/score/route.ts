import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data || !data.email) {
      return NextResponse.json(
        { message: 'Invalid input data or missing email' }, 
        { status: 400 }
      );
    }

    // Update score in Senegal database
    const updatedUser = await db.senegalUser.update({
      where: { email: data.email },
      data: {
        score: data.score || null
      },
    });

    return NextResponse.json(
      { message: 'Score updated successfully', updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating score:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Fetch score from Senegal database
    const userData = await db.senegalUser.findUnique({
      where: { email },
      select: {
        score: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Score evaluation logic
    if (userData.score === null) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No previous exam score found. First exam attempt.' 
        },
        { status: 200 }
      );
    } else if (userData.score < 7) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Score is not sufficient (must be greater than 8).' 
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, userData },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching score:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}