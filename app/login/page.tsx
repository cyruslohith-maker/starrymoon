"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PageLayout } from "@/components/page-layout"
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react"

/* ─── Inline Google "G" SVG ─────────────────────── */
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    )
}

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

            if (result.ok) {
                router.push("/")
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
    }, [gsiReady, handleGoogleResponse])
    /* eslint-enable react-hooks/rules-of-hooks */

    const handleGoogleClick = () => {
        if (window.google) {
            window.google.accounts.id.prompt()
        } else {
            setError("Google Sign-In is loading. Please try again.")
        }
    }

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

                        {/* ─── Google Sign-In Button ─── */}
                        <button
                            type="button"
                            id="google-signin-btn"
                            onClick={handleGoogleClick}
                            disabled={googleLoading}
                            className="group relative mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 active:scale-[0.98] disabled:opacity-50"
                            style={{ minHeight: "48px" }}
                            aria-label="Sign in with Google"
                        >
                            <GoogleIcon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                            <span>{googleLoading ? "Signing in..." : "Continue with Google"}</span>
                        </button>

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
