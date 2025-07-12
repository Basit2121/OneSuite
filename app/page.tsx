"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([])
  const [usernameValue, setUsernameValue] = useState("")
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
    const form = e.currentTarget
    const username = usernameValue.trim() || (form.username as HTMLInputElement).value.trim()
    const email = (form.email as HTMLInputElement).value.trim()
    const confirm = (form.confirmPassword as HTMLInputElement).value

    if (password !== confirm) {
      toast({ variant: "destructive", title: "Password mismatch", description: "Passwords do not match." })
      return
    }

    if (getPasswordStrength(password) === "Weak") {
      toast({ variant: "destructive", title: "Weak password", description: "Password must be at least medium strength (10+ characters)." })
      return
    }

    if (!agreeToTerms) {
      toast({ variant: "destructive", title: "Terms required", description: "You must agree to the Terms & Conditions and Privacy Policy." })
      return
    }

    try {
      const res = await api.signup({ username, email, password, agreeToTerms })
      if (typeof window !== "undefined") {
        if (res?.user?.username) {
          localStorage.setItem("username", res.user.username)
        }
        if (res?.user?.avatar_url) {
          localStorage.setItem("avatar_url", res.user.avatar_url)
        }
        if (res?.user?.id !== undefined) {
          localStorage.setItem("user_id", String(res.user.id))
        }
      }
      toast({ title: "Account created", description: "Welcome!" })
      router.push("/dashboard")
    } catch (err: any) {
      // Check if the error response includes username suggestions
      if (err.suggestions && err.suggestions.length > 0) {
        setUsernameSuggestions(err.suggestions)
        toast({ 
          variant: "destructive", 
          title: "Username taken", 
          description: "Username is already taken. Check the suggestions below." 
        })
      } else {
        setUsernameSuggestions([])
        toast({ variant: "destructive", title: "Signup failed", description: err.message })
      }
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length < 8) return "Weak"
    if (password.length < 10) return "Medium"
    return "Strong"
  }

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case "Weak":
        return "text-red-500"
      case "Medium":
        return "text-yellow-500"
      case "Strong":
        return "text-green-500"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Sign up</h1>
            <p className="text-gray-600">Please enter your details to create your account.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <Input 
                id="username" 
                name="username" 
                type="text" 
                placeholder="Enter your username" 
                className="w-full"
                value={usernameValue}
                onChange={(e) => {
                  setUsernameValue(e.target.value)
                  setUsernameSuggestions([]) // Clear suggestions when user types
                }}
              />
              {usernameSuggestions.length > 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 mb-2">Suggested usernames:</p>
                  <div className="flex flex-wrap gap-2">
                    {usernameSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setUsernameValue(suggestion)
                          setUsernameSuggestions([])
                        }}
                        className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm rounded-md border border-yellow-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input id="email" name="email" type="email" placeholder="Enter your email" className="w-full" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {password && (
                <p className={`text-sm ${getPasswordStrengthColor(getPasswordStrength(password))}`}>
                  {getPasswordStrength(password)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{" "}
                <Link href="/terms" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "#f7c635" }}>
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "#f7c635" }}>
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <button
              className="w-full relative overflow-hidden border border-[#18181a] text-[#18181a] inline-block text-[15px] leading-[15px] py-[18px] px-[18px] no-underline cursor-pointer bg-white select-none touch-manipulation group after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-[#f7c635] after:transition-transform after:duration-[600ms] after:ease-[cubic-bezier(0.48,0,0.12,1)] after:translate-y-full hover:after:translate-y-0"
            >
              <span className="relative transition-colors duration-[600ms] ease-[cubic-bezier(0.48,0,0.12,1)] z-10 group-hover:opacity-0">
                Sign up
              </span>
              <span className="text-black block absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-[225%] transition-all duration-[500ms] ease-[cubic-bezier(0.48,0,0.12,1)] z-[100] opacity-0 h-[14px] leading-[13px] group-hover:transform group-hover:-translate-x-1/2 group-hover:-translate-y-1/2 group-hover:opacity-100 group-hover:transition-all group-hover:duration-[900ms] group-hover:ease-[cubic-bezier(0.48,0,0.12,1)]">
                Register
              </span>
            </button>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 bg-transparent"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign up with Google</span>
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/signin" className="hover:underline font-medium" style={{ color: "#f7c635" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - Illustration */}
      <div className="hidden md:flex flex-1 bg-gray-50 items-center justify-center p-8">
        <Image
          src="/images/register.jpg"
          alt="Office workers in meeting illustration"
          width={500}
          height={400}
          priority
          className="w-full h-auto max-w-lg"
        />
      </div>
    </div>
  )
}