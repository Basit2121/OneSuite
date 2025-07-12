"use client"

import { Calendar, MessageCircle, FolderUp, ListTodo, LogOut, Menu, LayoutDashboard, Settings as SettingsIcon, CreditCard, HelpCircle, BookOpen, Rocket } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface SidebarNavProps {
  username: string
  avatarUrl?: string
  onLogout: () => void
}

export default function SidebarNav({ username, avatarUrl, onLogout }: SidebarNavProps) {
  const pathname = usePathname()
  
  const sections = [
    {
      title: "General",
      items: [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "#get-started", icon: Rocket, label: "Get Started" },
      ],
    },
    {
      title: "Workspace",
      items: [
        { href: "/meetings", icon: Calendar, label: "Meetings" },
        { href: "#chat", icon: MessageCircle, label: "Chat" },
        { href: "#file-transfer", icon: FolderUp, label: "File Transfer" },
        { href: "#form-builder", icon: ListTodo, label: "Form Builder" },
      ],
    },
    {
      title: "Account",
      items: [
        { href: "#subscriptions", icon: CreditCard, label: "Subscriptions" },
        { href: "#settings", icon: SettingsIcon, label: "Settings" },
      ],
    },
    {
      title: "Support",
      items: [
        { href: "#help-center", icon: HelpCircle, label: "Help Center" },
        { href: "#faqs", icon: BookOpen, label: "FAQs" },
      ],
    },
  ]

  const NavContent = () => (
    <div className="flex h-full flex-col">
      {/* User header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Avatar className="h-12 w-12 ring-2 ring-primary">
          <AvatarImage src={avatarUrl || `https://api.dicebear.com/8.x/adventurer-neutral/svg?seed=${encodeURIComponent(username)}`} alt={username} />
          <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-none">{username}</span>
          <span className="text-xs text-muted-foreground">Free</span>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto" onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 mt-3 space-y-2 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </span>
            {section.items.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-muted text-foreground font-semibold" 
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-2 left-2 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[251px]">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-[251px] h-screen border-r bg-background">
        <NavContent />
      </aside>
    </>
  )
} 