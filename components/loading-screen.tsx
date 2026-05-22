"use client"

import { useEffect, useState, useRef } from "react"

export function LoadingScreen() {
    const [visible, setVisible] = useState(true)
    const [fadeOut, setFadeOut] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    /* Hide body content while loading */
    useEffect(() => {
        // Immediately hide overflow + set bg to match loading screen (prevents iOS flash)
        document.documentElement.style.overflow = "hidden"
        document.body.style.overflow = "hidden"
        document.body.style.backgroundColor = "#FEBEC3"

        return () => {
            document.documentElement.style.overflow = ""
            document.body.style.overflow = ""
        }
    }, [])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const dismiss = () => {
            setFadeOut(true)
            setTimeout(() => {
                setVisible(false)
                // Restore scrolling and show content
                document.documentElement.style.overflow = ""
                document.body.style.overflow = ""
                document.body.classList.add("app-loaded")
                document.body.style.background = ""
            }, 600)
        }

        const handleEnded = () => dismiss()
        video.addEventListener("ended", handleEnded)

        // Force play on iOS Safari — autoPlay attribute alone is not always enough
        // If autoplay is blocked (Safari macOS policy), dismiss immediately — don't show stuck green frame
        video.play().catch(() => dismiss())

        // Fallback: auto-dismiss after 5s
        const fallback = setTimeout(dismiss, 5000)

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
                autoPlay
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
                className="loading-video"
                style={{ pointerEvents: "none" }}
            >
                {/* MP4 first — no alpha issues, green baked out, works perfectly on Safari */}
                <source src="/loading-mascot.mp4" type="video/mp4" />
                <source src="/loading-mascot.webm" type="video/webm" />
            </video>
        </div>
    )
}
