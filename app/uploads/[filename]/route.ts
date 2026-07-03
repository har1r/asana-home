import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ filename: string }> }
) {
  const { filename } = await props.params;
  const filePath = path.join(process.cwd(), "public", "uploads", filename);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("File not found on disk", { status: 404 });
  }

  try {
    const fileBuffer = await fs.promises.readFile(filePath);
    
    // Detect content type by file extension
    let contentType = "application/octet-stream";
    if (filename.toLowerCase().endsWith(".pdf")) {
      contentType = "application/pdf";
    } else if (filename.toLowerCase().endsWith(".png")) {
      contentType = "image/png";
    } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
      contentType = "image/jpeg";
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error("[DYNAMIC-SERVE-UPLOAD-ERR]", error);
    return new NextResponse("Error reading file", { status: 500 });
  }
}
