"use client"

import { useEffect, useRef } from "react"

interface ConfettiProps {
  active: boolean
  playerColor?: string
}

interface ConfettiPiece {
  x: number
  y: number
  color: string
  size: number
  speedX: number
  speedY: number
  rotation: number
}

export const Confetti: React.FC<ConfettiProps> = ({ active, playerColor = "#FFD700" }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const confettiCount = 50
    const confettiPieces: HTMLDivElement[] = []
    const colors = [playerColor, "#FF00FF", "#00FFFF", "#FFD700", "#FF0055", "#39FF14"]

    for (let i = 0; i < confettiCount; i++) {
      const piece = document.createElement("div")
      piece.className = "confetti-piece"

      const confettiData: ConfettiPiece = {
        x: Math.random() * 100,
        y: -10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        speedX: (Math.random() - 0.5) * 2,
        speedY: Math.random() * 2 + 1,
        rotation: Math.random() * 360,
      }

      piece.style.left = `${confettiData.x}%`
      piece.style.top = `${confettiData.y}%`
      piece.style.width = `${confettiData.size}px`
      piece.style.height = `${confettiData.size}px`
      piece.style.backgroundColor = confettiData.color
      piece.style.animationDelay = `${Math.random() * 0.5}s`
      piece.style.animationDuration = `${Math.random() * 2 + 2}s`

      confettiPieces.push(piece)
      containerRef.current?.appendChild(piece)
    }

    const timeout = setTimeout(() => {
      confettiPieces.forEach(piece => piece.remove())
    }, 4000)

    return () => {
      clearTimeout(timeout)
      confettiPieces.forEach(piece => piece.remove())
    }
  }, [active, playerColor])

  if (!active) return null

  return <div ref={containerRef} className="confetti-container" />
}
