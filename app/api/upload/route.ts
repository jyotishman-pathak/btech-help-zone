// delete later
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../auth";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const MAX_SIZE_MB = 20;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) ?? "cee/general";
    const resourceType = (formData.get("resource_type") as string) ?? "auto";

    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: "Invalid file type. Allowed: images and PDF" }, { status: 415 });

    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      return NextResponse.json({ error: `File too large. Max ${MAX_SIZE_MB}MB` }, { status: 413 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: resourceType as any,
            // PDFs: generate preview image automatically
            format: file.type === "application/pdf" ? undefined : undefined,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    });
  } catch (err: any) {
    console.error("[upload] Cloudinary error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}