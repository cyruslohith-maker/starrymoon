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
            setFadeOut(true)
            setTimeout(() => setVisible(false), 600)
        }

        video.addEventListener("ended", handleEnded)

        // Fallback: auto-dismiss after 5s
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
            <video
                ref={videoRef}
                src="/loading-mascot.mp4"
                autoPlay
                muted
                playsInline
                className="loading-video"
            />
        </div>
    )
}
