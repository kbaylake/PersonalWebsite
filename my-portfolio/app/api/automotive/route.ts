import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const folder = "public/carcontent";
    const absolutePath = path.join(process.cwd(), folder);

    let files: { name: string; path: string }[] = [];

    if (fs.existsSync(absolutePath)) {
      const fileList = fs.readdirSync(absolutePath);

      files = fileList
        .filter((file) => file.endsWith(".md"))
        .map((file) => ({
          name: file.replace(".md", "").replace(/-/g, " "),
          path: `/carcontent/${file}`
        }));
    }

    return NextResponse.json({
      category: "Automotive",
      files
    });

  } catch (err) {
    console.error("Automotive API error:", err);
    return NextResponse.json({ category: "Automotive", files: [] });
  }
}