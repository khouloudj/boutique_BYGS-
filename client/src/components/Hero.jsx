import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const Hero3D = lazy(() => import("./Hero3D"));

// Vidéos : client/public/hero/1.mp4, 2.mp4, 3.mp4
// L'image (img) reste affichée tant que la vidéo ne joue pas vraiment
const SLIDES = [
  { video: "/hero/1.mp4", img: "/hero/1.png", bg: "linear-gradient(120deg,#14110d,#4a381d)", eyebrow: "Nouvelle collection", title: "Accessoires", cta: "Voir la collection", cat: "bijoux-accessoires", three: false },
  { video: "/hero/2.mp4", img: "/hero/2.jpg", bg: "linear-gradient(120deg,#e3c3a8,#aebfd9)", eyebrow: "Maroquinerie", title: "Sacs ", cta: "Voir les sacs", cat: "sacs", three: false },
  { video: "/hero/3.mp4", img: "/hero/3.png", bg: "linear-gradient(120deg,#25221d,#7a6644)", eyebrow: "Douceur et élégance au quotidien", title: "Article en laine", cta: "Découvrir", cat: "laine", three: false },
];

const fill = { position: "absolute", inset: 0, width: "100%", height: "100%" };

export default function Hero() {
  const [i, setI] = useState(0);
  const [portrait, setPortrait] = useState({}); // vidéo verticale ?
  const [failed, setFailed] = useState({}); // vidéo en erreur ?
  const [playing, setPlaying] = useState({}); // vidéo en lecture ?
  const vids = useRef([]);
  const blurs = useRef([]);
  const go = (n) => setI((n + SLIDES.length) % SLIDES.length);

  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 8000); return () => clearInterval(t); }, []);

  // seule la vidéo visible est lue
  useEffect(() => {
    SLIDES.forEach((_, k) => [vids.current[k], blurs.current[k]].forEach((v) => {
      if (!v) return;
      if (k === i) v.play().catch(() => {}); else v.pause();
    }));
  }, [i, portrait]);

  return (
    <section className="hero-car fullbleed">
      {SLIDES.map((s, k) => {
        const p = portrait[k];
        const f = failed[k];
        const showImg = f || !playing[k];
        return (
          <div
            key={k}
            className={`slide ${k === i ? "on" : ""}`}
            style={{ background: showImg ? `url(${s.img}) center/cover, ${s.bg}` : s.bg }}
          >
            {/* vidéo verticale : fond flou + vidéo entière au centre */}
            {p && !f && (
              <video ref={(el) => (blurs.current[k] = el)} src={s.video} muted loop playsInline aria-hidden
                style={{ ...fill, objectFit: "cover", filter: "blur(36px) brightness(.65)", transform: "scale(1.25)" }} />
            )}
            <video
              ref={(el) => (vids.current[k] = el)}
              src={s.video}
              muted loop playsInline preload="auto"
              onLoadedMetadata={(e) => { const v = e.currentTarget; setPortrait((o) => ({ ...o, [k]: v.videoHeight > v.videoWidth })); }}
              onPlaying={() => setPlaying((o) => ({ ...o, [k]: true }))}
              onError={() => setFailed((o) => ({ ...o, [k]: true }))}
              style={{ ...fill, objectFit: p ? "contain" : "cover", display: f ? "none" : "block", opacity: playing[k] ? 1 : 0 }}
            />
            {s.three && k === i && <div className="three"><Suspense fallback={null}><Hero3D /></Suspense></div>}
            <div className="slide-txt" style={p ? { right: "4%", maxWidth: "min(380px,30vw)" } : undefined}>
              <span className="eyebrow" style={{ color: "#fff" }}>{s.eyebrow}</span>
              <h2>{s.title}</h2>
              <Link to={`/?category=${s.cat}`} className="btn shop">{s.cta}</Link>
            </div>
          </div>
        );
      })}
      <div className="arrows">
        <button onClick={() => go(i - 1)} aria-label="Précédent">‹</button>
        <button onClick={() => go(i + 1)} aria-label="Suivant">›</button>
      </div>
      <div className="dots">{SLIDES.map((_, k) => <i key={k} className={k === i ? "on" : ""} onClick={() => go(k)} />)}</div>
    </section>
  );
}