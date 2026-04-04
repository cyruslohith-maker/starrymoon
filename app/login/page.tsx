"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PageLayout } from "@/components/page-layout"
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react"

/* ─── Declare global Google Identity Services type ── */
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string
                        callback: (response: { credential: string }) => void
                        auto_select?: boolean
                    }) => void
                    renderButton: (
                        element: HTMLElement,
                        options: {
                            theme?: string
                            size?: string
                            width?: number
                            text?: string
                            shape?: string
                            logo_alignment?: string
                        }
                    ) => void
                    prompt: () => void
                }
            }
        }
    }
}

export default function LoginPage() {
    const { login, googleLogin, user } = useAuth()
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [gsiReady, setGsiReady] = useState(false)
    const googleBtnRef = useRef<HTMLDivElement>(null)

    // If already logged in, redirect
    if (user) {
        if (user.role === "owner" || user.role === "employee") {
            router.push("/dashboard")
        } else {
            router.push("/")
        }
        return null
    }

    const handleGoogleResponse = useCallback(
        async (response: { credential: string }) => {
            setError("")
            setGoogleLoading(true)

            const result = await googleLogin(response.credential)
            setGoogleLoading(false)

            if (result.ok && result.user) {
                // Redirect owners/employees to dashboard, customers to home
                if (result.user.role === "owner" || result.user.role === "employee") {
                    router.push("/dashboard")
                } else {
                    router.push("/")
                }
            } else {
                setError(result.error || "Google sign-in failed")
            }
        },
        [googleLogin, router]
    )

    /* eslint-disable react-hooks/rules-of-hooks */
    useEffect(() => {
        if (!gsiReady) return

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        if (!clientId || !window.google) return

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleResponse,
        })

        // Render the Google button inside our container
        if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = ""
            window.google.accounts.id.renderButton(googleBtnRef.current, {
                theme: "outline",
                size: "large",
                width: 360,
                text: "continue_with",
                shape: "pill",
                logo_alignment: "left",
            })
        }
    }, [gsiReady, handleGoogleResponse])
    /* eslint-enable react-hooks/rules-of-hooks */

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        const result = await login(email, password)
        setLoading(false)

        if (result.ok) {
            router.push("/")
        } else {
            setError(result.error || "Invalid credentials")
        }
    }

    return (
        <PageLayout>
            {/* Google Identity Services Script */}
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={() => setGsiReady(true)}
            />

            <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
                <div className="w-full max-w-sm">
                    <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
                        {/* Header */}
                        <div className="mb-6 flex flex-col items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                                <Lock className="h-7 w-7 text-primary" />
                            </div>
                            <h1 className="font-serif text-xl font-bold text-foreground">Welcome Back</h1>
                            <p className="text-center text-xs text-muted-foreground">
                                Sign in to your Starrymoon account
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2.5">
                                <p className="text-xs font-semibold text-destructive">{error}</p>
                            </div>
                        )}

                        {/* ─── Google Sign-In Button (rendered by Google SDK) ─── */}
                        <div className="mb-5 flex justify-center">
                            <div ref={googleBtnRef} id="google-signin-container">
                                {/* Google renders the button here */}
                                {!gsiReady && (
                                    <div className="flex h-[44px] w-full items-center justify-center rounded-full border border-border bg-white text-xs text-muted-foreground">
                                        Loading Google Sign-In...
                                    </div>
                                )}
                            </div>
                        </div>

                        {googleLoading && (
                            <p className="mb-4 text-center text-xs text-primary font-semibold animate-pulse">
                                Signing in with Google...
                            </p>
                        )}

                        {/* ─── OR Divider ─── */}
                        <div className="relative mb-5 flex items-center" role="separator">
                            <div className="flex-1 border-t border-border" />
                            <span className="mx-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                or
                            </span>
                            <div className="flex-1 border-t border-border" />
                        </div>

                        {/* ─── Email / Password Form ─── */}
                        <form onSubmit={handleSubmit}>
                            {/* Email */}
                            <div className="mb-4">
                                <label htmlFor="login-email" className="mb-1 block text-xs font-bold text-muted-foreground">
                                    Email
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                                />
                            </div>

                            {/* Password */}
                            <div className="mb-6">
                                <label htmlFor="login-password" className="mb-1 block text-xs font-bold text-muted-foreground">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Your password"
                                        required
                                        minLength={6}
                                        className="w-full rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm outline-none transition-colors focus:border-primary"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                id="email-signin-btn"
                                disabled={loading}
                                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                            >
                                {loading ? "Signing in..." : "Sign In"}
                            </button>
                        </form>

                        {/* Register link */}
                        <div className="mt-5 text-center">
                            <p className="text-xs text-muted-foreground">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/register"
                                    className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                                >
                                    Create one <ArrowRight className="h-3 w-3" />
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}
