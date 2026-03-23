"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export function LoadingScreen() {
    const [visible, setVisible] = useState(true)
    const [fadeOut, setFadeOut] = useState(false)

    useEffect(() => {
        // Start fade-out after 2.4 seconds
        const fadeTimer = setTimeout(() => setFadeOut(true), 2400)
        // Remove from DOM after fade completes
        const removeTimer = setTimeout(() => setVisible(false), 3000)
        return () => {
            clearTimeout(fadeTimer)
            clearTimeout(removeTimer)
        }
    }, [])

    if (!visible) return null

    return (
        <div
            className={`loading-screen ${fadeOut ? "loading-screen--hidden" : ""}`}
            aria-label="Loading"
            role="status"
        >
            {/* Soft pink gingham background */}
            <div
                className="loading-bg-pattern"
                style={{
                    backgroundImage: `url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-02-19%20at%2022.53.07-gaeq0AehSWWXfYKljSMyQ3WupoBcFa.jpeg")`,
                }}
            />

            {/* Ground / floor line */}
            <div className="loading-ground" />

            {/* Sparkle particles */}
            <div className="loading-sparkle loading-sparkle--1">✦</div>
            <div className="loading-sparkle loading-sparkle--2">✧</div>
            <div className="loading-sparkle loading-sparkle--3">✦</div>
            <div className="loading-sparkle loading-sparkle--4">♡</div>
            <div className="loading-sparkle loading-sparkle--5">✧</div>
            <div className="loading-sparkle loading-sparkle--6">✦</div>

            {/* Mascot running */}
            <div className="loading-runner">
                <div className="loading-runner__bounce">
                    {/* Shadow under character */}
                    <div className="loading-runner__shadow" />
                    <Image
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-02-19%20at%2023.02.22%20%281%29-p2RkRsGEwMqFoSLVEFVzaUpp6WWpyx.jpeg"
                        alt="St4rrymoon mascot running"
                        width={80}
                        height={80}
                        className="loading-runner__img"
                        priority
                    />
                </div>
            </div>

            {/* Paw-print trail */}
            <div className="loading-paws">
                <span className="loading-paw loading-paw--1">🐾</span>
                <span className="loading-paw loading-paw--2">🐾</span>
                <span className="loading-paw loading-paw--3">🐾</span>
            </div>

            {/* Brand text */}
            <p className="loading-text">St4rrymoon</p>
            <p className="loading-subtext">made with love ♡</p>
        </div>
    )
}
