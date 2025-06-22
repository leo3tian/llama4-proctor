import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json({ message: "Description is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("LlamaProctorDB");
    
    const filter = { classroom: "1" };
    const update = { 
      $set: { 
        description,
        updatedAt: new Date()
      } 
    };
    const options = { upsert: true };

    const result = await db.collection("assignments").updateOne(filter, update, options);
    
    const message = result.upsertedCount > 0 
      ? "Activity created successfully" 
      : "Activity updated successfully";

    return NextResponse.json({ message, upsertedId: result.upsertedId }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
} 