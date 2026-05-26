import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma.client";

export async function POST(req: NextRequest) {
    // Only from internal calls
    const key = req.headers.get("x-internal-key");
    if (key !== process.env.INTERNAL_API_KEY) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { ip, route, retryAfter } = await req.json();

    await prisma.auditLog.create({
        data: {
            action: "RATE_LIMIT_BLOCK",
            actorId: "system",
            entity: "Route",
            entityId: route,
            newValue: { ip, retryAfter },
            ipAddress: ip,
        },
    }).catch(() => { }); // silent — don't block on this

    return NextResponse.json({ ok: true });
}