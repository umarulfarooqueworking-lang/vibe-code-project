import SneakerSequence from './components/SneakerSequence'

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

const LAYERS = [
  {
    num: '01',
    name: 'Mesh upper',
    copy: 'An open-weave mesh keeps the fit light, lets heat escape and gives the overlays something to hold.',
  },
  {
    num: '02',
    name: 'Suede overlays',
    copy: 'A hazy suede mudguard and eyestay add structure exactly where the foot flexes and rolls.',
  },
  {
    num: '03',
    name: 'Visible Air',
    copy: 'The signature window exposes a pressurised Air unit in the heel — cushioning you can see.',
  },
  {
    num: '04',
    name: 'Waffle outsole',
    copy: 'A rubber waffle pattern grips the road, sheds weight and feeds every landing back into the ride.',
  },
]

const STATS = [
  { value: '1987', label: 'Debut year' },
  { value: '04', label: 'Core systems' },
  { value: '300', label: 'Sequence frames' },
  { value: '01', label: 'Visible unit' },
]

const MARQUEE_ITEMS = ['Move', 'Feel', 'Repeat', 'Air', '1987']

export default function App() {
  return (
    <div className="page">
      <header className="nav">
        <a className="nav__brand" href="#top" aria-label="Nike Anatomy home">
          <SwooshMark />
          <span>Nike</span>
        </a>
        <nav className="nav__links" aria-label="Primary">
          <a href="#anatomy">Anatomy</a>
          <a href="#details">Layers</a>
          <a href="#outro">Archive</a>
        </nav>
        <a className="nav__cta" href="#anatomy">
          Dissect <span aria-hidden="true">↘</span>
        </a>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__glow" aria-hidden="true" />
          <div className="hero__frame" aria-hidden="true">
            <SwooshMark className="hero__swoosh" />
          </div>

          <p className="eyebrow">Air Max 1 · Archive study no. 01</p>
          <h1 className="hero__title" id="hero-title">
            Anatomy
            <br />
            of a <em>Sneaker</em>
          </h1>

          <div className="hero__bottom">
            <p className="hero__lede">
              Thirty-nine years of engineering in one silhouette. Scroll to take it apart —
              one stitch, one layer, one visible unit at a time.
            </p>
            <a className="hero__cue" href="#anatomy">
              <span>Scroll to dissect</span>
              <span className="hero__cue-line" aria-hidden="true" />
            </a>
          </div>

          <span className="hero__aside" aria-hidden="true">
            AIR / 1987 — 2026
          </span>
        </section>

        <SneakerSequence />

        <section className="specs" id="details" aria-labelledby="specs-title">
          <div className="specs__head">
            <p className="eyebrow">02 — Exploded view</p>
            <h2 id="specs-title">
              Built layer
              <br />
              by layer.
            </h2>
            <p className="specs__lede">
              Four systems, one stance. From a pressurised heel to waffle-tuned rubber, nothing
              on the Air Max 1 is decorative.
            </p>
          </div>

          <div className="specs__grid">
            <figure className="specs__figure">
              <img
                src="/frames/ezgif-frame-150.jpg"
                alt="The Air Max 1 split into mesh upper, suede overlays, midsole and waffle outsole"
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <span>Fig. 01</span> Full separation — frame 150
              </figcaption>
            </figure>

            <div className="specs__list">
              {LAYERS.map((layer) => (
                <div className="layer" key={layer.num}>
                  <span className="layer__num">{layer.num}</span>
                  <div>
                    <h3 className="layer__name">{layer.name}</h3>
                    <p className="layer__copy">{layer.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="specs__stats">
            {STATS.map((stat) => (
              <div className="stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

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

        <section className="outro" id="outro" aria-labelledby="outro-title">
          <p className="eyebrow">03 — The takeaway</p>
          <h2 id="outro-title">
            Every part
            <br />
            earns its place.
          </h2>
          <p>
            The best design disappears into the ride. The Air Max 1 makes sure you can still see
            it working — and now you know every piece inside the silhouette.
          </p>
          <div className="outro__actions">
            <a className="btn" href="#anatomy">
              Replay the sequence
            </a>
            <a className="btn btn--ghost" href="#details">
              Read the layers
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__brand">
          <SwooshMark />
          <span>Nike — Anatomy</span>
        </div>
        <p className="footer__note">
          Concept study. Air Max 1 imagery supplied as a 300-frame scroll sequence and kept
          intact.
        </p>
        <p className="footer__meta">© 2026 · Archive no. 01</p>
      </footer>
    </div>
  )
}
