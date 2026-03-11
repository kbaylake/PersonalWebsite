import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const categories = [
  { name: "Arrays & Strings", folder: "public/code-vault/arrays_strings", url: "arrays_strings" },
  { name: "Hash Maps", folder: "public/code-vault/hash_maps", url: "hash_maps" },
  { name: "Linked Lists", folder: "public/code-vault/LinkedLists", url: "LinkedLists" },
  { name: "Stacks & Queues", folder: "public/code-vault/stacks_queues", url: "stacks_queues" },
  { name: "Trees & Graphs", folder: "public/code-vault/trees_graphs", url: "trees_graphs" },
  { name: "Heaps", folder: "public/code-vault/Heaps", url: "Heaps" },
  { name: "Binary Search", folder: "public/code-vault/binary_search", url: "binary_search" },
  { name: "Backtracking", folder: "public/code-vault/Backtracking", url: "Backtracking" },
  { name: "Dynamic Programming", folder: "public/code-vault/dynamic_programming", url: "dynamic_programming" }
];

export async function GET() {
  try {

    const data = categories.map((cat) => {

      const absolutePath = path.join(process.cwd(), cat.folder);

      let files = [];

      if (fs.existsSync(absolutePath)) {

        const fileList = fs.readdirSync(absolutePath);

        files = fileList
          .filter((file) => file.endsWith(".md"))
          .map((file) => ({
            name: file.replace(".md", "").replace(/_/g, " "),
            path: `/code-vault/${cat.url}/${file}`
          }));

      }

      return {
        category: cat.name,
        files
      };

    });

    return NextResponse.json(data);

  } catch (err) {
    console.error("Vault API error:", err);
    return NextResponse.json([]);
  }
}