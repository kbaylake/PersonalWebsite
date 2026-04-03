import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function extractMeta(content: string): { title: string; excerpt: string; readingTime: number } {
  const lines = content.split('\n');

  // Title: first # heading
  const titleLine = lines.find(l => l.startsWith('# '));
  const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : '';

  // Excerpt: first real prose paragraph (skip headings, italics, ---, empty)
  let excerpt = '';
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('#')) continue;
    if (t.startsWith('---')) continue;
    if (t.startsWith('*') || t.startsWith('_')) continue;
    if (t.startsWith('>') || t.startsWith('!')) continue;
    if (t.length < 40) continue; // skip short lines / labels
    excerpt = t.length > 160 ? t.slice(0, 157) + '…' : t;
    break;
  }

  // Reading time: ~200 wpm
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return { title, excerpt, readingTime };
}

export async function GET() {
  try {
    const folder = "public/carcontent";
    const absolutePath = path.join(process.cwd(), folder);

    let files: { name: string; title: string; excerpt: string; readingTime: number; path: string }[] = [];

    if (fs.existsSync(absolutePath)) {
      const fileList = fs.readdirSync(absolutePath);

      files = fileList
        .filter((file) => file.endsWith(".md"))
        .map((file) => {
          const filePath = path.join(absolutePath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const { title, excerpt, readingTime } = extractMeta(content);
          return {
            name: file.replace(".md", "").replace(/-/g, " "),
            title: title || file.replace(".md", "").replace(/-/g, " "),
            excerpt,
            readingTime,
            path: `/carcontent/${file}`,
          };
        });
    }

    return NextResponse.json({ category: "Automotive", files });

  } catch (err) {
    console.error("Automotive API error:", err);
    return NextResponse.json({ category: "Automotive", files: [] });
  }
}
