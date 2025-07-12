"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from "lucide-react"
import Peer from "simple-peer"

interface PeerConnection {
  peer: Peer.Instance
  userId: string
  stream?: MediaStream
}

export default function MeetingRoom({ params }: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = React.use(params)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map())
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)
  const [moderatorStatus, setModeratorStatus] = useState<{
    is_moderator: boolean
    is_new_moderator: boolean
  } | null>(null)
  const [username, setUsername] = useState<string>("")
  const [isGuest, setIsGuest] = useState(false)
  const [guestName, setGuestName] = useState("")
  const [showGuestForm, setShowGuestForm] = useState(false)

  // Authentication check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = localStorage.getItem("username")
      if (!storedUsername) {
        setShowGuestForm(true)
        return
      }
      setUsername(storedUsername)
    }
  }, [router])

  // Join meeting and get moderator status
  useEffect(() => {
    const joinMeetingAndGetStatus = async () => {
      if (meetingId && (username || (isGuest && guestName))) {
        try {
          const userId = localStorage.getItem("user_id")
          const userIdNum = userId ? Number(userId) : undefined
          const response = await api.joinMeeting(
            meetingId, 
            isGuest ? undefined : userIdNum, 
            isGuest ? guestName : undefined
          )
          setModeratorStatus({
            is_moderator: response.is_moderator || false,
            is_new_moderator: response.is_new_moderator || false
          })
          
          if (response.is_new_moderator) {
            toast({ 
              title: "You're the moderator", 
              description: "You have moderator privileges for this meeting." 
            })
          }
        } catch (error) {
          console.error("Failed to join meeting:", error)
          setModeratorStatus({ is_moderator: false, is_new_moderator: false })
        }
      }
    }

    joinMeetingAndGetStatus()
  }, [meetingId, username, isGuest, guestName])

  // Initialize media stream
  useEffect(() => {
    if (typeof window === "undefined" || !meetingId || !moderatorStatus || !(username || (isGuest && guestName))) return

    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        
        setLocalStream(stream)
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        
        toast({ title: "Camera ready", description: "Your camera and microphone are active" })
        
      } catch (error) {
        console.error('Failed to get media stream:', error)
        toast({ 
          variant: "destructive", 
          title: "Media Error", 
          description: "Failed to access camera/microphone. Please check permissions." 
        })
      }
    }

    initializeMedia()

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [meetingId, moderatorStatus, username, isGuest, guestName])

  const handleLeaveMeeting = async () => {
    try {
      if (meetingId) {
        const userId = localStorage.getItem("user_id")
        const userIdNum = userId ? Number(userId) : undefined
        await api.leaveMeeting(meetingId, userIdNum)
      }
    } catch (error) {
      console.error('Error leaving meeting:', error)
    }
    
    // Cleanup peers
    peers.forEach(peerConnection => {
      peerConnection.peer.destroy()
    })
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    
    router.push('/meetings')
  }

  const handleGuestJoin = () => {
    if (guestName.trim()) {
      setIsGuest(true)
      setUsername(guestName)
      setShowGuestForm(false)
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoMuted(!videoTrack.enabled)
      }
    }
  }

  // Handle page unload
  useEffect(() => {
    const handleUnload = () => {
      if (meetingId) {
        const userId = localStorage.getItem("user_id")
        const userIdNum = userId ? Number(userId) : undefined
        // Use sendBeacon for reliable cleanup on page unload
        navigator.sendBeacon('/api/meetings/' + meetingId + '/leave', 
          JSON.stringify({ user_id: userIdNum }))
      }
    }

    window.addEventListener("beforeunload", handleUnload)
    return () => {
      window.removeEventListener("beforeunload", handleUnload)
    }
  }, [meetingId])

  if (!username && showGuestForm) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join Meeting as Guest</CardTitle>
            <p className="text-sm text-gray-600">Enter your name to join the meeting</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGuestJoin()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGuestJoin} className="flex-1" disabled={!guestName.trim()}>
                Join Meeting
              </Button>
              <Button variant="outline" onClick={() => router.push("/signin")} className="flex-1">
                Sign In Instead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!username) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-600">Preparing your meeting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen flex-col">
      {/* Meeting info overlay */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 rounded-lg p-2 flex items-center gap-2 text-white">
        <Users className="h-4 w-4" />
        <span className="text-sm">Meeting: {meetingId}</span>
        {moderatorStatus?.is_moderator && (
          <span className="text-xs bg-yellow-600 px-2 py-1 rounded">Moderator</span>
        )}
      </div>

      {/* Video container */}
      <div className="flex-1 bg-gray-900 relative">
        {/* Local video */}
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden z-10">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
            {isGuest ? guestName : "You"}
          </div>
        </div>
        
        {/* Remote videos grid */}
        <div className="w-full h-full flex items-center justify-center">
          {peers.size === 0 ? (
            <div className="text-center text-white">
              <h2 className="text-2xl font-semibold mb-2">Waiting for others to join...</h2>
              <p className="text-gray-300">Meeting ID: {meetingId}</p>
              {moderatorStatus?.is_new_moderator && (
                <p className="text-green-400 font-medium mt-2">You are the meeting moderator</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full h-full">
              {Array.from(peers.values()).map((peerConnection) => (
                <div key={peerConnection.userId} className="bg-black rounded-lg overflow-hidden relative">
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    ref={(video) => {
                      if (video && peerConnection.stream) {
                        video.srcObject = peerConnection.stream
                      }
                    }}
                  />
                  <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                    User {peerConnection.userId}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/70 rounded-full px-6 py-3">
        <Button
          size="sm"
          variant={isAudioMuted ? "destructive" : "secondary"}
          onClick={toggleAudio}
          className="rounded-full w-12 h-12 p-0"
        >
          {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Button
          size="sm"
          variant={isVideoMuted ? "destructive" : "secondary"}
          onClick={toggleVideo}
          className="rounded-full w-12 h-12 p-0"
        >
          {isVideoMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
        
        <Button
          size="sm"
          variant="destructive"
          onClick={handleLeaveMeeting}
          className="rounded-full w-12 h-12 p-0 bg-red-600 hover:bg-red-700"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}