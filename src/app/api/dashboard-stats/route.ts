import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/dashboard-posts";

export async function GET() {
  return NextResponse.json({ ok: true, stats: getDashboardStats() });
}
