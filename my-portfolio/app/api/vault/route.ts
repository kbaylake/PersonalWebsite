import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const categories = [
  { folder: "arrays_strings", name: "Arrays & Strings" },
  { folder: "hash_maps", name: "Hash Maps" },
  { folder: "LinkedLists", name: "Linked Lists" },
  { folder: "stacks_queues", name: "Stacks & Queues" },
  { folder: "trees_graphs", name: "Trees & Graphs" },
  { folder: "Heaps", name: "Heaps" },
  { folder: "binary_search", name: "Binary Search" },
  { folder: "Backtracking", name: "Backtracking" },
  { folder: "dynamic_programming", name: "Dynamic Programming" }
];

export async function GET() {
  try {
    const baseDir = path.join(process.cwd(), "public", "code-vault");

    console.log("BASE DIR:", baseDir);

    const data = categories.map((cat) => {
      const categoryPath = path.join(baseDir, cat.folder);

      console.log("CHECKING:", categoryPath);

      let files: any[] = [];

      if (fs.existsSync(categoryPath)) {
        const fileList = fs.readdirSync(categoryPath);

        console.log("FILES:", fileList);

        files = fileList
          .filter((file) => file.endsWith(".md"))
          .map((file) => ({
            name: file.replace(".md", "").replace(/_/g, " "),
            path: `/code-vault/${cat.folder}/${file}`
          }));
      } else {
        console.log("FOLDER NOT FOUND:", categoryPath);
      }

      return {
        category: cat.name,
        files
      };
    });

    return NextResponse.json(data);

  } catch (err) {
    console.error(err);
    return NextResponse.json([]);
  }
}