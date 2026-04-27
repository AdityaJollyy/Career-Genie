import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";

export async function GET() {
  await inngest.send({
    name: "industry/insights.generate",
    data: {},
  });
  return NextResponse.json({ triggered: true });
}