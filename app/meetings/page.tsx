"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import Link from "next/link"
import SidebarNav from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Plus, Copy, StopCircle, PlayCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CalendarCheck, Users, BarChart3 } from "lucide-react"
import { ChartContainer } from "@/components/ui/chart"
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

interface Meeting {
  id: string
  created_at: string
  ended_at?: string | null
  duration_seconds?: number | null
  current_participants: number
  peak_participants: number
  total_joined: number
  moderator_id?: number | null
}

export default function MeetingsPage() {
  const [username, setUsername] = useState<string>("Meetings")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)

  // Derived stats & chart data
  const totalMeetings = meetings.length
  const activeMeetings = meetings.filter((m) => !m.ended_at).length
  const totalParticipants = meetings.reduce((sum, m) => sum + (m.total_joined ?? 0), 0)
  const maxPeak = meetings.reduce((max, m) => Math.max(max, m.peak_participants ?? 0), 0)

  // Aggregate meetings per month for bar chart (last 12 months)
  const barData = (() => {
    const now = new Date()
    // Build array of last 12 months
    const records: { key: string; label: string; count: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      // Build key in local time to avoid timezone shifting issues
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` // YYYY-MM
      const label = d.toLocaleString("default", { month: "short" })
      records.push({ key, label, count: 0 })
    }

    // Count meetings per month
    meetings.forEach((m) => {
      const monthKey = m.created_at.slice(0, 7)
      const rec = records.find((r) => r.key === monthKey)
      if (rec) rec.count += 1
    })

    return records.map(({ label, count }) => ({ label, count }))
  })()

  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if user is logged in, redirect to signin if not
      const storedUsername = localStorage.getItem("username")
      const storedUserId = localStorage.getItem("user_id")
      if (!storedUsername || !storedUserId) {
        router.push("/signin")
        return
      }
      
      // User is logged in, set the username and avatar
      setUsername(storedUsername)

      const storedAvatar = localStorage.getItem("avatar_url")
      if (storedAvatar) setAvatarUrl(storedAvatar)
    }

    // Fetch meetings from backend
    const fetchMeetings = async () => {
      try {
        const res = await api.listMeetings(Number(localStorage.getItem("user_id")))
        setMeetings(res.meetings as Meeting[])
      } catch (err: any) {
        toast({ variant: "destructive", title: "Error", description: err.message })
      } finally {
        setLoading(false)
      }
    }

    fetchMeetings()
  }, [router])

  const handleLogout = () => {
    // Clear any auth storage if used
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("username")
      localStorage.removeItem("avatar_url")
      localStorage.removeItem("user_id")
    }
    toast({ title: "Logged out", description: "See you next time!" })
    router.push("/signin")
  }

  const handleCreateMeeting = async () => {
    try {
      const userId = Number(localStorage.getItem("user_id"))
      const res = await api.createMeeting({ user_id: userId })
      const id = res?.meeting?.id as string
      toast({ title: "New meeting created", description: "Share the link with anyone to join." })
      router.push(`/meetings/${id}`)
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    }
  }

  // Copy invite URL to clipboard
  const handleCopyInvite = (id: string) => {
    if (typeof window === "undefined") return
    const url = `${window.location.origin}/meetings/${id}`
    navigator.clipboard
      .writeText(url)
      .then(() =>
        toast({ title: "Invite URL copied", description: "Share it with others to join the meeting." })
      )
      .catch(() =>
        toast({ variant: "destructive", title: "Error", description: "Failed to copy invite URL." })
      )
  }

  // End a meeting via backend and update local state
  const handleEndMeeting = async (id: string) => {
    try {
      const res = await api.endMeeting(id)
      const updated = res?.meeting as Meeting
      setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)))
      toast({ title: "Meeting ended", description: `Meeting ${id} has been ended.` })
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    }
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNav username={username} avatarUrl={avatarUrl} onLogout={handleLogout} />

      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
          <button
            onClick={handleCreateMeeting}
            className="relative overflow-hidden border border-[#18181a] text-[#18181a] inline-flex items-center gap-2 text-sm leading-[15px] py-[10px] px-6 cursor-pointer bg-white select-none group after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-[#f7c635] after:transition-transform after:duration-[600ms] after:ease-[cubic-bezier(0.48,0,0.12,1)] after:translate-y-full hover:after:translate-y-0"
          >
            <span className="relative z-10 flex items-center gap-2 transition-colors duration-[600ms] ease-[cubic-bezier(0.48,0,0.12,1)] group-hover:opacity-0">
              <Plus className="h-4 w-4" /> New Meeting
            </span>
            <span className="text-black absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-[225%] transition-all duration-[900ms] ease-[cubic-bezier(0.48,0,0.12,1)] z-20 opacity-0 group-hover:-translate-y-1/2 group-hover:opacity-100">
              Start!
            </span>
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[{
            title: "Total Meetings",
            value: totalMeetings,
            description: "All time",
            icon: CalendarCheck,
          }, {
            title: "Active Meetings",
            value: activeMeetings,
            description: "Currently ongoing",
            icon: PlayCircle,
          }, {
            title: "Total Participants",
            value: totalParticipants,
            description: "Across all meetings",
            icon: Users,
          }, {
            title: "Peak Participants",
            value: maxPeak,
            description: "Highest in a meeting",
            icon: BarChart3,
          }].map(card => (
            <Card key={card.title} className="flex items-center gap-4 p-4 shadow-sm border-0 bg-white rounded-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{backgroundColor: '#f7c635'}}>
                <card.icon className="h-6 w-6 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
                <span className="text-2xl font-bold">{card.value}</span>
                <span className="text-xs text-muted-foreground">{card.description}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-1">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Meetings</CardTitle>
              <CardDescription>Monthly meeting count</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer className="w-full h-52" config={{ count: { color: "#f7c635" } }}>
                <ReBarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" className="text-xs" />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: '0.75rem' }} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4,4,0,0]} />
                </ReBarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Peak</TableHead>
                <TableHead>Total Joined</TableHead>
                <TableHead>Moderator</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : meetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No meetings yet
                  </TableCell>
                </TableRow>
              ) : (
                meetings.map((m) => {
                  const currentUserId = Number(localStorage.getItem("user_id"))
                  const isCurrentUserModerator = m.moderator_id === currentUserId
                  
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <Link href={`/meetings/${m.id}`} className="hover:underline text-primary font-medium">
                          {m.id}
                        </Link>
                      </TableCell>
                      <TableCell>{new Date(m.created_at).toLocaleString()}</TableCell>
                      <TableCell>{m.current_participants}</TableCell>
                      <TableCell>{m.peak_participants}</TableCell>
                      <TableCell>{m.total_joined}</TableCell>
                      <TableCell>
                        {m.moderator_id ? (
                          isCurrentUserModerator ? (
                            <span className="text-green-600 font-medium">You</span>
                          ) : (
                            <span className="text-gray-600">Set</span>
                          )
                        ) : (
                          <span className="text-gray-400">TBD</span>
                        )}
                      </TableCell>
                      <TableCell className="flex gap-2 justify-end">
                      {!m.ended_at ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleCopyInvite(m.id)}>
                            <Copy className="h-4 w-4" /> Copy Link
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => router.push(`/meetings/${m.id}`)}>
                            <PlayCircle className="h-4 w-4" /> Join
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleEndMeeting(m.id)}>
                            <StopCircle className="h-4 w-4" /> End
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Ended</span>
                      )}
                    </TableCell>
                  </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  )
} 