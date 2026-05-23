import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import prisma from "../../../../../../lib/prisma.client";


export async function GET(
    _: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const form = await prisma.leadForm.findUnique({
        where: { batchId: id },
        include: { fields: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(form);
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { title, description, fields } = await req.json();

    // Upsert form + replace all fields
    const form = await prisma.$transaction(async (tx) => {
        const existing = await tx.leadForm.findUnique({ where: { batchId: id } });

        const f = existing
            ? await tx.leadForm.update({
                where: { batchId: id },
                data: { title, description },
            })
            : await tx.leadForm.create({
                data: { batchId: id, title: title ?? "Register for Free Access", description },
            });

        // Replace all fields
        await tx.leadFormField.deleteMany({ where: { formId: f.id } });
        if (fields?.length) {
            await tx.leadFormField.createMany({
                data: fields.map((field: any, i: number) => ({
                    formId: f.id,
                    label: field.label,
                    placeholder: field.placeholder ?? null,
                    fieldType: field.fieldType ?? "text",
                    required: field.required ?? true,
                    order: i,
                    options: field.options ?? [],
                })),
            });
        }

        return tx.leadForm.findUnique({
            where: { id: f.id },
            include: { fields: { orderBy: { order: "asc" } } },
        });
    });

    return NextResponse.json(form);
}