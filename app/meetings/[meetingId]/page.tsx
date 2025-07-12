"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Copy, LogOut } from "lucide-react"
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
  const [meetingEnded, setMeetingEnded] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [lastSignalId, setLastSignalId] = useState("0")
  const [connectedPeers, setConnectedPeers] = useState<Set<string>>(new Set())
  const [hasAnnounced, setHasAnnounced] = useState(false)

  // Authentication check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUsername = localStorage.getItem("username")
      if (!storedUsername) {
        setShowGuestForm(true)
        return
      }
      setUsername(storedUsername)
      
      // Set user ID for signaling
      const storedUserId = localStorage.getItem("user_id")
      setUserId(storedUserId || `guest_${Date.now()}`)
    }
  }, [router])

  // Set guest user ID
  useEffect(() => {
    if (isGuest && guestName && !userId) {
      setUserId(`guest_${guestName}_${Date.now()}`)
    }
  }, [isGuest, guestName, userId])

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

  // WebRTC peer connection management
  const createPeerConnection = (remoteUserId: string, initiator: boolean) => {
    if (!localStream) return null

    const peer = new Peer({
      initiator,
      trickle: false,
      stream: localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      }
    })

    peer.on('signal', async (signal) => {
      try {
        await api.sendSignal(meetingId, {
          from_user: userId,
          to_user: remoteUserId,
          signal_type: 'webrtc-signal',
          signal_data: signal
        })
      } catch (error) {
        console.error('Error sending signal:', error)
      }
    })

    peer.on('stream', (stream) => {
      setPeers(prev => {
        const newPeers = new Map(prev)
        const existingPeer = newPeers.get(remoteUserId)
        if (existingPeer) {
          newPeers.set(remoteUserId, {
            ...existingPeer,
            stream
          })
        }
        return newPeers
      })
    })

    peer.on('connect', () => {
      console.log(`Connected to peer ${remoteUserId}`)
      setConnectedPeers(prev => new Set(prev).add(remoteUserId))
    })

    peer.on('close', () => {
      console.log(`Peer ${remoteUserId} connection closed`)
      setConnectedPeers(prev => {
        const newSet = new Set(prev)
        newSet.delete(remoteUserId)
        return newSet
      })
      setPeers(prev => {
        const newPeers = new Map(prev)
        newPeers.delete(remoteUserId)
        return newPeers
      })
    })

    peer.on('error', (error) => {
      console.error('Peer connection error:', error)
      setConnectedPeers(prev => {
        const newSet = new Set(prev)
        newSet.delete(remoteUserId)
        return newSet
      })
      setPeers(prev => {
        const newPeers = new Map(prev)
        newPeers.delete(remoteUserId)
        return newPeers
      })
    })

    return peer
  }

  // Signal polling for WebRTC
  useEffect(() => {
    if (!meetingId || !userId || !localStream || meetingEnded) return

    const pollSignals = async () => {
      try {
        const response = await api.getSignals(meetingId, userId, lastSignalId)
        const signals = response.signals || []

        for (const signal of signals) {
          if (signal.signal_type === 'webrtc-signal') {
            const existingPeer = peers.get(signal.from_user)
            
            if (existingPeer) {
              // Handle signal for existing peer
              try {
                existingPeer.peer.signal(signal.signal_data)
              } catch (error) {
                console.error('Error processing signal:', error)
              }
            } else {
              // Create new peer connection only if we don't already have one
              if (!connectedPeers.has(signal.from_user)) {
                const peer = createPeerConnection(signal.from_user, false)
                if (peer) {
                  setPeers(prev => {
                    const newPeers = new Map(prev)
                    newPeers.set(signal.from_user, {
                      peer,
                      userId: signal.from_user
                    })
                    return newPeers
                  })
                  try {
                    peer.signal(signal.signal_data)
                  } catch (error) {
                    console.error('Error processing initial signal:', error)
                  }
                }
              }
            }
          } else if (signal.signal_type === 'user-joined') {
            // Another user joined, initiate connection only if we don't have one
            if (!connectedPeers.has(signal.from_user) && !peers.has(signal.from_user)) {
              const peer = createPeerConnection(signal.from_user, true)
              if (peer) {
                setPeers(prev => {
                  const newPeers = new Map(prev)
                  newPeers.set(signal.from_user, {
                    peer,
                    userId: signal.from_user
                  })
                  return newPeers
                })
              }
            }
          } else if (signal.signal_type === 'user-left') {
            // User left, cleanup their connection
            const existingPeer = peers.get(signal.from_user)
            if (existingPeer) {
              existingPeer.peer.destroy()
            }
            setPeers(prev => {
              const newPeers = new Map(prev)
              newPeers.delete(signal.from_user)
              return newPeers
            })
            setConnectedPeers(prev => {
              const newSet = new Set(prev)
              newSet.delete(signal.from_user)
              return newSet
            })
          }

          setLastSignalId(signal.id.toString())
        }
      } catch (error) {
        console.error('Error polling signals:', error)
      }
    }

    // Announce presence only once
    const announcePresence = async () => {
      if (!hasAnnounced) {
        try {
          await api.sendSignal(meetingId, {
            from_user: userId,
            signal_type: 'user-joined',
            signal_data: { username: username || guestName }
          })
          setHasAnnounced(true)
        } catch (error) {
          console.error('Error announcing presence:', error)
        }
      }
    }

    // Initial announcement
    announcePresence()

    // Start polling with longer interval to reduce load
    const interval = setInterval(pollSignals, 2000) // Reduced frequency
    return () => clearInterval(interval)
  }, [meetingId, userId, localStream, meetingEnded, lastSignalId, peers, connectedPeers, username, guestName, hasAnnounced])

  const handleLeaveMeeting = async () => {
    try {
      // Announce leaving to other peers
      if (userId) {
        await api.sendSignal(meetingId, {
          from_user: userId,
          signal_type: 'user-left',
          signal_data: { username: username || guestName }
        })
      }
      
      if (meetingId) {
        const storedUserId = localStorage.getItem("user_id")
        const userIdNum = storedUserId ? Number(storedUserId) : undefined
        await api.leaveMeeting(meetingId, userIdNum)
      }
    } catch (error) {
      console.error('Error leaving meeting:', error)
    }
    
    // Cleanup peers
    peers.forEach(peerConnection => {
      peerConnection.peer.destroy()
    })
    setPeers(new Map())
    setConnectedPeers(new Set())
    
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

  const copyInviteUrl = () => {
    const inviteUrl = `${window.location.origin}/meetings/${meetingId}`
    navigator.clipboard.writeText(inviteUrl).then(() => {
      toast({
        title: "Invite URL copied!",
        description: "Share this link with others to join the meeting."
      })
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy invite URL to clipboard."
      })
    })
  }

  const handleEndMeeting = async () => {
    if (!moderatorStatus?.is_moderator) return
    
    try {
      await api.endMeeting(meetingId)
      toast({
        title: "Meeting ended",
        description: "The meeting has been ended for all participants."
      })
      setMeetingEnded(true)
      
      // Cleanup and redirect
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      peers.forEach(peerConnection => {
        peerConnection.peer.destroy()
      })
      
      setTimeout(() => {
        router.push('/meetings')
      }, 2000)
    } catch (error) {
      console.error('Error ending meeting:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to end the meeting."
      })
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

  // Check if meeting ended (polling)
  useEffect(() => {
    if (!meetingId || meetingEnded) return

    const checkMeetingStatus = async () => {
      try {
        const meeting = await api.getMeeting(meetingId)
        if (meeting.status === 'ended') {
          setMeetingEnded(true)
          toast({
            title: "Meeting ended",
            description: "The moderator has ended this meeting."
          })
          
          // Cleanup
          if (localStream) {
            localStream.getTracks().forEach(track => track.stop())
          }
          peers.forEach(peerConnection => {
            peerConnection.peer.destroy()
          })
          
          setTimeout(() => {
            router.push('/meetings')
          }, 3000)
        }
      } catch (error) {
        console.error('Error checking meeting status:', error)
      }
    }

    const interval = setInterval(checkMeetingStatus, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [meetingId, meetingEnded, localStream, peers, router])

  if (meetingEnded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Meeting Ended</h2>
            <p className="text-gray-600 mb-4">This meeting has been ended by the moderator.</p>
            <Button onClick={() => router.push('/meetings')}>
              Return to Meetings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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

      {/* Invite button */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={copyInviteUrl}
          className="bg-black/50 text-white hover:bg-black/70"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Invite
        </Button>
        {moderatorStatus?.is_moderator && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleEndMeeting}
            className="bg-red-600/80 hover:bg-red-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            End Meeting
          </Button>
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