'use client'
import { useEffect, useState } from "react"
import Router from "next/router"
import { Loader2 } from "lucide-react"

export default function PageLoader() {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleStart = () => setLoading(true)
    const handleComplete = () => setLoading(false)

    Router.events.on("routeChangeStart", handleStart)
    Router.events.on("routeChangeComplete", handleComplete)
    Router.events.on("routeChangeError", handleComplete)

    return () => {
      Router.events.off("routeChangeStart", handleStart)
      Router.events.off("routeChangeComplete", handleComplete)
      Router.events.off("routeChangeError", handleComplete)
    }
  }, [])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <Loader2 className="w-8 h-8 animate-spin text-black" />
    </div>
  )
} 