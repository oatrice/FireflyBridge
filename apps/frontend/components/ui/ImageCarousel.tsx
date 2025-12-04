"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageCarouselProps {
    images: string[];
    alt: string;
    className?: string;
}

export function ImageCarousel({ images, alt, className = "" }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);

    if (!images || images.length === 0) return null;

    const nextSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToSlide = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(index);
    };

    return (
        <>
            <div className={`relative group ${className}`}>
                <div
                    className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 aspect-video cursor-pointer"
                    onClick={() => setModalOpen(true)}
                >
                    <Image
                        src={images[currentIndex]}
                        alt={`${alt} - Image ${currentIndex + 1}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Previous image"
                            >
                                ◀
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Next image"
                            >
                                ▶
                            </button>
                        </>
                    )}

                    {/* Dots */}
                    {images.length > 1 && (
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {images.map((_, idx) => (
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

                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        🔍 คลิกเพื่อขยาย
                    </div>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setModalOpen(false)}
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
                                src={images[currentIndex]}
                                alt={`${alt} - Fullscreen ${currentIndex + 1}`}
                                fill
                                className="object-contain"
                            />
                        </div>

                        {images.length > 1 && (
                            <div className="flex items-center gap-4 mt-4">
                                <button
                                    onClick={prevSlide}
                                    className="text-white hover:text-gray-300 text-3xl"
                                >
                                    ◀
                                </button>
                                <span className="text-white text-sm">
                                    {currentIndex + 1} / {images.length}
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
