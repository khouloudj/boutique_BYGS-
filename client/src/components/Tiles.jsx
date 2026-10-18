import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// Mets tes photos dans client/public/tiles/ : bijoux.jpg, sacs.jpg, laine.jpg, mariage.jpg
const T = [
  ["bijoux-accessoires", " Accessoires", "tiles/bijoux.png", "linear-gradient(160deg,#101a33,#3b4a6b)"],
  ["sacs", "Les Sacs", "tiles/sacs.jpg", "linear-gradient(160deg,#2a2018,#a98e72)"],
  ["laine", "Article en laine", "tiles/laine.jpg", "linear-gradient(160deg,#2d2a26,#9b8f7e)"],
  
];

export default function Tiles() {
  const bgs = useRef([]);

  // Parallaxe : l'image bouge un peu différemment du scroll
  useEffect(() => {
    let raf = null;
    const run = () => {
      raf = null;
      bgs.current.forEach((el) => {
        if (!el) return;
        const r = el.parentElement.getBoundingClientRect();
        const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        el.style.setProperty("--py", `${Math.max(-1, Math.min(1, p)) * -40}px`);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(run); };
    run();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  return (
    <div className="ftiles fullbleed">
      {T.map(([cat, label, img, bg], i) => (
        <Link key={cat} to={`/?category=${cat}`} className="ftile rv" style={{ "--d": `${i * 0.14}s` }}>
          <div className="ftile-bg" ref={(el) => (bgs.current[i] = el)} style={{ background: `url(/${img}) center/cover, ${bg}` }} />
          <span>{label}</span>
        </Link>
      ))}
    </div>
  );
}
