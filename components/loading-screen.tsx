"use client"

import { useEffect, useState, useRef } from "react"

export function LoadingScreen() {
    const [visible, setVisible] = useState(true)
    const [fadeOut, setFadeOut] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    /* Hide body content while loading */
    useEffect(() => {
        // Immediately hide overflow + set bg to prevent flash
        document.documentElement.style.overflow = "hidden"
        document.body.style.overflow = "hidden"

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
                src="/loading-mascot.mp4?v=2"
                autoPlay
                muted
                playsInline
                className="loading-video"
            />
        </div>
    )
}
