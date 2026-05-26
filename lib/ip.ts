import { NextRequest } from "next/server";

export function getIP(req: NextRequest | Request): string {
    // Vercel
    const xForwardedFor = (req.headers as any).get?.("x-forwarded-for") ??
        (req.headers as unknown as Record<string, string>)["x-forwarded-for"];

    if (xForwardedFor) {
        const first = xForwardedFor.split(",")[0].trim();
        if (first && first !== "::1" && first !== "127.0.0.1") return first;
    }

    const xRealIP = (req.headers as any).get?.("x-real-ip") ??
        (req.headers as unknown as Record<string, string>)["x-real-ip"];
    if (xRealIP) return xRealIP.trim();

    const cfIP = (req.headers as any).get?.("cf-connecting-ip") ??
        (req.headers as unknown as Record<string, string>)["cf-connecting-ip"];
    if (cfIP) return cfIP.trim();

    return "127.0.0.1"; // fallback for local dev
}