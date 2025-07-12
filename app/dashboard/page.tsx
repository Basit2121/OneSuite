"use client"

import React, { useEffect, useState } from "react"
import SidebarNav from "@/components/sidebar-nav"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import {
  Area,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart as ReAreaChart,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts"

export default function DashboardPage() {
  const router = useRouter()

  const [username, setUsername] = useState<string>("Dashboard")
  const [avatarUrl, setAvatarUrl] = useState<string>("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if user is logged in, redirect to signin if not
      const storedUsername = localStorage.getItem("username")
      if (!storedUsername) {
        router.push("/signin")
        return
      }
      
      // User is logged in, set the username and avatar
      setUsername(storedUsername)

      const storedAvatar = localStorage.getItem("avatar_url")
      if (storedAvatar) {
        setAvatarUrl(storedAvatar)
      }
      // ensure user id exists; optional further logic
    }
  }, [router])

  const handleLogout = () => {
    // Clear any auth storage if used
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("username")
      localStorage.removeItem("avatar_url")
    }
    localStorage.removeItem("user_id")
    toast({ title: "Logged out", description: "See you next time!" })
    router.push("/signin")
  }

  const chartData = [
    { month: "Jan", meetings: 5, files: 10 },
    { month: "Feb", meetings: 8, files: 12 },
    { month: "Mar", meetings: 6, files: 9 },
    { month: "Apr", meetings: 10, files: 15 },
    { month: "May", meetings: 12, files: 18 },
    { month: "Jun", meetings: 9, files: 14 },
  ];

  const barData = chartData.map(d => ({ month: d.month, chats: Math.round(d.meetings * 1.6) }))

  const pieData = [
    { name: "Meetings", value: 40, key: "meetings" },
    { name: "Chats", value: 25, key: "chats" },
    { name: "Files", value: 20, key: "files" },
    { name: "Forms", value: 15, key: "forms" },
  ]

  return (
    <div className="flex min-h-screen">
      <SidebarNav username={username} avatarUrl={avatarUrl} onLogout={handleLogout} />

      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Summary cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[{
            title: "Meetings",
            value: 12,
            description: "Active this week"
          }, {
            title: "Chat Rooms",
            value: 8,
            description: "Active conversations"
          }, {
            title: "Files Sent",
            value: 42,
            description: "This month"
          }, {
            title: "Forms Created",
            value: 5,
            description: "Total templates"
          }].map(card => (
            <Card key={card.title}>
              <CardHeader className="pb-2">
                <CardDescription>{card.title}</CardDescription>
                <CardTitle className="text-4xl">{card.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Area Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Activity</CardTitle>
              <CardDescription>Meetings vs Files transferred</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer
                className="w-full"
                config={{ meetings: { color: "hsl(var(--primary))" }, files: { color: "hsl(var(--chart-2))" } }}
              >
                <ReAreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ fontSize: '0.75rem' }} />
                  <Area
                    type="monotone"
                    dataKey="meetings"
                    stroke="var(--color-meetings)"
                    fill="var(--color-meetings)"
                    fillOpacity={0.25}
                  />
                  <Area
                    type="monotone"
                    dataKey="files"
                    stroke="var(--color-files)"
                    fill="var(--color-files)"
                    fillOpacity={0.25}
                  />
                </ReAreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Chat Volume</CardTitle>
              <CardDescription>Number of active chat rooms per month</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ChartContainer className="w-full" config={{ chats: { color: "hsl(var(--primary))" } }}>
                <ReBarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: '0.75rem' }} />
                  <Bar dataKey="chats" fill="var(--color-chats)" radius={[4,4,0,0]} />
                </ReBarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage</CardTitle>
              <CardDescription>Distribution of overall platform usage</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex justify-center">
              <ChartContainer
                className="max-w-xs"
                config={{
                  meetings: { color: "hsl(var(--chart-1))" },
                  chats: { color: "hsl(var(--chart-2))" },
                  files: { color: "hsl(var(--chart-3))" },
                  forms: { color: "hsl(var(--chart-4))" },
                }}
              >
                <RePieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={4}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={`var(--color-${entry.key})`} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '0.75rem' }} />
                </RePieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 