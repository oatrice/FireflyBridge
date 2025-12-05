"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface ImageCarouselProps {
    images: string[];
    alt: string;
    className?: string;
    autoPlay?: boolean;
    interval?: number;
}

export function ImageCarousel({
    images,
    alt,
    className = "",
    autoPlay = true,
    interval = 5000
}: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Ensure images is always an array for hooks
    const safeImages = images || [];

    const nextSlide = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (safeImages.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % safeImages.length);
    }, [safeImages.length]);

    const prevSlide = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (safeImages.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
    }, [safeImages.length]);

    const goToSlide = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(index);
    };

    useEffect(() => {
        if (!autoPlay || modalOpen || isHovered || safeImages.length <= 1) return;

        const timer = setInterval(() => {
            nextSlide();
        }, interval);

        return () => clearInterval(timer);
    }, [autoPlay, modalOpen, isHovered, safeImages.length, interval, nextSlide]);

    if (safeImages.length === 0) return null;

    return (
        <>
            <div
                className={`relative group ${className}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div
                    className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 aspect-video cursor-pointer"
                    onClick={() => setModalOpen(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setModalOpen(true);
                        }
                    }}
                >
                    <div
                        className="flex h-full transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {safeImages.map((src, index) => (
                            <div key={index} className="relative min-w-full h-full">
                                <Image
                                    src={src}
                                    alt={`${alt} - Image ${index + 1}`}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    priority={index === 0}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    {safeImages.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                aria-label="Previous image"
                            >
                                ◀
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                aria-label="Next image"
                            >
                                ▶
                            </button>
                        </>
                    )}

                    {/* Dots */}
                    {safeImages.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {safeImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => goToSlide(idx, e)}
                                    className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/80"
                                        }`}
                                    aria-label={`Go to image ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        🔍 คลิกเพื่อขยาย
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setModalOpen(false)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') setModalOpen(false);
                    }}
                >
                    <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors text-4xl font-light z-50"
                        >
                            ×
                        </button>

                        <div className="relative w-full h-[80vh]">
                            <Image
                                src={safeImages[currentIndex]}
                                alt={`${alt} - Fullscreen ${currentIndex + 1}`}
                                fill
                                className="object-contain"
                            />
                        </div>

                        {safeImages.length > 1 && (
                            <div className="flex items-center gap-4 mt-4">
                                <button
                                    onClick={prevSlide}
                                    className="text-white hover:text-gray-300 text-3xl"
                                >
                                    ◀
                                </button>
                                <span className="text-white text-sm">
                                    {currentIndex + 1} / {safeImages.length}
                                </span>
                                <button
                                    onClick={nextSlide}
                                    className="text-white hover:text-gray-300 text-3xl"
                                >
                                    ▶
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
