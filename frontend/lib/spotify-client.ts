/**
 * Spotify Client - Simple client to interact with backend Spotify endpoints
 * Assumes backend is already authenticated (token stored server-side)
 */

type Emotion = "feliz" | "triste" | "neutral" | "enojado" | "sorprendido" | "disgusto" | "miedo"

// Map Spanish (frontend) emotions to English lowercase (backend)
const emotionMapping: Record<Emotion, string> = {
  'feliz': 'happy',
  'triste': 'sad',
  'neutral': 'neutral',
  'enojado': 'angry',
  'sorprendido': 'surprise',
  'disgusto': 'disgust',
  'miedo': 'fear',
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Play music based on emotion
 * Backend endpoint: POST /api/spotify/play
 */
export async function playEmotion(emotion: Emotion): Promise<boolean> {
  try {
    const backendEmotion = emotionMapping[emotion]

    const response = await fetch(`${BACKEND_URL}/api/spotify/play`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emotion: backendEmotion }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[Spotify] Error playing music:', errorData)
      return false
    }

    const data = await response.json()
    console.log('[Spotify] Music started:', data.message)
    return true

  } catch (error) {
    console.error('[Spotify] Failed to play emotion:', error)
    return false
  }
}

/**
 * Pause current playback
 * Backend endpoint: GET /api/spotify/pause
 */
export async function pauseMusic(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/spotify/pause`, {
      method: 'GET',
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[Spotify] Error pausing music:', errorData)
      return false
    }

    const data = await response.json()
    console.log('[Spotify] Music paused:', data.message)
    return true

  } catch (error) {
    console.error('[Spotify] Failed to pause:', error)
    return false
  }
}

/**
 * Get available devices
 * Backend endpoint: GET /api/spotify/devices
 */
export async function getDevices(): Promise<any[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/spotify/devices`, {
      method: 'GET',
    })

    if (!response.ok) {
      console.error('[Spotify] Error getting devices')
      return []
    }

    const data = await response.json()
    return data.devices || []

  } catch (error) {
    console.error('[Spotify] Failed to get devices:', error)
    return []
  }
}
