import { useEffect, useRef, useState, useCallback } from 'react'
import { sfx } from '../utils/soundEngine'
import { downloadFrameSnapshot, export30FpsVideo } from '../utils/videoExporter'

const FRAME_COUNT = 300
const FPS = 30
const DURATION_SEC = 10
const LOAD_CONCURRENCY = 10

function frameSrc(index: number) {
  return `/frames/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export type Chapter = {
  start: number
  frame: number
  time: string
  label: string
  short: string
  title: string
  body: string
}

export const CHAPTERS: Chapter[] = [
  {
    start: 0,
    frame: 1,
    time: '00:00.00',
    label: '01 — Assembled Stance',
    short: 'Assembled',
    title: 'The Iconic Silhouette',
    body: 'The sneaker floats fully assembled at a three-quarter lateral stance. Soft white key lighting reveals the sculpted sole, mesh weave, and pristine lateral Nike Swoosh.',
  },
  {
    start: 0.20,
    frame: 61,
    time: '00:02.00',
    label: '02 — Vertical Deconstruction',
    short: 'Deconstruct',
    title: 'Staggered Component Separation',
    body: 'Vertical separation begins with smooth easing. The laced array lifts above the eyelets in rigid tension, while the mesh upper rises as one piece with its branding locked.',
  },
  {
    start: 0.60,
    frame: 181,
    time: '00:06.00',
    label: '03 — Exploded Anatomy Hold',
    short: 'Exploded View',
    title: 'Complete Layer Breakdown',
    body: 'Stationary hold reveals every architectural layer: hovering lace harness, breathable upper, contoured cushioning insole, molded midsole, and high-traction rubber outsole.',
  },
  {
    start: 0.80,
    frame: 241,
    time: '00:08.00',
    label: '04 — Precision Reassembly',
    short: 'Reassembly',
    title: 'Convergence to Locked Form',
    body: 'Each layer retraces its exact coordinate trajectory with symmetrical deceleration, locking back into the identical starting stance, scale, and lighting by 9.5s.',
  },
]

interface Hotspot {
  id: string
  name: string
  category: string
  x: number // percentage
  y: number // percentage
  frameMin: number
  frameMax: number
  specs: {
    material: string
    technology: string
    purpose: string
  }
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'laces',
    name: 'Suspended Lace System',
    category: 'Lockdown & Tension',
    x: 46,
    y: 20,
    frameMin: 80,
    frameMax: 245,
    specs: {
      material: 'Braided flat-weave cotton',
      technology: 'Pre-tensioned geometry',
      purpose: 'Preserves anatomical shape during vertical deconstruction'
    }
  },
  {
    id: 'upper',
    name: 'Mesh Upper & Swoosh',
    category: 'Structural Enclosure',
    x: 58,
    y: 44,
    frameMin: 70,
    frameMax: 255,
    specs: {
      material: 'Engineered mesh & synthetic leather',
      technology: 'Intact lateral Swoosh paneling',
      purpose: 'High-tensile breathability & lateral arch stability'
    }
  },
  {
    id: 'insole',
    name: 'Contoured Insole',
    category: 'Ergonomic Cushioning',
    x: 38,
    y: 60,
    frameMin: 90,
    frameMax: 240,
    specs: {
      material: 'High-density memory foam footbed',
      technology: 'Anatomical heel cup & arch bridge',
      purpose: 'Immediate step-in comfort and moisture mitigation'
    }
  },
  {
    id: 'midsole',
    name: 'Sculpted EVA Midsole',
    category: 'Kinetic Cushioning',
    x: 64,
    y: 74,
    frameMin: 80,
    frameMax: 250,
    specs: {
      material: 'Compression-molded Phylon / Polyurethane',
      technology: 'Sculpted perimeter beveling',
      purpose: 'Absorbs heel strike and delivers responsive energy return'
    }
  },
  {
    id: 'outsole',
    name: 'Rubber Tread Outsole',
    category: 'Surface Traction',
    x: 40,
    y: 84,
    frameMin: 90,
    frameMax: 245,
    specs: {
      material: 'High-abrasion solid carbon rubber',
      technology: 'Waffle-lug directional pattern',
      purpose: 'Multi-directional surface grip & forefoot flex articulation'
    }
  }
]

export default function SneakerSequence() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const stickyRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const backdropRef = useRef<HTMLImageElement | null>(null)
  const readoutRef = useRef<HTMLSpanElement | null>(null)
  const timecodeRef = useRef<HTMLSpanElement | null>(null)
  const railRef = useRef<HTMLSpanElement | null>(null)
  const framesRef = useRef<Array<HTMLImageElement | null>>([])
  const readyRef = useRef<boolean[]>([])
  
  // Progress & animation states
  const smoothProgressRef = useRef(0)
  const targetProgressRef = useRef(0)
  const drawnRef = useRef(-1)
  const posterDrawnRef = useRef(false)
  const lastDrawnFrameRef = useRef(0)

  // Autoplay loop state
  const isPlayingRef = useRef(false)
  const playDirectionRef = useRef<1 | -1>(1)
  const playSpeedRef = useRef(1)
  const lastTickTimeRef = useRef(performance.now())

  // React UI state
  const [loadPercent, setLoadPercent] = useState(0)
  const [allReady, setAllReady] = useState(false)
  const [activeChapter, setActiveChapter] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isMuted, setIsMuted] = useState(sfx.getMuted())
  const [showHotspots, setShowHotspots] = useState(true)
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null)
  const [cleanWatermark, setCleanWatermark] = useState(true)
  const [isExportingVideo, setIsExportingVideo] = useState(false)
  const [exportProgress, setExportProgress] = useState({ pct: 0, msg: '' })
  const [mode, setMode] = useState<'scroll' | 'autoplay'>('scroll')
  const [currentFrameNum, setCurrentFrameNum] = useState(1)

  // Preload all 300 frames with concurrency
  useEffect(() => {
    let cancelled = false
    let cursor = 0
    let activeLoads = 0
    let loadedCount = 0

    framesRef.current = Array<HTMLImageElement | null>(FRAME_COUNT).fill(null)
    readyRef.current = Array<boolean>(FRAME_COUNT).fill(false)

    function pump() {
      while (!cancelled && activeLoads < LOAD_CONCURRENCY && cursor < FRAME_COUNT) {
        loadFrame(cursor)
        cursor += 1
      }
    }

    function loadFrame(index: number) {
      const img = new Image()
      img.decoding = 'async'
      framesRef.current[index] = img
      activeLoads += 1

      function finish() {
        if (cancelled || readyRef.current[index]) return
        readyRef.current[index] = true
        activeLoads -= 1
        loadedCount += 1
        setLoadPercent(Math.round((loadedCount / FRAME_COUNT) * 100))
        if (loadedCount === FRAME_COUNT) {
          setAllReady(true)
        }
        pump()
      }

      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode().then(finish).catch(finish)
        } else {
          finish()
        }
      }
      img.onerror = finish
      img.src = frameSrc(index)
    }

    pump()

    return () => {
      cancelled = true
    }
  }, [])

  // Canvas frame drawing routine with optional watermark cleanup
  const drawFrame = useCallback((index: number): boolean => {
    const canvas = canvasRef.current
    const img = framesRef.current[index]
    if (!canvas || !img || !readyRef.current[index]) return false

    const rect = canvas.getBoundingClientRect()
    if (rect.width < 2 || rect.height < 2) return false

    const ctx = canvas.getContext('2d')
    if (!ctx) return false

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = Math.round(rect.width * dpr)
    const height = Math.round(rect.height * dpr)
    const resized = canvas.width !== width || canvas.height !== height

    if (resized) {
      canvas.width = width
      canvas.height = height
    }

    if (!resized && drawnRef.current === index) return true

    const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight)
    const drawWidth = img.naturalWidth * scale
    const drawHeight = img.naturalHeight * scale
    const drawX = (width - drawWidth) / 2
    const drawY = (height - drawHeight) / 2

    // Update backdrop blur
    if (backdropRef.current && backdropRef.current.dataset.frame !== String(index)) {
      backdropRef.current.dataset.frame = String(index)
      backdropRef.current.src = frameSrc(index)
    }

    ctx.clearRect(0, 0, width, height)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

    // Seamless inpainting of the bottom-right AI watermark star
    if (cleanWatermark) {
      try {
        const starX = drawX + drawWidth * 0.908
        const starY = drawY + drawHeight * 0.916
        const starRadius = Math.max(16 * scale, 14)

        // Sample neighboring clean matte background pixel
        const sampleX = Math.round(drawX + drawWidth * 0.86)
        const sampleY = Math.round(drawY + drawHeight * 0.916)
        const pixelData = ctx.getImageData(sampleX, sampleY, 1, 1).data
        const r = pixelData[0]
        const g = pixelData[1]
        const b = pixelData[2]

        ctx.save()
        const grad = ctx.createRadialGradient(starX, starY, 0, starX, starY, starRadius)
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`)
        grad.addColorStop(0.75, `rgba(${r}, ${g}, ${b}, 0.98)`)
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(starX, starY, starRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      } catch {
        // Fallback if cross-origin or boundary error
      }
    }

    // Soft border feathering to blend with the matte charcoal viewport
    const feather = Math.min(Math.min(drawWidth, drawHeight) * 0.12, 60 * dpr)
    if (feather > 1) {
      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'

      const paint = (gradient: CanvasGradient, x: number, y: number, w: number, h: number) => {
        ctx.fillStyle = gradient
        ctx.fillRect(x, y, w, h)
      }

      const left = ctx.createLinearGradient(drawX, 0, drawX + feather, 0)
      left.addColorStop(0, 'rgba(0, 0, 0, 1)')
      left.addColorStop(1, 'rgba(0, 0, 0, 0)')
      paint(left, drawX, drawY, feather, drawHeight)

      const right = ctx.createLinearGradient(drawX + drawWidth, 0, drawX + drawWidth - feather, 0)
      right.addColorStop(0, 'rgba(0, 0, 1)')
      right.addColorStop(1, 'rgba(0, 0, 0, 0)')
      paint(right, drawX + drawWidth - feather, drawY, feather, drawHeight)

      const top = ctx.createLinearGradient(0, drawY, 0, drawY + feather)
      top.addColorStop(0, 'rgba(0, 0, 0, 1)')
      top.addColorStop(1, 'rgba(0, 0, 0, 0)')
      paint(top, drawX, drawY, drawWidth, feather)

      const bottom = ctx.createLinearGradient(0, drawY + drawHeight, 0, drawY + drawHeight - feather)
      bottom.addColorStop(0, 'rgba(0, 0, 0, 1)')
      bottom.addColorStop(1, 'rgba(0, 0, 0, 0)')
      paint(bottom, drawX, drawY + drawHeight - feather, drawWidth, feather)

      ctx.restore()
    }

    drawnRef.current = index
    lastDrawnFrameRef.current = index
    if (!posterDrawnRef.current) {
      posterDrawnRef.current = true
    }
    return true
  }, [cleanWatermark])

  // Locate nearest ready frame if target is still loading
  const nearestReadyFrame = useCallback((desired: number): number => {
    if (readyRef.current[desired]) return desired
    for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
      const before = desired - offset
      if (before >= 0 && readyRef.current[before]) return before
      const after = desired + offset
      if (after < FRAME_COUNT && readyRef.current[after]) return after
    }
    return -1
  }, [])

  // Main render and animation ticker
  useEffect(() => {
    let rafId = 0
    let lastAudioFrame = -1

    function tick(time: number) {
      rafId = requestAnimationFrame(tick)
      const dt = clamp((time - lastTickTimeRef.current) / 1000, 0.001, 0.1)
      lastTickTimeRef.current = time

      // Handle Autoplay mode
      if (isPlayingRef.current) {
        const step = (dt * (FPS * playSpeedRef.current) / FRAME_COUNT) * playDirectionRef.current
        let next = smoothProgressRef.current + step

        if (next >= 1) {
          next = 0 // loop
          sfx.playAssemblyLock()
        } else if (next <= 0) {
          next = 1
        }
        targetProgressRef.current = next
        smoothProgressRef.current = next
      } else if (mode === 'scroll') {
        // Handle Scroll driven mode
        const section = sectionRef.current
        const sticky = stickyRef.current
        if (section && sticky) {
          const rect = section.getBoundingClientRect()
          const stickyHeight = sticky.getBoundingClientRect().height || window.innerHeight
          const travel = rect.height - stickyHeight
          if (travel > 0) {
            const scrollTarget = clamp(-rect.top / travel, 0, 1)
            targetProgressRef.current = scrollTarget
            const factor = 1 - Math.pow(0.82, dt * 60)
            smoothProgressRef.current += (scrollTarget - smoothProgressRef.current) * factor
            if (Math.abs(scrollTarget - smoothProgressRef.current) < 0.0002) {
              smoothProgressRef.current = scrollTarget
            }
          }
        }
      } else {
        // Scrubbing mode with gentle damping
        const factor = 1 - Math.pow(0.75, dt * 60)
        smoothProgressRef.current += (targetProgressRef.current - smoothProgressRef.current) * factor
        if (Math.abs(targetProgressRef.current - smoothProgressRef.current) < 0.0002) {
          smoothProgressRef.current = targetProgressRef.current
        }
      }

      const progress = smoothProgressRef.current
      const desired = clamp(Math.round(progress * (FRAME_COUNT - 1)), 0, FRAME_COUNT - 1)
      const available = nearestReadyFrame(desired)
      if (available >= 0) {
        drawFrame(available)
      }

      // Audio triggers on major phase milestones
      if (Math.abs(desired - lastAudioFrame) >= 2) {
        sfx.playScrubTick()
        lastAudioFrame = desired
      }

      // Readout & UI sync
      const frameNum = Math.max(drawnRef.current, 0) + 1
      setCurrentFrameNum(frameNum)

      if (readoutRef.current) {
        const shown = String(frameNum).padStart(3, '0')
        if (readoutRef.current.textContent !== shown) {
          readoutRef.current.textContent = shown
        }
      }

      if (timecodeRef.current) {
        const seconds = (progress * DURATION_SEC).toFixed(2)
        const formatted = `00:${seconds.padStart(5, '0')}`
        if (timecodeRef.current.textContent !== formatted) {
          timecodeRef.current.textContent = formatted
        }
      }

      if (railRef.current) {
        railRef.current.style.transform = `scaleX(${progress.toFixed(4)})`
      }

      // Determine active chapter
      let chapter = 0
      for (let i = 0; i < CHAPTERS.length; i += 1) {
        if (progress >= CHAPTERS[i].start) chapter = i
      }
      setActiveChapter((current) => (current === chapter ? current : chapter))
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [drawFrame, mode, nearestReadyFrame])

  // Jump to specific chapter
  const seekToChapter = useCallback((chapterIndex: number) => {
    const ch = CHAPTERS[chapterIndex]
    if (!ch) return

    targetProgressRef.current = ch.start
    smoothProgressRef.current = ch.start
    setIsPlaying(false)
    isPlayingRef.current = false

    // Scroll window if in scroll mode
    if (sectionRef.current && stickyRef.current) {
      const section = sectionRef.current
      const sticky = stickyRef.current
      const rect = section.getBoundingClientRect()
      const scrollY = window.scrollY || window.pageYOffset
      const travel = section.offsetHeight - sticky.offsetHeight
      const targetY = scrollY + rect.top + travel * ch.start
      window.scrollTo({ top: targetY, behavior: 'smooth' })
    }

    sfx.playTick(1600, 0.04)
  }, [])

  // Timeline slider scrubbing handler
  const handleScrubberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    const norm = val / (FRAME_COUNT - 1)
    targetProgressRef.current = norm
    smoothProgressRef.current = norm
    setMode('autoplay')
    setIsPlaying(false)
    isPlayingRef.current = false
  }, [])

  // Step frame forward / backward
  const stepFrame = useCallback((delta: number) => {
    setIsPlaying(false)
    isPlayingRef.current = false
    setMode('autoplay')
    const current = Math.round(smoothProgressRef.current * (FRAME_COUNT - 1))
    const next = clamp(current + delta, 0, FRAME_COUNT - 1)
    const norm = next / (FRAME_COUNT - 1)
    targetProgressRef.current = norm
    smoothProgressRef.current = norm
    sfx.playTick(delta > 0 ? 1800 : 1200, 0.03)
  }, [])

  // Toggle Autoplay
  const togglePlay = useCallback(() => {
    const nextState = !isPlayingRef.current
    setIsPlaying(nextState)
    isPlayingRef.current = nextState
    setMode('autoplay')
    if (nextState) {
      lastTickTimeRef.current = performance.now()
      sfx.playExplode()
    }
  }, [])

  // Toggle reverse playback
  const toggleReverse = useCallback(() => {
    playDirectionRef.current = playDirectionRef.current === 1 ? -1 : 1
    sfx.playTick(1400, 0.04)
  }, [])

  // Toggle Audio
  const toggleAudio = useCallback(() => {
    const muted = sfx.toggleMute()
    setIsMuted(muted)
  }, [])

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    const stage = stickyRef.current
    if (!stage) return
    if (!document.fullscreenElement) {
      stage.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  // Export current frame snapshot
  const handleSnapshot = useCallback(() => {
    if (canvasRef.current) {
      downloadFrameSnapshot(canvasRef.current, lastDrawnFrameRef.current, 'image/jpeg')
      sfx.playTick(2200, 0.05, 0.03)
    }
  }, [])

  // Export full 10-second 30 FPS video
  const handleExportVideo = useCallback(async () => {
    if (isExportingVideo) return
    setIsExportingVideo(true)
    setExportProgress({ pct: 0, msg: 'Initializing 30 FPS video capture...' })
    try {
      await export30FpsVideo(framesRef.current, cleanWatermark, (pct, msg) => {
        setExportProgress({ pct, msg })
      })
      sfx.playAssemblyLock()
    } catch (err) {
      console.error('Export failed:', err)
      alert('Video export failed. Ensure browser supports MediaRecorder.')
    } finally {
      setIsExportingVideo(false)
    }
  }, [cleanWatermark, isExportingVideo])

  // Keyboard shortcut listeners
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        stepFrame(e.shiftKey ? 10 : 1)
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        stepFrame(e.shiftKey ? -10 : -1)
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        toggleReverse()
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        toggleAudio()
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [stepFrame, toggleAudio, toggleFullscreen, togglePlay, toggleReverse])

  return (
    <section
      id="anatomy"
      className="sequence"
      ref={sectionRef}
      aria-label="Scroll-driven 3D exploded view of the Nike sneaker"
    >
      <div className="sequence__sticky" ref={stickyRef}>
        {/* Top Header Readout */}
        <div className="sequence__top">
          <div className="sequence__eyebrow-wrap">
            <p className="sequence__eyebrow">
              <span className={`sequence__status${allReady ? ' is-ready' : ''}`} aria-hidden="true" />
              Nike Product Motion · 10s Sequential 3D Exploded Anatomy
            </p>
          </div>

          <div className="sequence__telemetry">
            <span className="telemetry-item">
              <span className="telemetry-label">TIMECODE:</span>
              <span className="telemetry-val" ref={timecodeRef}>00:00.00</span>
              <span className="telemetry-total"> / 00:10.00</span>
            </span>

            <span className="telemetry-item">
              <span className="telemetry-label">FRAME:</span>
              <span className="telemetry-val" ref={readoutRef}>001</span>
              <span className="telemetry-total"> / {FRAME_COUNT}</span>
            </span>

            <span className="telemetry-item telemetry-mode">
              <span className="telemetry-label">MODE:</span>
              <span className="telemetry-pill">{mode.toUpperCase()}</span>
            </span>
          </div>
        </div>

        {/* Central 3D Canvas Stage */}
        <div className="sequence__stage">
          {/* Subtle Ambient Blurred Backdrop */}
          <img
            className="sequence__backdrop"
            ref={backdropRef}
            alt=""
            aria-hidden="true"
            draggable={false}
            decoding="async"
          />

          {/* Master 16:9 Canvas */}
          <canvas
            className="sequence__canvas"
            ref={canvasRef}
            role="img"
            aria-label="Nike sneaker disassembling into component layers as you scroll"
          />

          {/* Fallback initial poster */}
          <img
            className={`sequence__poster${posterDrawnRef.current ? ' is-hidden' : ''}`}
            src={frameSrc(0)}
            alt="Nike Sneaker Assembled"
            draggable={false}
            loading="eager"
            decoding="async"
          />

          {/* Matte Charcoal Vignette */}
          <div className="sequence__vignette" aria-hidden="true" />

          {/* Top-Left Live HUD */}
          <div className="sequence__hud" aria-hidden="true">
            <span className={`sequence__hud-dot${isPlaying ? ' is-pulsing' : ''}`} />
            <span>30 FPS 3D Engine · 16:9 Landscape</span>
          </div>

          {/* Top-Right Loading HUD */}
          {!allReady && (
            <div className="sequence__load" aria-hidden="true">
              <span className="sequence__load-dot" />
              <span>Caching Frames {loadPercent}%</span>
            </div>
          )}

          {/* Bottom-Right Tag */}
          <div className="sequence__tag" aria-hidden="true">
            Phase {activeChapter + 1} / 4 — {CHAPTERS[activeChapter]?.short}
          </div>

          {/* Interactive Hotspot Pins (active during exploded phase) */}
          {showHotspots &&
            HOTSPOTS.map((spot) => {
              const isVisible = currentFrameNum >= spot.frameMin && currentFrameNum <= spot.frameMax
              if (!isVisible) return null
              const isSelected = activeHotspot?.id === spot.id

              return (
                <div
                  key={spot.id}
                  className={`hotspot${isSelected ? ' is-selected' : ''}`}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                >
                  <button
                    className="hotspot__trigger"
                    onClick={() => setActiveHotspot(isSelected ? null : spot)}
                    aria-label={`Inspect ${spot.name}`}
                    title={spot.name}
                  >
                    <span className="hotspot__pulse" />
                    <span className="hotspot__core" />
                  </button>

                  <div className="hotspot__label">
                    <span className="hotspot__label-text">{spot.name}</span>
                  </div>

                  {isSelected && (
                    <div className="hotspot__card">
                      <div className="hotspot__card-header">
                        <span className="hotspot__card-cat">{spot.category}</span>
                        <button
                          className="hotspot__card-close"
                          onClick={() => setActiveHotspot(null)}
                          aria-label="Close details"
                        >
                          ✕
                        </button>
                      </div>
                      <h4 className="hotspot__card-title">{spot.name}</h4>
                      <dl className="hotspot__card-specs">
                        <div>
                          <dt>Material</dt>
                          <dd>{spot.specs.material}</dd>
                        </div>
                        <div>
                          <dt>Engineering</dt>
                          <dd>{spot.specs.technology}</dd>
                        </div>
                        <div>
                          <dt>Function</dt>
                          <dd>{spot.specs.purpose}</dd>
                        </div>
                      </dl>
                    </div>
                  )}
                </div>
              )
            })}
        </div>

        {/* Master Interactive Control Bar (Apple / Nike Studio Experience) */}
        <div className="sequence__controls-panel">
          {/* Phase Quick Jump Pills */}
          <div className="stage-pills" role="tablist" aria-label="Animation Phase Navigation">
            {CHAPTERS.map((ch, idx) => (
              <button
                key={ch.label}
                role="tab"
                aria-selected={activeChapter === idx}
                className={`stage-pill${activeChapter === idx ? ' is-active' : ''}`}
                onClick={() => seekToChapter(idx)}
              >
                <span className="stage-pill__idx">0{idx + 1}</span>
                <span className="stage-pill__name">{ch.short}</span>
                <span className="stage-pill__time">{ch.time}</span>
              </button>
            ))}
          </div>

          {/* Interactive Scrubbing Slider */}
          <div className="scrubber-bar">
            <span className="scrubber-time">00:00</span>
            <div className="scrubber-track-wrap">
              <input
                type="range"
                min="0"
                max={FRAME_COUNT - 1}
                value={currentFrameNum - 1}
                onChange={handleScrubberChange}
                className="scrubber-slider"
                aria-label="Timeline frame scrubber"
              />
              <div
                className="scrubber-fill"
                style={{ width: `${((currentFrameNum - 1) / (FRAME_COUNT - 1)) * 100}%` }}
              />
            </div>
            <span className="scrubber-time">00:10</span>
          </div>

          {/* Action Toolbar */}
          <div className="toolbar">
            {/* Playback Controls */}
            <div className="toolbar__group">
              <button
                className="tool-btn tool-btn--primary"
                onClick={togglePlay}
                title="Play/Pause (Space)"
                aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>

              <button
                className="tool-btn"
                onClick={() => stepFrame(-1)}
                title="Step -1 frame (Left Arrow)"
                aria-label="Step back one frame"
              >
                ⏮ -1
              </button>

              <button
                className="tool-btn"
                onClick={() => stepFrame(1)}
                title="Step +1 frame (Right Arrow)"
                aria-label="Step forward one frame"
              >
                +1 ⏭
              </button>

              <button
                className="tool-btn"
                onClick={toggleReverse}
                title="Reverse Direction (R)"
                aria-label="Toggle playback direction"
              >
                ⇄ Reverse
              </button>

              {/* Speed Selector */}
              <div className="speed-group" title="Playback speed">
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    className={`speed-btn${playbackSpeed === spd ? ' is-active' : ''}`}
                    onClick={() => {
                      setPlaybackSpeed(spd)
                      playSpeedRef.current = spd
                    }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* View & Audio Toggles */}
            <div className="toolbar__group">
              <button
                className={`tool-btn${!isMuted ? ' is-active' : ''}`}
                onClick={toggleAudio}
                title="Sound Effects (M)"
                aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
              >
                {isMuted ? '🔇 SFX Off' : '🔊 SFX On'}
              </button>

              <button
                className={`tool-btn${showHotspots ? ' is-active' : ''}`}
                onClick={() => setShowHotspots(!showHotspots)}
                title="Toggle Exploded Layer Annotations"
              >
                🏷️ Labels
              </button>

              <button
                className={`tool-btn${cleanWatermark ? ' is-active' : ''}`}
                onClick={() => setCleanWatermark(!cleanWatermark)}
                title="Auto-inpaint AI watermark star"
              >
                ✨ Clean Frame
              </button>
            </div>

            {/* Export & Utility Actions */}
            <div className="toolbar__group">
              <button
                className="tool-btn"
                onClick={handleSnapshot}
                title="Download current sharp frame (PNG/JPG)"
              >
                📸 Snapshot
              </button>

              <button
                className="tool-btn tool-btn--accent"
                onClick={handleExportVideo}
                disabled={isExportingVideo}
                title="Export complete 10s video at 30 FPS"
              >
                {isExportingVideo ? `🎥 ${exportProgress.pct}%` : '🎥 Export 30fps Video'}
              </button>

              <button
                className="tool-btn"
                onClick={toggleFullscreen}
                title="Fullscreen (F)"
                aria-label="Toggle fullscreen"
              >
                ⛶
              </button>
            </div>
          </div>
        </div>

        {/* Narrative Chapter Cards */}
        <div className="sequence__footer">
          <div className="chapter-stack">
            {CHAPTERS.map((chapter, index) => (
              <article
                key={chapter.label}
                className={`chapter${index === activeChapter ? ' is-active' : ''}`}
                aria-hidden={index !== activeChapter}
              >
                <div className="chapter__lead">
                  <span className="chapter__label">{chapter.label}</span>
                  <h2 className="chapter__title">{chapter.title}</h2>
                </div>
                <p className="chapter__body">{chapter.body}</p>
              </article>
            ))}
          </div>

          <ol className="chapter-index" aria-hidden="true">
            {CHAPTERS.map((chapter, index) => (
              <li
                key={chapter.short}
                className={index === activeChapter ? 'is-active' : ''}
                onClick={() => seekToChapter(index)}
              >
                <span>0{index + 1}</span>
                <span>{chapter.short}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Sticky Rail Progress indicator */}
        <div className="sequence__rail" aria-hidden="true">
          <span ref={railRef} className="sequence__rail-fill" />
        </div>
      </div>
    </section>
  )
}
