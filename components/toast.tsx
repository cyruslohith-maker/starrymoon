"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { CheckCircle2, AlertCircle, X } from "lucide-react"

type ToastType = "success" | "error"

interface Toast {
    id: number
    message: string
    type: ToastType
}

interface ToastContextValue {
    success: (message: string) => void
    error: (message: string) => void
}

const ToastContext = createContext<ToastContextValue>({
    success: () => {},
    error: () => {},
})

export const useToast = () => useContext(ToastContext)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = ++nextId
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 3500)
    }, [])

    const success = useCallback((msg: string) => addToast(msg, "success"), [addToast])
    const error = useCallback((msg: string) => addToast(msg, "error"), [addToast])

    const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

    return (
        <ToastContext.Provider value={{ success, error }}>
            {children}

            {/* Toast container — bottom-right */}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 sm:bottom-6 sm:right-6">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-5 fade-in duration-300 ${
                            t.type === "success"
                                ? "border-emerald-200 bg-emerald-50/95 text-emerald-800"
                                : "border-red-200 bg-red-50/95 text-red-800"
                        }`}
                        style={{ minWidth: "240px", maxWidth: "360px" }}
                    >
                        {t.type === "success" ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                        )}
                        <p className="flex-1 text-xs font-semibold">{t.message}</p>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
