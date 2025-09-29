import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    const { firstName, lastName, email, password, role } = data;
    
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // TODO: Add user registration logic here
    console.log("User registration data:", data);

    return NextResponse.json({ 
      message: "User registered successfully",
      user: { firstName, lastName, email, role }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}