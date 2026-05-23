import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../../auth";
import prisma from "../../../../../../../lib/prisma.client";


export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string, topicId: string }> }
) {
    const session = await auth();
    if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { topicId } = await params;
    const { name } = await req.json();
    const topic = await prisma.topic.update({ where: { id: topicId }, data: { name } });
    return NextResponse.json(topic);
}

export async function DELETE(
    _: NextRequest,
    { params }: { params: Promise<{ id: string, topicId: string }> }
) {
    const session = await auth();
    if (!["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role))
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { topicId } = await params;
    await prisma.$transaction([
        prisma.userTopicProgress.deleteMany({ where: { topicId: topicId } }),
        prisma.topic.delete({ where: { id: topicId } }),
    ]);
    return NextResponse.json({ success: true });
}