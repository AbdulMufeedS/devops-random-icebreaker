import React, { useState, useEffect, useRef } from 'react'

// Default names requested by lab assignment
const DEFAULT_NAMES = ['Ava', 'Noah', 'Priya', 'Mateo', 'Zoe', 'Leon']

// Vibrant, curated color palette for wheel segments and chips
// Featuring Cream, Coral, Teal, Marigold / Yellow
const SEGMENT_COLORS = [
  '#FF5E5B', // Vibrant Coral
  '#0E8388', // Deep Teal
  '#F9C74F', // Marigold / Golden Yellow
  '#14919B', // Bright Teal
  '#F3722C', // Coral Orange
  '#2E4F4F', // Dark Teal
  '#F8961E', // Warm Marigold
  '#E05350', // Crimson Coral
  '#43AA8B', // Teal Green
  '#90BE6D', // Soft Spring Green
]

export default function App() {
  const [names, setNames] = useState(DEFAULT_NAMES)
  const [inputValue, setInputValue] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedWinner, setSelectedWinner] = useState(null)
  const [removeWinnerAfterSpin, setRemoveWinnerAfterSpin] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [spinDuration, setSpinDuration] = useState(4.2)
  const [inputError, setInputError] = useState('')

  const canvasRef = useRef(null)
  const confettiCanvasRef = useRef(null)
  const confettiAnimId = useRef(null)
  const currentRotationRef = useRef(0)

  // Keep ref updated with current rotation
  useEffect(() => {
    currentRotationRef.current = rotation
  }, [rotation])

  // Draw wheel on canvas whenever names change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const size = 600
    const dpr = window.devicePixelRatio || 1

    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - 16

    ctx.clearRect(0, 0, size, size)

    // Handle empty or 1 name edge case
    if (names.length === 0) {
      // Draw placeholder circle
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
      ctx.fillStyle = '#F3EDE0'
      ctx.fill()
      ctx.lineWidth = 8
      ctx.strokeStyle = '#E7DECD'
      ctx.stroke()

      ctx.fillStyle = '#8C96A0'
      ctx.font = '600 20px "Plus Jakarta Sans", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Add names to populate wheel', cx, cy)
      return
    }

    const total = names.length
    const arcAngle = (2 * Math.PI) / total

    // Draw segment arcs
    for (let i = 0; i < total; i++) {
      // 12 o'clock is -Math.PI / 2
      const startAngle = -Math.PI / 2 + i * arcAngle
      const endAngle = -Math.PI / 2 + (i + 1) * arcAngle
      const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length]

      // Draw segment slice
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()

      // Outer segment border
      ctx.lineWidth = 2
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
      ctx.stroke()

      // Segment text rendering
      ctx.save()
      ctx.translate(cx, cy)
      // Rotate to bisector of segment
      ctx.rotate(-Math.PI / 2 + i * arcAngle + arcAngle / 2)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#FFFFFF'

      // Dynamic font sizing based on slice count and name length
      let fontSize = total > 12 ? 14 : total > 8 ? 16 : 20
      ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", sans-serif`
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1

      // Format name if too long
      let displayName = names[i]
      if (displayName.length > 14) {
        displayName = displayName.substring(0, 12) + '…'
      }

      ctx.fillText(displayName, radius - 28, 0)
      ctx.restore()
    }

    // Draw outer decorative rim
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
    ctx.lineWidth = 10
    ctx.strokeStyle = '#FAF7EE'
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, radius + 5, 0, 2 * Math.PI)
    ctx.lineWidth = 3
    ctx.strokeStyle = '#0E8388'
    ctx.stroke()

    // Draw pegs around perimeter
    const pegCount = Math.max(total, 12)
    for (let p = 0; p < pegCount; p++) {
      const angle = (p * 2 * Math.PI) / pegCount
      const px = cx + (radius - 2) * Math.cos(angle)
      const py = cy + (radius - 2) * Math.sin(angle)

      ctx.beginPath()
      ctx.arc(px, py, 4, 0, 2 * Math.PI)
      ctx.fillStyle = '#FAF7EE'
      ctx.fill()
      ctx.lineWidth = 1.5
      ctx.strokeStyle = '#2E4F4F'
      ctx.stroke()
    }
  }, [names])

  // Confetti Particle System
  const triggerConfetti = () => {
    const canvas = confettiCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.parentElement.clientWidth
    const height = canvas.parentElement.clientHeight
    const dpr = window.devicePixelRatio || 1

    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    if (confettiAnimId.current) {
      cancelAnimationFrame(confettiAnimId.current)
    }

    const confettiCount = 110
    const colors = ['#FF5E5B', '#0E8388', '#F9C74F', '#14919B', '#FFFFFF', '#F3722C']
    const particles = []

    for (let i = 0; i < confettiCount; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 60,
        y: height / 2 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 11 - 5,
        gravity: 0.38,
        drag: 0.982,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 5,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
      })
    }

    const startTime = performance.now()
    const duration = 2800 // 2.8 seconds

    const render = (now) => {
      const elapsed = now - startTime
      if (elapsed > duration) {
        ctx.clearRect(0, 0, width, height)
        return
      }

      ctx.clearRect(0, 0, width, height)

      particles.forEach((p) => {
        p.vy += p.gravity
        p.vx *= p.drag
        p.vy *= p.drag
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotSpeed
        p.opacity = Math.max(0, 1 - elapsed / duration)

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, 2 * Math.PI)
          ctx.fill()
        }
        ctx.restore()
      })

      confettiAnimId.current = requestAnimationFrame(render)
    }

    confettiAnimId.current = requestAnimationFrame(render)
  }

  // Add Name Handler
  const handleAddName = (e) => {
    e?.preventDefault()
    const trimmed = inputValue.trim()

    if (!trimmed) {
      setInputError('Please enter a name.')
      return
    }

    if (names.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setInputError(`"${trimmed}" is already on the wheel.`)
      return
    }

    setNames([...names, trimmed])
    setInputValue('')
    setInputError('')
  }

  // Remove individual name
  const handleRemoveName = (indexToRemove) => {
    if (isSpinning) return
    const updated = names.filter((_, idx) => idx !== indexToRemove)
    setNames(updated)
    if (selectedWinner === names[indexToRemove]) {
      setSelectedWinner(null)
    }
  }

  // Shuffle names order
  const handleShuffleNames = () => {
    if (isSpinning || names.length < 2) return
    const shuffled = [...names]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setNames(shuffled)
  }

  // Clear all names
  const handleClearAll = () => {
    if (isSpinning) return
    setNames([])
    setSelectedWinner(null)
  }

  // Restore default names
  const handleResetDefaults = () => {
    if (isSpinning) return
    setNames(DEFAULT_NAMES)
    setSelectedWinner(null)
    setInputError('')
  }

  // Spin the Wheel Logic
  const handleSpinWheel = () => {
    if (isSpinning || names.length < 2) return

    setIsSpinning(true)
    setSelectedWinner(null)

    const N = names.length
    const arcDegrees = 360 / N

    // Randomly pick a winning segment index
    const winnerIndex = Math.floor(Math.random() * N)
    const winningName = names[winnerIndex]

    // Calculate exact target rotation:
    // Slices are drawn starting from 12 o'clock (-90 deg), clockwise.
    // Slice W occupies [W * arcDegrees, (W + 1) * arcDegrees] clockwise from top.
    // Its center is at (W + 0.5) * arcDegrees from top.
    // We add a subtle random jitter so it doesn't always land at the exact center of the slice.
    const sliceJitter = (Math.random() - 0.5) * 0.45 * arcDegrees
    const targetSliceAngleFromTop = (winnerIndex + 0.5) * arcDegrees + sliceJitter

    // When the wheel rotates clockwise by R degrees:
    // The angle on the wheel that lands at the top pointer (0 deg from top) satisfies:
    // (targetSliceAngleFromTop + R) = 0 (mod 360)
    // => R = (360 - (targetSliceAngleFromTop % 360)) % 360
    const targetNormalized = (360 - (targetSliceAngleFromTop % 360) + 360) % 360

    const currentNormalized = ((currentRotationRef.current % 360) + 360) % 360
    let forwardAngle = (targetNormalized - currentNormalized + 360) % 360

    if (forwardAngle < 90) {
      forwardAngle += 360
    }

    // 5 to 7 full revolutions for exciting drama
    const fullSpins = (5 + Math.floor(Math.random() * 3)) * 360
    const durationSec = 4.2

    const nextRotation = currentRotationRef.current + fullSpins + forwardAngle
    setSpinDuration(durationSec)
    setRotation(nextRotation)

    // Complete spin after duration
    setTimeout(() => {
      setIsSpinning(false)
      setSelectedWinner(winningName)
      triggerConfetti()

      // Handle "Remove winner from the wheel after each spin" toggle
      if (removeWinnerAfterSpin) {
        setTimeout(() => {
          setNames((prev) => prev.filter((name) => name !== winningName))
        }, 800)
      }
    }, durationSec * 1000)
  }

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="brand-badge">
          <span className="pulse-dot"></span>
          Lab Exercise • Turn Picker
        </div>
        <h1 className="app-title">
          Random <span className="highlight">Icebreaker</span>
        </h1>
        <p className="app-subtitle">
          Add names, spin the wheel, and pick who speaks, presents, or starts the activity first!
        </p>
      </header>

      {/* Main Grid */}
      <main className="app-grid">
        {/* Left Panel: Name Management & Settings */}
        <div className="card controls-card">
          <div className="panel-header">
            <h2 className="panel-title">Participants</h2>
            <span className="count-badge">
              {names.length} {names.length === 1 ? 'name' : 'names'}
            </span>
          </div>

          {/* Add Name Form */}
          <form className="input-form" onSubmit={handleAddName}>
            <div className="input-field-wrapper">
              <input
                type="text"
                className="name-input"
                placeholder="Enter a participant's name..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  if (inputError) setInputError('')
                }}
                disabled={isSpinning}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn-add"
              disabled={isSpinning || !inputValue.trim()}
              title="Add name"
            >
              <span className="plus-symbol">+</span> Add
            </button>
          </form>

          {inputError && <div className="spin-warning-msg">{inputError}</div>}

          {/* Chips Section */}
          <div className="chips-section">
            <div className="section-label">Active Names on Wheel</div>
            <div className="chips-container">
              {names.length > 0 ? (
                names.map((name, index) => {
                  const avatarColor = SEGMENT_COLORS[index % SEGMENT_COLORS.length]
                  return (
                    <div key={`${name}-${index}`} className="name-chip">
                      <span
                        className="chip-avatar"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {name.charAt(0).toUpperCase()}
                      </span>
                      <span>{name}</span>
                      <button
                        type="button"
                        className="chip-remove-btn"
                        onClick={() => handleRemoveName(index)}
                        disabled={isSpinning}
                        title={`Remove ${name}`}
                      >
                        ×
                      </button>
                    </div>
                  )
                })
              ) : (
                <div className="empty-chips-msg">
                  No names on the wheel yet. Add some above!
                </div>
              )}
            </div>
          </div>

          {/* Actions: Shuffle & Clear */}
          <div className="action-buttons-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleShuffleNames}
              disabled={isSpinning || names.length < 2}
            >
              🔀 Shuffle Order
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClearAll}
              disabled={isSpinning || names.length === 0}
            >
              🗑️ Clear All
            </button>
          </div>

          {/* Toggle: Remove winner after spin */}
          <label className="toggle-wrapper">
            <div className="toggle-text">
              <span className="toggle-label-title">
                Remove winner from the wheel after each spin
              </span>
              <span className="toggle-label-desc">
                Automatically discards picked participants for fair rounds
              </span>
            </div>
            <div className="switch">
              <input
                type="checkbox"
                checked={removeWinnerAfterSpin}
                onChange={(e) => setRemoveWinnerAfterSpin(e.target.checked)}
                disabled={isSpinning}
              />
              <span className="slider"></span>
            </div>
          </label>

          {/* Restore Defaults button */}
          <button
            type="button"
            className="restore-defaults-btn"
            onClick={handleResetDefaults}
            disabled={isSpinning}
          >
            ↻ Reset to Default Names (Ava, Noah, Priya, Mateo, Zoe, Leon)
          </button>
        </div>

        {/* Right Panel: Spinning Wheel & Results */}
        <div className="card wheel-card">
          {/* Confetti Canvas Overlay */}
          <canvas ref={confettiCanvasRef} className="confetti-canvas" />

          {/* Winner Banner or Prompt */}
          <div className="winner-banner-wrapper">
            {selectedWinner ? (
              <div className="winner-banner">
                <div className="winner-content">
                  <span className="winner-icon">🎉</span>
                  <div>
                    <div className="winner-text-prefix">Winner Selected</div>
                    <div className="winner-name-highlight">
                      Up first: {selectedWinner}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="spin-again-inline-btn"
                  onClick={handleSpinWheel}
                  disabled={isSpinning || names.length < 2}
                >
                  Spin Again ↻
                </button>
              </div>
            ) : isSpinning ? (
              <div className="prompt-banner">
                🌀 Spinning the wheel... Who will be up first?
              </div>
            ) : (
              <div className="prompt-banner">
                {names.length < 2
                  ? '⚠️ Add at least 2 names to enable the wheel'
                  : 'Ready to spin! Click the button below'}
              </div>
            )}
          </div>

          {/* Wheel Stage (Pointer + Rotor Canvas) */}
          <div className="wheel-stage">
            {/* Top Pointer pointing straight down at 12 o'clock */}
            <div className={`wheel-pointer ${isSpinning ? 'ticking' : ''}`}>
              <div className="pointer-arrow"></div>
            </div>

            {/* Rotating Wheel Rotor */}
            <div
              className="wheel-rotor"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? `transform ${spinDuration}s cubic-bezier(0.12, 0.84, 0.28, 1)`
                  : 'none',
              }}
            >
              <canvas ref={canvasRef} className="wheel-canvas" />
            </div>

            {/* Center Decorative Hub */}
            <div className="wheel-center-hub">
              <span className="center-hub-star">★</span>
            </div>
          </div>

          {/* Main Spin Button Action */}
          <div className="spin-action-section">
            <button
              type="button"
              className="btn-spin-wheel"
              onClick={handleSpinWheel}
              disabled={isSpinning || names.length < 2}
            >
              {isSpinning ? 'Spinning...' : '🎯 Spin the Wheel'}
            </button>
            {names.length < 2 && (
              <span className="spin-warning-msg">
                * Please add at least 2 names to spin the wheel
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Random Icebreaker Lab Project &bull; Built with React &amp; Vite</p>
      </footer>
    </div>
  )
}
