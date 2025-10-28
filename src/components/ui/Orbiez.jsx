import React, { useEffect, useRef, useState } from "react";
import styles from "./Orbies.module.css";

export default function Stars({
  starCount = 120,
  spawnMin = 1000,
  spawnMax = 7000,
}) {
  const [stars, setStars] = useState([]);
  const [shootingStars, setShootingStars] = useState([]);
  const containerRef = useRef(null);
  const timersRef = useRef([]);

  // Create orbiting stars
  useEffect(() => {
    const MAX_SIZE = 3.5;
    const newStars = [];
    for (let i = 0; i < starCount; i++) {
      const size = +(Math.random() * 2.7 + 0.6).toFixed(2);  // 0.6–3.3
      const opacity = +(Math.random() * 0.5 + 0.4).toFixed(2);
      const twinkle = (4 + Math.random() * 6).toFixed(2) + "s";

      // Orbit parameters
      const radius = Math.floor(60 + Math.random() * 700);    // 60–480px
      const baseAngle = Math.floor(Math.random() * 360);      // deg
      const direction = Math.random() < 0.5 ? 1 : 1;         // cw/ccw
      const speedDegPerSec = 0.5 + Math.random() * 2;          // 4–18°/s
      // duration for one full turn (deg 360 / speed), scaled by direction via sign inside CSS variable
      const period = (360 / speedDegPerSec).toFixed(2) + "s";
      const phase = Math.floor(Math.random() * 360);          // start offset

      // Subtle radial breathing for non-rigid orbit
      const eccentricity = +(Math.random() * 0.06).toFixed(3); // 0–0.06 of radius

      newStars.push({
        id: i,
        size,
        opacity,
        twinkle,
        radius,
        baseAngle,
        direction,
        period,
        phase,
        eccentricity,
      });
    }
    setStars(newStars);
  }, [starCount]);

  // Shooting stars spawner (unchanged)
  useEffect(() => {
    let mounted = true;
    const spawn = () => {
      if (!mounted) return;
      const delay = Math.floor(spawnMin + Math.random() * (spawnMax - spawnMin));
      const spawnTimer = setTimeout(() => {
        if (!mounted) return;
        const id = Date.now() + Math.random();
        const top = (Math.random() * 100).toFixed(1) + "%";
        const left = (Math.random() * 100).toFixed(1) + "%";
        const base = 125, jitter = (Math.random() * 14 - 7);
        const angle = (base + jitter).toFixed(2) + "deg";
        const len = Math.floor(50 + Math.random() * 220) + "px";
        const duration = Math.floor(1000 + Math.random() * 700) + "ms";
        const thickness = (1 + Math.random() * 1.1).toFixed(2) + "px";
        setShootingStars(prev => [...prev, { id, top, left, angle, len, duration, thickness }]);
        const rmTimer = setTimeout(() => {
          setShootingStars(prev => prev.filter(s => s.id !== id));
        }, parseInt(duration) + 80);
        timersRef.current.push(rmTimer);
        spawn();
      }, delay);
      timersRef.current.push(spawnTimer);
    };
    spawn();
    return () => {
      mounted = false;
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
    };
  }, [spawnMin, spawnMax]);

  // Parallax on container center (still works; orbit uses container center too)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = null;
    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const maxPx = 14;
        const px = ((clientX - cx) / (rect.width / 2)) * maxPx;
        const py = ((clientY - cy) / (rect.height / 2)) * maxPx;
        el.style.setProperty("--parallax-x", px.toFixed(2) + "px");
        el.style.setProperty("--parallax-y", py.toFixed(2) + "px");
      });
    };
    const handleLeave = () => {
      const el2 = containerRef.current;
      if (!el2) return;
      el2.style.setProperty("--parallax-x", "0px");
      el2.style.setProperty("--parallax-y", "0px");
    };
    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    el.addEventListener("touchmove", handleMove, { passive: true });
    el.addEventListener("touchend", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
      el.removeEventListener("touchmove", handleMove);
      el.removeEventListener("touchend", handleLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles["star-container"]}
      aria-hidden="true"
      style={{ ["--parallax-x"]: "0px", ["--parallax-y"]: "0px" }}
    >
      {stars.map(s => (
        <div
          key={s.id}
          className={styles.orbit}
          style={{
            ["--radius"]: `${s.radius}px`,
            ["--period"]: s.period,
            ["--phase"]: `${s.phase}deg`,
            ["--direction"]: s.direction,      // +1 or -1
            ["--ecc"]: s.eccentricity,         // 0..0.06
          }}
        >
          <div
            className={styles["star-wrapper"]}
            style={{
              // parallax applied to the star, small so it doesn’t fight orbit
              ["--depth"]: 0.15,
            }}
          >
            <div
              className={styles.star}
              style={{
                width: s.size + "px",
                height: s.size + "px",
                opacity: s.opacity,
                ["--twinkle-duration"]: s.twinkle,
              }}
            />
          </div>
        </div>
      ))}

      {shootingStars.map(st => (
        <div
          key={st.id}
          className={styles["shooting-star"]}
          style={{
            top: st.top,
            left: st.left,
            ["--angle"]: st.angle,
            ["--len"]: st.len,
            ["--duration"]: st.duration,
            ["--thickness"]: st.thickness,
            ["--preoffset"]: "-28px",
          }}
        />
      ))}
    </div>
  );
}
