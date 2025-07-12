"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

function ResetPasswordContent() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const username = localStorage.getItem("username")
      if (username) {
        router.push("/dashboard")
        return
      }
    }
  }, [router])

  useEffect(() => {
    if (!token) {
      toast({ variant: "destructive", title: "Invalid link", description: "Reset token is missing." })
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token) return

    if (password.length < 8) {
      toast({ variant: "destructive", title: "Error", description: "Password must be at least 8 characters." })
      return
    }
    if (password !== confirm) {
      toast({ variant: "destructive", title: "Error", description: "Passwords do not match." })
      return
    }

    setSubmitting(true)
    try {
      await api.resetPassword({ token, password })
      toast({ title: "Success", description: "Your password has been reset. You can now sign in." })
      router.push("/signin")
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column – Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Reset your password</h1>
          <p className="text-gray-600">Enter a new password for your account.</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !token}
              className="w-full relative overflow-hidden border border-[#18181a] text-[#18181a] inline-flex items-center justify-center gap-2 text-[15px] leading-[15px] py-[18px] px-[18px] no-underline cursor-pointer bg-white select-none touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed group after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-[#f7c635] after:transition-transform after:duration-[600ms] after:ease-[cubic-bezier(0.48,0,0.12,1)] after:translate-y-full hover:after:translate-y-0"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" /> Saving…
                </>
              ) : (
                <>
                  <span className="relative transition-opacity duration-[600ms] ease-[cubic-bezier(0.48,0,0.12,1)] z-10 group-hover:opacity-0">
                    Set new password
                  </span>
                  <span className="text-black block absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-[225%] transition-all duration-[500ms] ease-[cubic-bezier(0.48,0,0.12,1)] z-[100] opacity-0 h-[14px] leading-[13px] group-hover:transform group-hover:-translate-x-1/2 group-hover:-translate-y-1/2 group-hover:opacity-100 group-hover:transition-all group-hover:duration-[900ms] group-hover:ease-[cubic-bezier(0.48,0,0.12,1)]">
                    All set!
                  </span>
                </>
              )}
            </button>
          </form>

          <Button asChild variant="ghost" className="w-full">
            <Link href="/signin">Back to sign in</Link>
          </Button>
        </div>
      </div>

      {/* Right Column – Illustration */}
      <div className="hidden md:flex flex-1 bg-gray-50 items-center justify-center p-8">
        <Image
          src="/images/reset%20password.jpg"
          alt="Reset password illustration"
          width={500}
          height={400}
          priority
          className="w-full h-auto max-w-lg"
        />
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
} 