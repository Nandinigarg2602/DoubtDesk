import { useEffect, useRef } from 'react';
import useMousePosition from '../hooks/useMousePosition';
import './CinematicBackground.css';

/**
 * CinematicBackground — Spatial Scrollytelling Portal
 * Luminous monolithic doorway animation that zooms, rotates, and illuminates in sync with page scroll.
 */
export default function CinematicBackground({ scrollProgress = 0 }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const { normalized } = useMousePosition();
  const mouseTarget = useRef({ x: 0, y: 0 });
  const mouseCurrent = useRef({ x: 0, y: 0 });

  useEffect(() => {
    mouseTarget.current = normalized;
  }, [normalized]);

  // Ensure autoplay on all browsers
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, []);

  useEffect(() => {
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Smooth lerp mouse coordinates
      mouseCurrent.current.x += (mouseTarget.current.x - mouseCurrent.current.x) * 0.05;
      mouseCurrent.current.y += (mouseTarget.current.y - mouseCurrent.current.y) * 0.05;

      const mx = mouseCurrent.current.x;
      const my = mouseCurrent.current.y;
      const sp = scrollProgress; // 0 to 1

      if (containerRef.current) {
        // Continuous spatial camera kinematics:
        // 1. Scale zooms into the portal as you scroll down (from 1.0 to 1.85)
        const scale = 1.0 + sp * 0.85;
        // 2. Parallax camera tilt combined with vertical trajectory
        const translateX = mx * 20 - sp * 15;
        const translateY = my * 15 + sp * 70;
        // 3. Subtle 3D perspective rotation
        const rotateY = mx * 3;
        const rotateX = -my * 2;

        containerRef.current.style.transform = `scale(${scale}) translate3d(${translateX}px, ${translateY}px, 0) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      }

      if (videoRef.current) {
        const brightness = 0.95 + sp * 0.25;
        const contrast = 1.05 + sp * 0.1;
        videoRef.current.style.filter = `contrast(${contrast}) brightness(${brightness})`;
      }
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, [scrollProgress]);

  return (
    <div className="cinematic-bg" aria-hidden="true">
      {/* 3D Spatial Video Stage */}
      <div ref={containerRef} className="cinematic-bg__spatial-stage">
        <video
          ref={videoRef}
          className="cinematic-bg__video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4"
            type="video/mp4"
          />
          <source src="/assets/cinematic_portal.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Spatial Light Flares & Vignette Blends */}
      <div
        className="cinematic-bg__light-shaft"
        style={{ opacity: 0.35 + scrollProgress * 0.45 }}
      />
      <div className="cinematic-bg__vignette" />
      <div className="cinematic-bg__ground-fog" />
    </div>
  );
}
