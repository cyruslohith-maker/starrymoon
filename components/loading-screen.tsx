"use client"

import { useEffect, useState } from "react"

export function LoadingScreen() {
    const [visible, setVisible] = useState(true)
    const [fadeOut, setFadeOut] = useState(false)
    const [progress, setProgress] = useState(0)

    /* Hide body content while loading */
    useEffect(() => {
        document.documentElement.style.overflow = "hidden"
        document.body.style.overflow = "hidden"

        return () => {
            document.documentElement.style.overflow = ""
            document.body.style.overflow = ""
        }
    }, [])

    /* Progress bar + auto-dismiss */
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + 2
            })
        }, 40)

        return () => clearInterval(interval)
    }, [])

    /* When progress hits 100, start fade out */
    useEffect(() => {
        if (progress >= 100) {
            const timeout = setTimeout(() => {
                setFadeOut(true)
                setTimeout(() => {
                    setVisible(false)
                    document.documentElement.style.overflow = ""
                    document.body.style.overflow = ""
                    document.body.classList.add("app-loaded")
                    document.body.style.background = ""
                }, 600)
            }, 300)
            return () => clearTimeout(timeout)
        }
    }, [progress])

    if (!visible) return null

    return (
        <div
            className={`loading-screen ${fadeOut ? "loading-screen--hidden" : ""}`}
            aria-label="Loading"
            role="status"
        >
            {/* Floating sparkles */}
            <div className="loading-sparkles" aria-hidden="true">
                <span className="sparkle sparkle-1">✦</span>
                <span className="sparkle sparkle-2">♡</span>
                <span className="sparkle sparkle-3">✧</span>
                <span className="sparkle sparkle-4">♡</span>
                <span className="sparkle sparkle-5">✦</span>
                <span className="sparkle sparkle-6">✧</span>
                <span className="sparkle sparkle-7">♡</span>
                <span className="sparkle sparkle-8">✦</span>
            </div>

            {/* Mascot */}
            <div className="loading-mascot">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/loading-mascot.png"
                    alt="Starrymoon mascot"
                    className="loading-mascot-img"
                    draggable={false}
                />
            </div>

            {/* Brand name */}
            <p className="loading-brand">Starrymoon</p>

            {/* Progress bar */}
            <div className="loading-bar-track">
                <div
                    className="loading-bar-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <p className="loading-tagline">Handcrafted with love ♡</p>
        </div>
    )
}
