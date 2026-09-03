import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);

const frames = [
  ['Ritual light', 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1800&q=85'],
  ['Quiet portrait', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85'],
  ['Family pulse', 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1800&q=85'],
  ['After ceremony', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1800&q=85']
];

function App() {
  const root = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('.hero-copy > *', { y: 32, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' });
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.from(el, { y: 48, opacity: 0, duration: 0.8, scrollTrigger: { trigger: el, start: 'top 84%' } });
      });
      const rail = document.querySelector('.rail-track');
      if (rail && window.innerWidth > 900) {
        const distance = () => Math.max(0, rail.scrollWidth - window.innerWidth + 96);
        gsap.to(rail, { x: () => -distance(), ease: 'none', scrollTrigger: { trigger: '.rail', start: 'top top', end: () => `+=${distance() + 700}`, scrub: 1, pin: true, invalidateOnRefresh: true } });
      }
    }, root);
    return () => ctx.revert();
  }, []);

  return <main ref={root}>
    <section className="hero">
      <img src={frames[0][1]} alt="Wedding ceremony in warm dawn light" />
      <div className="veil" />
      <div className="hero-copy">
        <p className="kicker">Indian Wedding Editorial · 028</p>
        <h1>Lacquer<br/>Dawn</h1>
        <p>A story of lacquer red, temple gold and first-light ivory—memory polished until it catches the morning.</p>
      </div>
      <span className="chapter">01 / BEFORE THE SUN</span>
    </section>

    <section className="manifest reveal">
      <p className="eyebrow">Field Note 02</p>
      <h2>The morning did not arrive quietly.</h2>
      <p>It moved through silk, brass, smoke and hands. The page follows that rhythm: intimate detail giving way to full photographic scale.</p>
    </section>

    <section className="diptych reveal">
      <figure><img src={frames[1][1]} alt="Intimate wedding portrait"/><figcaption>Portrait / stillness</figcaption></figure>
      <div className="copy"><span>03</span><h2>Red held against ivory.</h2><p>A portrait chapter framed like lacquered paper—dense colour, breathing room, one decisive image.</p></div>
    </section>

    <section className="rail">
      <div className="rail-intro"><span>04</span><h2>The procession becomes a film strip.</h2></div>
      <div className="rail-track">
        {frames.map(([label, src], i) => <figure key={src} className="rail-frame"><img src={src} alt={`${label} wedding photograph`}/><figcaption>0{i+1} · {label}</figcaption></figure>)}
      </div>
    </section>

    <section className="orb reveal">
      <div className="sun-disc"><span>05</span></div>
      <div><p className="eyebrow">Fire / witness / morning</p><h2>Every ritual leaves an afterimage.</h2><p>The palette turns from lacquer red into warm gold, then finally into pale dawn.</p></div>
    </section>

    <section className="mosaic reveal">
      <figure className="large"><img src={frames[2][1]} alt="Wedding family celebration"/></figure>
      <figure><img src={frames[3][1]} alt="Couple after wedding ceremony"/></figure>
      <blockquote>“The photographs should feel found, not placed.”</blockquote>
    </section>

    <footer className="finale reveal"><p>06 / AFTER THE CEREMONY</p><h2>सुबह की<br/>याद</h2><span>Lacquer Dawn · archive complete</span></footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
