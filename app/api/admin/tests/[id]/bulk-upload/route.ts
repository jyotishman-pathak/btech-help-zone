import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import prisma from "../../../../../../lib/prisma.client";
import Papa from "papaparse";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testId } = await params;
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const text = await file.text();
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      return NextResponse.json({ error: "Invalid CSV format", details: parsed.errors }, { status: 400 });
    }

    const rows = parsed.data as any[];
    
    // Get current max order
    const maxOrderQ = await prisma.mockTestQuestion.findFirst({
      where: { testId },
      orderBy: { order: 'desc' }
    });
    let startOrder = maxOrderQ ? maxOrderQ.order + 1 : 0;

    const newQuestions = [];

    for (const row of rows) {
      const q = await prisma.mockTestQuestion.create({
        data: {
          testId,
          text: row.questionText || "Empty Question",
          textAs: row.questionTextAs || null,
          imageUrl: row.questionImageUrl || null,
          options: [
            row.option1 || "",
            row.option2 || "",
            row.option3 || "",
            row.option4 || ""
          ],
          optionsAs: [
            row.option1As || "",
            row.option2As || "",
            row.option3As || "",
            row.option4As || ""
          ],
          optionImages: [
            row.option1ImageUrl || "",
            row.option2ImageUrl || "",
            row.option3ImageUrl || "",
            row.option4ImageUrl || ""
          ],
          correctIndex: parseInt(row.correctIndex) || 0,
          marks: parseFloat(row.marks) || 4,
          negativeMarks: parseFloat(row.negativeMarks) || 1,
          section: row.section || "Physics",
          explanation: row.explanation || null,
          explanationImageUrl: row.explanationImageUrl || null,
          order: startOrder++,
        }
      });
      newQuestions.push(q);
    }

    return NextResponse.json({ success: true, count: newQuestions.length, questions: newQuestions });

  } catch (error: any) {
    console.error("Bulk upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
