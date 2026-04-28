import { useEffect, useState } from 'react'

export default function useMediaDevices() {
  const [devices, setDevices] = useState({ cameras: [], microphones: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        const all = await navigator.mediaDevices.enumerateDevices()
        setDevices({
          cameras: all.filter((item) => item.kind === 'videoinput'),
          microphones: all.filter((item) => item.kind === 'audioinput')
        })
      } catch {
        setDevices({ cameras: [], microphones: [] })
      } finally {
        setLoading(false)
      }
    }

    loadDevices()
  }, [])

  return { ...devices, loading }
}
