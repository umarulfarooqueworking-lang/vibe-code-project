import { useEffect, useRef, useState } from 'react'

const FRAME_COUNT = 300
const LOAD_CONCURRENCY = 8

function frameSrc(index: number) {
  return `/frames/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

type Chapter = {
  start: number
  label: string
  short: string
  title: string
  body: string
}

const CHAPTERS: Chapter[] = [
  {
    start: 0,
    label: '01 — Silhouette',
    short: 'Silhouette',
    title: 'A shape with a memory.',
    body: 'Born in 1987, the Air Max 1 turned a running shoe into a cultural landmark. Keep scrolling to take it apart.',
  },
  {
    start: 0.13,
    label: '02 — Laces & tongue',
    short: 'Laces',
    title: 'The hold.',
    body: 'Flat cotton laces, a padded tongue and a suede eyestay work as one system — tension, comfort and a little theatre.',
  },
  {
    start: 0.35,
    label: '03 — The upper',
    short: 'Upper',
    title: 'Panels with purpose.',
    body: 'Mesh breathes. Suede reinforces. Overlays lock the foot in place while the mudguard quietly takes the miles.',
  },
  {
    start: 0.58,
    label: '04 — Midsole & Air',
    short: 'Midsole',
    title: 'Visible, by design.',
    body: 'A polyurethane wedge wraps the first visible Air unit — cushioning you could finally see instead of only feel.',
  },
  {
    start: 0.82,
    label: '05 — Outsole',
    short: 'Outsole',
    title: 'Grip, then rebuild.',
    body: 'Waffle-tuned rubber, a heel crash pad and a forefoot flex groove. Every piece returns to one silhouette.',
  },
]

export default function SneakerSequence() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const stickyRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const backdropRef = useRef<HTMLImageElement | null>(null)
  const readoutRef = useRef<HTMLSpanElement | null>(null)
  const railRef = useRef<HTMLSpanElement | null>(null)
  const framesRef = useRef<Array<HTMLImageElement | null>>([])
  const readyRef = useRef<boolean[]>([])
  const smoothProgressRef = useRef(0)
  const drawnRef = useRef(-1)
  const posterDrawnRef = useRef(false)

  const [posterHidden, setPosterHidden] = useState(false)
  const [allReady, setAllReady] = useState(false)
  const [activeChapter, setActiveChapter] = useState(0)

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
        if (loadedCount === FRAME_COUNT) setAllReady(true)
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

  useEffect(() => {
    let rafId = 0
    let lastTime = performance.now()

    function drawFrame(index: number): boolean {
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

      if (backdropRef.current && backdropRef.current.dataset.frame !== String(index)) {
        backdropRef.current.dataset.frame = String(index)
        backdropRef.current.src = frameSrc(index)
      }

      ctx.clearRect(0, 0, width, height)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

      const feather = Math.min(Math.min(drawWidth, drawHeight) * 0.14, 80 * dpr)
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
        right.addColorStop(0, 'rgba(0, 0, 0, 1)')
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
      if (!posterDrawnRef.current) {
        posterDrawnRef.current = true
        setPosterHidden(true)
      }
      return true
    }

    function nearestReadyFrame(desired: number): number {
      if (readyRef.current[desired]) return desired
      for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
        const before = desired - offset
        if (before >= 0 && readyRef.current[before]) return before
        const after = desired + offset
        if (after < FRAME_COUNT && readyRef.current[after]) return after
      }
      return -1
    }

    function tick(time: number) {
      rafId = requestAnimationFrame(tick)
      const section = sectionRef.current
      const sticky = stickyRef.current
      if (!section || !sticky) return

      const rect = section.getBoundingClientRect()
      const stickyHeight = sticky.getBoundingClientRect().height || window.innerHeight
      const travel = rect.height - stickyHeight
      if (travel <= 0) return

      const target = clamp(-rect.top / travel, 0, 1)
      const dt = clamp((time - lastTime) / 16.667, 0.25, 3)
      lastTime = time

      const factor = 1 - Math.pow(0.82, dt)
      smoothProgressRef.current += (target - smoothProgressRef.current) * factor
      if (Math.abs(target - smoothProgressRef.current) < 0.0002) {
        smoothProgressRef.current = target
      }

      const progress = smoothProgressRef.current
      const desired = Math.round(progress * (FRAME_COUNT - 1))
      const available = nearestReadyFrame(desired)
      if (available >= 0) drawFrame(available)

      if (readoutRef.current) {
        const shown = String(Math.max(drawnRef.current, 0) + 1).padStart(3, '0')
        if (readoutRef.current.textContent !== shown) {
          readoutRef.current.textContent = shown
        }
      }

      if (railRef.current) {
        railRef.current.style.transform = `scaleX(${progress.toFixed(4)})`
      }

      let chapter = 0
      for (let i = 0; i < CHAPTERS.length; i += 1) {
        if (progress >= CHAPTERS[i].start) chapter = i
      }
      setActiveChapter((current) => (current === chapter ? current : chapter))
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <section
      id="anatomy"
      className="sequence"
      ref={sectionRef}
      aria-label="Scroll-driven exploded view of the Nike Air Max 1"
    >
      <div className="sequence__sticky" ref={stickyRef}>
        <div className="sequence__top">
          <p className="sequence__eyebrow">
            <span className={`sequence__status${allReady ? ' is-ready' : ''}`} aria-hidden="true" />
            Anatomy study — Air Max 1
          </p>
          <p className="sequence__counter">
            Frame <span ref={readoutRef}>001</span>
            <span className="sequence__counter-total"> / {FRAME_COUNT}</span>
          </p>
        </div>

        <div className="sequence__stage">
          <img
            className="sequence__backdrop"
            ref={backdropRef}
            alt=""
            aria-hidden="true"
            draggable={false}
            decoding="async"
          />
          <canvas
            className="sequence__canvas"
            ref={canvasRef}
            role="img"
            aria-label="The Nike Air Max 1 disassembling into its component layers as you scroll"
          />
          <img
            className={`sequence__poster${posterHidden ? ' is-hidden' : ''}`}
            src={frameSrc(0)}
            alt=""
            aria-hidden="true"
            draggable={false}
            loading="eager"
            decoding="async"
          />
          <div className="sequence__vignette" aria-hidden="true" />
          <div className="sequence__hud" aria-hidden="true">
            <span className="sequence__hud-dot" />
            Live sequence
          </div>
          <div className={`sequence__load${allReady ? ' is-hidden' : ''}`} aria-hidden="true">
            <span className="sequence__load-dot" />
            Preparing frames
          </div>
          <div className="sequence__tag" aria-hidden="true">
            Air Max 1 / Exploded view
          </div>
        </div>

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
              <li key={chapter.short} className={index === activeChapter ? 'is-active' : ''}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span>{chapter.short}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="sequence__rail" aria-hidden="true">
          <span ref={railRef} className="sequence__rail-fill" />
        </div>
      </div>
    </section>
  )
}
