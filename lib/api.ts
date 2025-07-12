const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

interface RequestOptions extends RequestInit {
  json?: unknown
}

async function request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { json, headers, ...rest } = options
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: json ? JSON.stringify(json) : undefined,
    ...rest,
  })

  let data: any = {}
  try {
    data = await res.json()
  } catch {
    // ignore empty body
  }

  if (!res.ok) {
    const errorData = data?.error || data?.message || `Request failed with ${res.status}`
    const error = new Error(errorData) as any
    // Pass along any suggestions from the API response
    if (data?.suggestions) {
      error.suggestions = data.suggestions
    }
    throw error
  }
  return data as T
}

export const api = {
  signup: (payload: { username: string; email: string; password: string; agreeToTerms: boolean }) =>
    request("/api/signup", { method: "POST", json: payload }),
  login: (payload: { email: string; password: string }) =>
    request("/api/login", { method: "POST", json: payload }),
  forgotPassword: (payload: { email: string }) =>
    request("/api/forgot-password", { method: "POST", json: payload }),
  resetPassword: (payload: { token: string; password: string }) =>
    request("/api/reset-password", { method: "POST", json: payload }),

  // Meetings -----------------------------------------------------------
  createMeeting: (payload?: { id?: string; user_id?: number }) =>
    request("/api/meetings", { method: "POST", json: payload || {} }),
  joinMeeting: (id: string, user_id?: number, guest_name?: string) =>
    request(`/api/meetings/${id}/join`, { 
      method: "POST", 
      json: user_id ? { user_id } : guest_name ? { guest_name } : {} 
    }),
  leaveMeeting: (id: string, user_id?: number) =>
    request(`/api/meetings/${id}/leave`, { method: "POST", json: user_id ? { user_id } : {} }),
  endMeeting: (id: string) =>
    request(`/api/meetings/${id}/end`, { method: "POST" }),

  listMeetings: (userId?: number) =>
    request(userId ? `/api/meetings?user_id=${userId}` : "/api/meetings", { method: "GET" }),
  getMeeting: (id: string) => request(`/api/meetings/${id}`, { method: "GET" }),

  // WebRTC Signaling
  sendSignal: (meetingId: string, signal: { from_user: string; to_user?: string; signal_type: string; signal_data: any }) =>
    request(`/api/meetings/${meetingId}/signal`, { method: "POST", json: signal }),
  getSignals: (meetingId: string, userId: string, lastId?: string) =>
    request(`/api/meetings/${meetingId}/signal?user_id=${userId}${lastId ? `&last_id=${lastId}` : ''}`, { method: "GET" }),
}