import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Replace with your database connection

export async function POST(req: Request) {
  try {
    const data = await req.json();

        // Validate required fields
        if (!data || !data.email) {
            return NextResponse.json({ message: 'Invalid input data or missing email' }, { status: 400 });
          }

             // Update data in the database
    const updatedUser = await db.user.update({
        where: { email: data.email }, // Filter by email
        data: {
          score : data.score || null
        },
      });

      return NextResponse.json({ message: 'Data updated successfully', updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Error updating data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const userData = await db.user.findUnique({
      where: { email },
      select: {
        score: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // If score is null or <= 8, handle accordingly
    if (userData.score === null) {
      return NextResponse.json(
        { success: false, message: 'No previous exam score found. First exam attempt.' },
        { status: 200 } // Success status, but with a false success flag
      );
    } else if (userData.score < 7) {
      return NextResponse.json(
        { success: false, message: 'Score is not sufficient (must be greater than 8).' },
        { status: 200 } // Success status, but with a false success flag
      );
    }

    return NextResponse.json({ success: true, userData }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
