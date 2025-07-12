"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.forgotPassword({ email: email.trim() })
      toast({
        title: "Check your inbox",
        description: "If that account exists, a reset link has been sent.",
      })
      setEmailSent(true)
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="group gap-2 text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
          >
            <Link href="/signin" className="flex items-center">
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Back
            </Link>
          </Button>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Forgot password</h1>
            <p className="text-gray-600">
              {emailSent
                ? "If an account exists for that email, you'll receive a reset link shortly."
                : "Enter the email associated with your account and we'll send you a reset link."}
            </p>
          </div>

          {!emailSent && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden border border-[#18181a] text-[#18181a] inline-flex items-center justify-center gap-2 text-[15px] leading-[15px] py-[18px] px-[18px] no-underline cursor-pointer bg-white select-none touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed group after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-[#f7c635] after:transition-transform after:duration-[600ms] after:ease-[cubic-bezier(0.48,0,0.12,1)] after:translate-y-full after:z-0 hover:after:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" /> Sending...
                  </>
                ) : (
                  <>
                    <span className="relative transition-opacity duration-[600ms] ease-[cubic-bezier(0.48,0,0.12,1)] z-10 group-hover:opacity-0">
                      Send reset link
                    </span>
                    <span className="text-black block absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-[225%] transition-all duration-[500ms] ease-[cubic-bezier(0.48,0,0.12,1)] z-[100] opacity-0 h-[14px] leading-[13px] group-hover:transform group-hover:-translate-x-1/2 group-hover:-translate-y-1/2 group-hover:opacity-100 group-hover:transition-all group-hover:duration-[900ms] group-hover:ease-[cubic-bezier(0.48,0,0.12,1)]">
                      Let’s do it!
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {emailSent && (
            <Button asChild className="w-full mt-4">
              <Link href="/signin">Back to sign in</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Right Column - Illustration */}
      <div className="hidden md:flex flex-1 bg-gray-50 items-center justify-center p-8">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/login.jpg-vkT2jrr46oEcn7eagTF6CFU9Lt5Phw.jpeg"
          alt="Office workers in meeting illustration"
          width={500}
          height={400}
          className="w-full h-auto max-w-lg"
        />
      </div>
    </div>
  )
} 