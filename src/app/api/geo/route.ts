import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const geoPath = path.join(process.cwd(), "data", "geo", "chiang-mai-boundaries.json");
    const raw = fs.readFileSync(geoPath, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Geo API error:", error);
    return NextResponse.json({ error: "Failed to load geo data" }, { status: 500 });
  }
}
