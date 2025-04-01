import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import * as z from "zod";

// Define types
type UserData = {
  fullName: string;
  email: string;
  companyName: string;
  password: string;
};

type UserResponse = Omit<UserData, 'password'> & {
  id: number;
  video1: boolean;
  video2: boolean;
  gotAttestation: boolean;
  date: Date;
};

const userSchema = z.object({
  fullName: z.string().min(1, "Full Name is required").max(100),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  companyName: z.string().min(1, "Company Name is required"),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    
    if (!body) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    const { email, fullName, password, companyName } = userSchema.parse(body);

    // Check if email already exists
    const existingUserByEmail = await db.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // Check if company name already exists
    const existingUserByCompanyName = await db.user.findUnique({
      where: { companyName },
    });

    if (existingUserByCompanyName) {
      return NextResponse.json(
        { error: "Company name already exists" },
        { status: 409 }
      );
    }

    // Get the last user to determine the next ID
    const lastUser = await db.user.findFirst({
      orderBy: {
        id: 'desc',
      },
      select: {
        id: true,
      },
    });

    const nextId = lastUser ? lastUser.id + 1 : 1;

    const hashedPassword = await hash(password, 10);

    // Create user with the determined ID
    const newUser = await db.user.create({
      data: {
        id: nextId,
        fullName,
        email,
        companyName,
        password: hashedPassword,
        video1: false,
        video2: false,
        gotAttestation: false,
        date: new Date()
      },
    });

    // Properly typed destructuring
    const { password: omittedPassword, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { user: userWithoutPassword as UserResponse, message: "User created successfully" },
      { status: 201 }
    );
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      console.error("Registration error:", error.message);
    }
    
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}