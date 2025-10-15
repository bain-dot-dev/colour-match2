"use client"

import { useEffect, useRef } from "react"

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  twinkleSpeed: number
  twinklePhase: number
}

export const Starfield = () => {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Generate random stars
    const starCount = 100
    const stars: HTMLDivElement[] = []

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div")
      star.className = "star"

      const starData: Star = {
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleSpeed: Math.random() * 2 + 1,
        twinklePhase: Math.random() * Math.PI * 2,
      }

      star.style.left = `${starData.x}%`
      star.style.top = `${starData.y}%`
      star.style.width = `${starData.size}px`
      star.style.height = `${starData.size}px`
      star.style.animationDelay = `${starData.twinklePhase}s`
      star.style.animationDuration = `${starData.twinkleSpeed}s`

      stars.push(star)
      canvasRef.current?.appendChild(star)
    }

    return () => {
      stars.forEach(star => star.remove())
    }
  }, [])

  return <div ref={canvasRef} className="starfield" />
}
