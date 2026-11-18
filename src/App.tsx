import { useState } from 'react'
import SneakerSequence from './components/SneakerSequence'
import { sfx } from './utils/soundEngine'

function SwooshMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 38"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3 24.8c9.3 8 23.1 9 38.9 3.3L97 7.6 46.8 31.7C31 38.9 15.6 37.6 5.8 29.7 4.2 28.4 2.9 26.6 3 24.8Z"
        fill="currentColor"
      />
    </svg>
  )
}

const TIMELINE_ACTS = [
  {
    sec: '0.0s – 2.0s',
    frames: 'Frames 001 – 060',
    title: 'Locked Silhouette',
    desc: 'Fully assembled sneaker floats in 3/4 lateral perspective. Toe angled toward camera to showcase Swoosh, laces, and sole profile in locked harmony.'
  },
  {
    sec: '2.0s – 6.0s',
    frames: 'Frames 061 – 180',
    title: 'Vertical Deconstruction',
    desc: 'Lace set lifts in tensioned array; engineered mesh upper rises with Swoosh intact; sculpted midsole and rubber tread separate below in staggered easing.'
  },
  {
    sec: '6.0s – 8.0s',
    frames: 'Frames 181 – 240',
    title: 'Exploded Anatomy Hold',
    desc: 'Stationary hold with zero camera shake. Components remain separated by crisp vertical gaps, revealing insole contours, internal chambers, and waffle lugs.'
  },
  {
    sec: '8.0s – 10.0s',
    frames: 'Frames 241 – 300',
    title: 'Precision Convergence',
    desc: 'Symmetrical retracing along the identical coordinate axes. Seamless mechanical lock completed by 9.5s, holding identical opening scale and lighting.'
  }
]

const LAYERS = [
  {
    num: '01',
    name: 'Suspended Lace Tension Array',
    material: 'High-tensile braided flat cotton',
    copy: 'Pre-tensioned geometry holds full laced contour in suspended microgravity, demonstrating structural lace-to-collar containment.',
    framePreview: '/frames/ezgif-frame-120.jpg'
  },
  {
    num: '02',
    name: 'Engineered Upper with Contrast Swoosh',
    material: 'Open-weave ballistic mesh & reinforced suede mudguard',
    copy: 'Single-piece rising chassis. Breathable forefoot weave dissipates heat while the iconic lateral Swoosh provides midfoot shear stabilization.',
    framePreview: '/frames/ezgif-frame-180.jpg'
  },
  {
    num: '03',
    name: 'Anatomical Contour Footbed',
    material: 'Dual-density OrthoLite open-cell foam',
    copy: 'Ergonomic insole engineered for instant step-in comfort, moisture evacuation, and targeted plantar arch support.',
    framePreview: '/frames/ezgif-frame-180.jpg'
  },
  {
    num: '04',
    name: 'Sculpted EVA Cushioning Midsole',
    material: 'Compression-molded Phylon with internal dampening',
    copy: 'Sculpted perimeter geometry cradles the foot through lateral transitions, absorbing landing impact without excess bulk.',
    framePreview: '/frames/ezgif-frame-160.jpg'
  },
  {
    num: '05',
    name: 'High-Abrasion Rubber Outsole',
    material: 'Solid carbon rubber compound with BRS-1000 lugs',
    copy: 'Classic waffle pattern engineered with directional perimeter treads and forefoot flex grooves for multi-surface traction.',
    framePreview: '/frames/ezgif-frame-140.jpg'
  },
]

const STATS = [
  { value: '10.0s', label: 'Continuous 3D Motion' },
  { value: '300', label: 'Sequential 16:9 Frames' },
  { value: '30 FPS', label: 'Locked Frame Rate' },
  { value: '05', label: 'Separated Architectural Layers' },
]

const SIZES = ['US 7.0', 'US 7.5', 'US 8.0', 'US 8.5', 'US 9.0', 'US 9.5', 'US 10.0', 'US 10.5', 'US 11.0', 'US 12.0']

const MARQUEE_ITEMS = ['Deconstruct', 'Anatomy', 'Precision', 'Air Motion', '300 Frames', 'Engineered by Nike']

