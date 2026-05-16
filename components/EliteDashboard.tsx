"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ContainerScroll } from "./ui/container-scroll-animation";

export function EliteDashboard() {
    const [desktopImgError, setDesktopImgError] = useState(false);
    const [mobileImgError, setMobileImgError] = useState(false);

    const titleComponent = (
        <div className="flex flex-col items-center gap-3 px-4">
            <p className="text-[10px] font-bold tracking-[0.3em] text-violet-400 uppercase">
                Real-Time Performance Engine
            </p>
            <h2 className="font-black italic leading-none tracking-tight text-center">
                <span className="text-white text-[clamp(40px,8vw,96px)]">ELITE </span>
                <span
                    className="text-[clamp(40px,8vw,96px)]"
                    style={{
                        background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 40%, #38bdf8 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}
                >
                    DASHBOARD
                </span>
            </h2>
            <p className="text-gray-500 text-sm md:text-base max-w-md text-center leading-relaxed mt-2">
                Track your CEE rank, accuracy, and subject strength in real time.
            </p>
        </div>
    );

    return (
        <section className="overflow-hidden" style={{ background: "#090915" }}>

            {/* ── DESKTOP (md+): ContainerScroll with tablet/laptop frame ── */}
            <div
                className="hidden md:block [&>div]:!bg-[#090915] [&>div>div]:!bg-[#090915]"
                style={{ background: "#090915" }}
            >
                <ContainerScroll titleComponent={titleComponent}>
                    <div className="relative w-full h-full bg-[#0d0d20] rounded-2xl border border-[#1e1e3a] overflow-hidden">
                        {!desktopImgError ? (
                            <Image
                                src="/dashboard-preview.png"
                                alt="Elite Dashboard Preview"
                                width={1400}
                                height={720}
                                className="w-full h-full object-cover object-top"
                                priority
                                onError={() => setDesktopImgError(true)}
                            />
                        ) : (
                            <SkeletonFallback />
                        )}
                    </div>
                </ContainerScroll>
            </div>

            {/* ── MOBILE (<md): Phone mockup with mobile-dashboard.png ── */}
            <div className="block md:hidden px-4 py-16" style={{ background: "#090915" }}>
                {/* Title */}
                {titleComponent}

                {/* Phone frame */}
                <div className="relative mx-auto mt-10 max-w-[260px]">
                    {/* Outer shell */}
                    <div className="relative rounded-[2.5rem] border-[6px] border-[#2a2a45] bg-[#0d0d20] shadow-[0_40px_80px_rgba(124,58,237,0.25)] overflow-hidden">
                        {/* Notch bar */}
                        <div className="flex justify-center pt-3 pb-1 bg-[#0d0d20]">
                            <div className="w-16 h-1.5 rounded-full bg-[#2a2a45]" />
                        </div>

                        {/* Screen */}
                        <div className="relative overflow-hidden" style={{ aspectRatio: "9/19.5" }}>
                            {!mobileImgError ? (
                                <Image
                                    src="/mobile-dashboard.jpeg"
                                    alt="Elite Dashboard Mobile"
                                    fill
                                    className="object-cover object-top"
                                    priority
                                    onError={() => setMobileImgError(true)}
                                />
                            ) : (
                                <div className="w-full h-full bg-[#12122a] flex items-center justify-center p-4">
                                    <div className="space-y-3 w-full">
                                        <div className="h-6 w-3/4 bg-[#1a1a35] rounded animate-pulse" />
                                        <div className="grid grid-cols-2 gap-2">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="bg-[#1a1a35] rounded-xl h-20 animate-pulse" />
                                            ))}
                                        </div>
                                        <div className="h-3 w-1/2 bg-[#1a1a35] rounded animate-pulse" />
                                        <div className="h-24 bg-violet-900/20 rounded-xl animate-pulse" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Home bar */}
                        <div className="flex justify-center py-2.5 bg-[#0d0d20]">
                            <div className="w-20 h-1 rounded-full bg-[#2a2a45]" />
                        </div>
                    </div>

                    {/* Glow under phone */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-40 h-10 bg-violet-600/20 blur-2xl rounded-full" />
                </div>
            </div>

        </section>
    );
}

function SkeletonFallback() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
            <div className="w-full max-w-2xl space-y-4">
                <div className="h-8 w-64 bg-[#1a1a35] rounded-lg animate-pulse" />
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-[#12122a] border border-[#1e1e3a] rounded-xl p-4 space-y-3">
                            <div className="h-24 bg-[#1a1a35] rounded-lg animate-pulse" />
                            <div className="h-3 w-3/4 bg-[#1a1a35] rounded animate-pulse" />
                            <div className="h-6 w-16 bg-violet-900/40 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
                <div className="bg-[#12122a] border border-[#1e1e3a] rounded-xl p-4 space-y-3">
                    <div className="h-3 w-1/2 bg-[#1a1a35] rounded animate-pulse" />
                    <div className="grid grid-cols-4 gap-2">
                        {[60, 45, 75, 55, 80, 65, 70, 50].map((h, i) => (
                            <div key={i} className="bg-violet-900/30 rounded-sm" style={{ height: `${h}px` }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}