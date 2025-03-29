import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import * as z from "zod";

const userSchema = z.object({
  fullName: z.string().min(1, "Full Name is required").max(100),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  companyName: z.string().min(1, "Company Name is required"),
  password: z.string().min(1, "Password is required")
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, fullName, password, companyName } = userSchema.parse(body);

    // Check if email already exists in Congo schema
    const existingUserByEmail = await db.congoUser.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "Email Déjà Utilisé" },
        { status: 409 }
      );
    }

    // Check if company name already exists in Congo schema
    const existingUserByCompanyName = await db.congoUser.findUnique({
      where: { companyName },
    });

    if (existingUserByCompanyName) {
      return NextResponse.json(
        { error: "Nom de société déjà utilisé" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    // Create user in Congo schema
    await db.congoUser.create({
      data: {
        fullName,
        email,
        companyName,
        password: hashedPassword,
        // Default values for other required fields
        video1: false,
        video2: false,
        gotAttestation: false,
        date: new Date()
      },
    });
    
    return NextResponse.json(
      { message: "Utilisateur créé avec succès" },
      { status: 201 }
    );
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Une erreur s'est produite. Veuillez réessayer." },
      { status: 500 }
    );
  }
}