export default function App() {
  const [selectedSize, setSelectedSize] = useState('US 9.5')
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const handleOrder = () => {
    sfx.playAssemblyLock()
    setOrderSuccess(true)
    setTimeout(() => {
      setOrderSuccess(false)
      setOrderModalOpen(false)
    }, 2800)
  }

  return (
    <div className="page">
      {/* Top Fixed Navigation */}
      <header className="nav">
        <a className="nav__brand" href="#top" aria-label="Nike Anatomy home">
          <SwooshMark />
          <span>Nike Anatomy</span>
        </a>
        <nav className="nav__links" aria-label="Primary Navigation">
          <a href="#anatomy">3D Motion</a>
          <a href="#timeline">Timeline Acts</a>
          <a href="#layers">Components</a>
          <a href="#specs">Engineering</a>
        </nav>
        <div className="nav__actions">
          <button
            className="nav__order-btn"
            onClick={() => {
              setOrderModalOpen(true)
              sfx.playTick(1600, 0.03)
            }}
          >
            Reserve Pair · $160
          </button>
          <a className="nav__cta" href="#anatomy">
            Explore 3D <span aria-hidden="true">↘</span>
          </a>
        </div>
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__glow" aria-hidden="true" />
          <div className="hero__frame" aria-hidden="true">
            <SwooshMark className="hero__swoosh" />
          </div>

          <p className="eyebrow">Studio 3D Sequence · 300 Sequential Frames</p>
          <h1 className="hero__title" id="hero-title">
            Anatomy
            <br />
            of a <em>Sneaker</em>
          </h1>

          <div className="hero__bottom">
            <p className="hero__lede">
              A 10-second continuous 3D exploded view captured at 30 frames per second.
              Scroll to disassemble the upper, floating laces, sculpted midsole, and rubber outsole
              along a unified coordinate trajectory.
            </p>
            <div className="hero__cta-group">
              <a className="hero__cue" href="#anatomy">
                <span>Scroll to Dissect</span>
                <span className="hero__cue-line" aria-hidden="true" />
              </a>
            </div>
          </div>

          <span className="hero__aside" aria-hidden="true">
            10 SECONDS · 300 FRAMES · 30 FPS
          </span>
        </section>

        {/* Master 300-Frame Scroll & Autoplay Sequence Stage */}
        <SneakerSequence />

        {/* Timeline Breakdown Section (Directly reflecting the prompt) */}
        <section className="timeline-section" id="timeline" aria-labelledby="timeline-title">
          <div className="section-head">
            <p className="eyebrow">Timeline Architecture</p>
            <h2 id="timeline-title">
              Precision Motion in
              <br />
              Four Choreographed Acts.
            </h2>
            <p className="section-lede">
              Engineered with smooth easing, locked camera coordinates, soft key lighting, and zero motion blur.
              Every frame remains pin-sharp when paused and reads seamlessly in both directions.
            </p>
          </div>

          <div className="timeline-grid">
            {TIMELINE_ACTS.map((act, idx) => (
              <div className="timeline-card" key={act.title}>
                <div className="timeline-card__top">
                  <span className="timeline-card__step">Act 0{idx + 1}</span>
                  <span className="timeline-card__sec">{act.sec}</span>
                </div>
                <h3 className="timeline-card__title">{act.title}</h3>
                <span className="timeline-card__frames">{act.frames}</span>
                <p className="timeline-card__desc">{act.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Deconstructed Layers Breakdown */}
        <section className="specs" id="layers" aria-labelledby="layers-title">
          <div className="specs__head">
            <p className="eyebrow">Architectural Breakdown</p>
            <h2 id="layers-title">
              Five Layers.
              <br />
              Zero Redundancy.
            </h2>
            <p className="specs__lede">
              Each component serves a calculated mechanical objective. Hover or review the separated
              layers to inspect materials, compound ratios, and structural tolerances.
            </p>
          </div>

          <div className="specs__grid">
            <figure className="specs__figure">
              <img
                src="/frames/ezgif-frame-180.jpg"
                alt="Exploded 3D view of the Nike Sneaker showing separated upper, insole, midsole and outsole"
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <span>Plate 01</span> Full exploded separation at Frame 180 (06.00s hold)
              </figcaption>
            </figure>

            <div className="specs__list">
              {LAYERS.map((layer) => (
                <div className="layer" key={layer.num}>
                  <span className="layer__num">{layer.num}</span>
                  <div>
                    <h3 className="layer__name">{layer.name}</h3>
                    <p className="layer__material">
                      <strong>Material:</strong> {layer.material}
                    </p>
                    <p className="layer__copy">{layer.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="specs__stats" id="specs">
            {STATS.map((stat) => (
              <div className="stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Marquee Banner */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee__track">
            {[0, 1].map((group) => (
              <div className="marquee__group" key={group}>
                {MARQUEE_ITEMS.map((item) => (
                  <span key={`${group}-${item}`}>
                    {item}
                    <i>·</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Technical Engineering Specifications */}
        <section className="tech-section" aria-labelledby="tech-title">
          <div className="tech-container">
            <div className="tech-header">
              <p className="eyebrow">Studio Technical Benchmark</p>
              <h2 id="tech-title">Motion Engine Specifications</h2>
            </div>

            <div className="tech-table">
              <div className="tech-row">
                <span className="tech-col-label">Aspect Ratio & Viewport</span>
                <span className="tech-col-val">16:9 Landscape (1280 × 720 Native Canvas)</span>
              </div>
              <div className="tech-row">
                <span className="tech-col-label">Frame Budget & Rate</span>
                <span className="tech-col-val">300 Sequential PNG/JPG Frames @ 30.0 FPS (10.00s)</span>
              </div>
              <div className="tech-row">
                <span className="tech-col-label">Camera & Lighting Angle</span>
                <span className="tech-col-val">Locked Three-Quarter Lateral (Toe Angled ~18° Camera-Facing)</span>
              </div>
              <div className="tech-row">
                <span className="tech-col-label">Lighting Environment</span>
                <span className="tech-col-val">Soft White Key Light + Restrained Cool Rim Light on Matte Charcoal</span>
              </div>
              <div className="tech-row">
                <span className="tech-col-label">Interactive Engine</span>
                <span className="tech-col-val">Bidirectional Lerp Damping + High-DPI Retina Canvas + Web Audio API</span>
              </div>
              <div className="tech-row">
                <span className="tech-col-label">Export Compatibility</span>
                <span className="tech-col-val">Direct Frame Snapshot (.JPG/.PNG) + 30 FPS Stream Recording (.WEBM/.MP4)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Outro Call To Action */}
        <section className="outro" id="outro" aria-labelledby="outro-title">
          <p className="eyebrow">Engineering Summary</p>
          <h2 id="outro-title">
            Deconstruct.
            <br />
            Understand. Master.
          </h2>
          <p>
            From the initial locked stance to the staggered exploded array and back, experience
            every architectural nuance of modern athletic footwear design.
          </p>
          <div className="outro__actions">
            <a className="btn" href="#anatomy">
              Dissect in 3D
            </a>
            <button
              className="btn btn--ghost"
              onClick={() => {
                setOrderModalOpen(true)
                sfx.playTick(1600, 0.03)
              }}
            >
              Reserve Model · $160
            </button>
          </div>
        </section>
      </main>

      {/* Interactive Reservation Drawer / Modal */}
      {orderModalOpen && (
        <div className="modal-backdrop" onClick={() => setOrderModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">Collector Archive Release</p>
                <h3 className="modal-title">Nike Air Retro — Studio Edition</h3>
              </div>
              <button
                className="modal-close"
                onClick={() => setOrderModalOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-thumb">
                <img src="/frames/ezgif-frame-001.jpg" alt="Nike Sneaker Assembled" />
                <span className="modal-badge">Limited Batch · 300 Pairs</span>
              </div>

              <div className="modal-details">
                <p className="modal-price">$160.00 USD <span>Complimentary Global Express</span></p>
                <p className="modal-desc">
                  Low-top silhouette featuring open-weave ballistic mesh, contrast embroidered Swoosh,
                  and dual-density sculpted EVA cushioning wedge.
                </p>

                <div className="size-selector-wrap">
                  <label className="size-label">Select Size (US Men / Unisex)</label>
                  <div className="size-grid">
                    {SIZES.map((sz) => (
                      <button
                        key={sz}
                        className={`size-btn${selectedSize === sz ? ' is-active' : ''}`}
                        onClick={() => {
                          setSelectedSize(sz)
                          sfx.playTick(1800, 0.02)
                        }}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className={`modal-confirm-btn${orderSuccess ? ' is-success' : ''}`}
                  onClick={handleOrder}
                  disabled={orderSuccess}
                >
                  {orderSuccess ? '✓ Reservation Confirmed!' : `Reserve ${selectedSize} — $160.00`}
                </button>
                <p className="modal-subtext">Zero risk reservation. Pairs dispatch with numbered certificate.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer__brand">
          <SwooshMark />
          <span>Nike Sneaker Motion Study</span>
        </div>
        <p className="footer__note">
          Created for high-performance scroll-driven and frame-accurate interactive 3D product demonstration.
          10-second 30 FPS 300-frame sequence with locked perspective, soft key illumination, and bidirectional easing.
        </p>
        <p className="footer__meta">© 2026 Nike Anatomy · Sequence Studio</p>
      </footer>
    </div>
  )
}
