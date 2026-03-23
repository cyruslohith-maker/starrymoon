"use client"

import { useEffect, useState, useRef } from "react"

export function LoadingScreen() {
    const [visible, setVisible] = useState(true)
    const [fadeOut, setFadeOut] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handleEnded = () => {
            // Start fade-out when video finishes
            setFadeOut(true)
            setTimeout(() => setVisible(false), 600)
        }

        video.addEventListener("ended", handleEnded)

        // Fallback: if video takes too long or fails, auto-dismiss after 5s
        const fallback = setTimeout(() => {
            setFadeOut(true)
            setTimeout(() => setVisible(false), 600)
        }, 5000)

        return () => {
            video.removeEventListener("ended", handleEnded)
            clearTimeout(fallback)
        }
    }, [])

    if (!visible) return null

    return (
        <div
            className={`loading-screen ${fadeOut ? "loading-screen--hidden" : ""}`}
            aria-label="Loading"
            role="status"
        >
            {/* Video animation */}
            <video
                ref={videoRef}
                src="/loading-mascot.mp4"
                autoPlay
                muted
                playsInline
                className="loading-video"
            />

            {/* Brand text below video */}
            <p className="loading-text">St4rrymoon</p>
            <p className="loading-subtext">loading your sparkle...</p>
        </div>
    )
}
