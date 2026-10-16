/**
 * LandingPage.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Algor-Algae Hero Landing Page — Design Specification Implementation
 *
 * A record label portal aesthetic adapted for a living digital twin project:
 * - Two panels part outward to uncover a full-bleed bioreactor facade image
 * - The wordmark grows, tracking tightens, and halves travel to opposite edges
 * - Real-time telemetry badges pulse at the hero centre & corners
 * - Below, a throwable deck of operational states replaces the catalogue
 * - All motion is scroll-bound and reversible (no timers)
 * - Complete adherence to design tokens, strict color rules, and typography
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useStore } from '../store';

// ─── Operational States for the Throwable Deck ──────────────────────────────
const OPERATIONAL_STATES = [
  {
    id: 'state-1',
    number: '01',
    title: 'Baseline Equilibrium',
    subtitle: 'Standard Occupancy & Metabolic Circulation',
    occupancy: 1,
    co2: 550,
    algaeHealth: 92,
    damper: 40,
    modeText: 'BALANCED BIO-FEED',
    accentColor: '#34C759',
    description: 'Indoor human respiration is in dynamic equilibrium with living Chlorella columns. Facade dampers maintain standard 40% feed rate, achieving continuous baseline carbon absorption.'
  },
  {
    id: 'state-2',
    number: '02',
    title: 'High Metabolic Surge',
    subtitle: 'Occupancy Spike & Facade Redirection',
    occupancy: 4,
    co2: 1000,
    algaeHealth: 88,
    damper: 88,
    modeText: 'AI REDIRECT ACTIVE',
    accentColor: '#FF9500',
    description: 'YOLOv8 vision senses elevated occupant density. High-CO₂ exhaust is redirected directly into facade spargers at 88% damper position, boosting photosynthetic fixation kinetics.'
  },
  {
    id: 'state-3',
    number: '03',
    title: 'Chlorosis Acid Safeguard',
    subtitle: 'Algae Stressed & Outdoor Atmospheric Bypass',
    occupancy: 3,
    co2: 850,
    algaeHealth: 50,
    damper: 10,
    modeText: 'OUTDOOR BYPASS ACTIVE',
    accentColor: '#FF3B30',
    description: 'Spectrophotometer detects yellow carotenoid accumulation. To avoid catastrophic carbonic acid shock (pH < 6.8), 90% of exhaust is bypassed directly to the rooftop scrubber.'
  },
  {
    id: 'state-4',
    number: '04',
    title: 'Peak Photosynthetic Harvest',
    subtitle: 'Logarithmic Phase & Maximum Biomass',
    occupancy: 2,
    co2: 700,
    algaeHealth: 98,
    damper: 75,
    modeText: 'MAX PHOTOSYNTHESIS',
    accentColor: '#0071E3',
    description: 'Culture operating at optimal light-saturation kinetics. Lipid synthesis reaches maximum efficiency while high-purity O₂ is continuously recirculated into indoor spaces.'
  }
];

// ─── Contributors / Engineering Team Roster ────────────────────────────────
const CONTRIBUTORS_ROSTER = [
  {
    role: 'ALGAL KINETICS & BIO-REACTOR',
    name: 'Dr. E. Vance & Bio-Twin Research Group',
    count: '01'
  },
  {
    role: 'EDGE VISION OCCUPANCY INFERENCE',
    name: 'YOLOv8 Real-Time Tensor Stream',
    count: '02'
  },
  {
    role: 'DUAL-WAVELENGTH SPECTROPHOTOMETRY',
    name: 'HSV ROI Chlorosis Detection Core',
    count: '03'
  },
  {
    role: 'CLOSED-LOOP BMS AUTOMATION',
    name: 'Gemini Autonomous Actuation Engine',
    count: '04'
  },
  {
    role: 'ACIDIFICATION DEFENSE SYSTEM',
    name: 'Sub-60ms Outdoor Atmospheric Bypass',
    count: '05'
  }
];

// ─── Deployment Milestones ──────────────────────────────────────────────────
const DEPLOYMENT_MILESTONES = [
  {
    date: 'Q1 2026',
    title: 'Neoclassical Elevation & Facade Mount',
    status: 'VALIDATED',
    target: '41.4m × 34.2m Core Structure'
  },
  {
    date: 'Q2 2026',
    title: 'Dual Vision Engine: YOLOv8 & HSV ROI',
    status: 'BENCHMARK PASS',
    target: 'Zero-Latency OS Stream'
  },
  {
    date: 'Q3 2026',
    title: 'Acidification Bypass Damper Actuation',
    status: 'ACTIVE DEFENSE',
    target: '< 60ms Outdoor Vent Response'
  },
  {
    date: 'Q4 2026',
    title: 'Continuous Bioreactor Sequestration Loop',
    status: 'OPERATIONAL',
    target: '88% Peak Carbon Capture'
  }
];

export default function LandingPage({ onNavigate }) {
  // Live Telemetry from Store
  const occupancy = useStore((s) => s.occupancy);
  const co2Ppm = useStore((s) => s.co2_ppm);
  const algaeHealth = useStore((s) => s.algae_health);
  const hvacState = useStore((s) => s.hvacState);
  const isBypass = hvacState.activeLoop === 'roof_bypass' || algaeHealth < 45;

  // Reduced motion preference detection
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
      const listener = (e) => setPrefersReducedMotion(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  // Hero Scroll Animation State (binds scroll position to transforms)
  const heroRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (heroRef.current) {
            const rect = heroRef.current.getBoundingClientRect();
            const totalScrollable = rect.height - window.innerHeight;
            if (totalScrollable > 0) {
              const current = -rect.top;
              const p = Math.min(1, Math.max(0, current / totalScrollable));
              setScrollProgress(p);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use effective progress: if reduced-motion, jump directly to fully open
  const effectiveProgress = prefersReducedMotion ? 1.0 : scrollProgress;

  // ─── Computed Hero Portal Transform Values ────────────────────────────────
  // Panel translation: 0% to ±105% (clears frame completely on scroll)
  const leftPanelX = -effectiveProgress * 105;
  const rightPanelX = effectiveProgress * 105;

  // Full-bleed image scale: 1.15 -> 1.00
  const imageScale = 1.15 - effectiveProgress * 0.15;

  // Duotone wash opacity: 0 -> 0.25
  const duotoneOpacity = effectiveProgress * 0.25;

  // Title scale and letter-spacing:
  // scale: 1.0 -> 1.25, letter-spacing: -0.02em -> -0.035em
  const titleScale = 1.0 + effectiveProgress * 0.25;
  const titleTracking = -0.02 - effectiveProgress * 0.015;

  // Wordmark separation: first word translates left, second translates right
  // Travels >100px across the scroll
  const wordLeftShift = -effectiveProgress * 140; // px
  const wordRightShift = effectiveProgress * 140; // px

  // Accent dots travel outward toward opposite corners (top-left & bottom-right)
  const dotGreenX = -effectiveProgress * 42; // vw
  const dotGreenY = -effectiveProgress * 36; // vh
  const dotCyanX = effectiveProgress * 42;
  const dotCyanY = effectiveProgress * 36;

  // Statement section floating circular image drift and rotate on scroll
  const driftY = (effectiveProgress - 0.4) * 90;
  const driftRot = (effectiveProgress - 0.4) * 30;

  // ─── Throwable Deck State & Drag Logic ────────────────────────────────────
  const [deckCards, setDeckCards] = useState(OPERATIONAL_STATES);
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, startY: 0, dx: 0, dy: 0 });
  const [isThrowing, setIsThrowing] = useState(false);
  const [throwDir, setThrowDir] = useState(1);
  const deckRef = useRef(null);

  const handlePointerDown = (e) => {
    if (isThrowing || prefersReducedMotion) return;
    setDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      dy: 0
    });
    if (e.currentTarget.setPointerCapture) {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    }
  };

  const handlePointerMove = (e) => {
    if (!dragState.isDragging || isThrowing) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    setDragState((prev) => ({ ...prev, dx, dy }));
  };

  const throwCard = useCallback((direction = 1) => {
    if (isThrowing) return;
    if (prefersReducedMotion) {
      setDeckCards((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
      return;
    }

    setIsThrowing(true);
    setThrowDir(direction);

    setTimeout(() => {
      setDeckCards((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
      setDragState({ isDragging: false, startX: 0, startY: 0, dx: 0, dy: 0 });
      setIsThrowing(false);
    }, 450);
  }, [isThrowing, prefersReducedMotion]);

  const showPreviousCard = useCallback(() => {
    if (isThrowing) return;
    if (prefersReducedMotion) {
      setDeckCards((prev) => {
        const last = prev[prev.length - 1];
        const rest = prev.slice(0, prev.length - 1);
        return [last, ...rest];
      });
      return;
    }

    setIsThrowing(true);
    setThrowDir(-1);
    setDeckCards((prev) => {
      const last = prev[prev.length - 1];
      const rest = prev.slice(0, prev.length - 1);
      return [last, ...rest];
    });
    setTimeout(() => {
      setIsThrowing(false);
      setDragState({ isDragging: false, startX: 0, startY: 0, dx: 0, dy: 0 });
    }, 380);
  }, [isThrowing, prefersReducedMotion]);

  const handlePointerUp = () => {
    if (!dragState.isDragging || isThrowing) return;
    const deckWidth = deckRef.current ? deckRef.current.offsetWidth : 360;
    const threshold = deckWidth * 0.1; // ~10% of deck width
    if (Math.abs(dragState.dx) > threshold) {
      throwCard(dragState.dx > 0 ? 1 : -1);
    } else {
      setDragState({ isDragging: false, startX: 0, startY: 0, dx: 0, dy: 0 });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      throwCard(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      showPreviousCard();
    }
  };

  return (
    <div className="w-full bg-[#F5F5F7] text-[#1D1D1F] font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display',system-ui,sans-serif] selection:bg-[#0071E3] selection:text-white min-h-screen">

      {/* ══════════════════════════════════════════════════════════════════════
          1. HERO PORTAL (2.5 VIEWPORTS TALL CONTAINER, STICKY 100VH STAGE)
         ══════════════════════════════════════════════════════════════════════ */}
      <section 
        ref={heroRef} 
        className="relative w-full h-[250vh] select-none"
        role="banner"
      >
        <div 
          className="hero-stage sticky top-0 w-full h-screen overflow-hidden isolation-isolate flex items-center justify-center bg-[#F5F5F7]"
        >
          {/* Layer 1: Full-Bleed Neoclassical Facade Image (scale 1.15 -> 1.0) */}
          <div 
            className="hero-image absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-75 will-change-transform"
            style={{
              backgroundImage: `url('/facade.jpg')`,
              transform: `scale(${imageScale})`
            }}
          />

          {/* Layer 2: Duotone Wash Overlay (mix-blend-mode: overlay, opacity 0 -> 0.25) */}
          <div 
            className="hero-overlay absolute inset-0 pointer-events-none transition-opacity duration-75 will-change-opacity"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.22) 0%, rgba(52, 199, 89, 0.22) 100%)',
              mixBlendMode: 'overlay',
              opacity: duotoneOpacity
            }}
          />

          {/* Layer 3: Radial Veil (Gentle light vignette, keeps central bioreactor in focus) */}
          <div 
            className="hero-veil absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(245, 245, 247, 0.5) 80%, #F5F5F7 100%)'
            }}
          />

          {/* Layer 4: Two Solid White Parting Panels (meet in center when closed, translate outward) */}
          <div 
            className="hero-panel hero-panel-left absolute top-0 left-0 h-full bg-[#FFFFFF] z-10 will-change-transform border-r border-[rgba(0,0,0,0.08)] shadow-[0_0_50px_rgba(0,0,0,0.06)]"
            style={{
              width: '50.5%',
              transform: `translateX(${leftPanelX}%)`
            }}
          />
          <div 
            className="hero-panel hero-panel-right absolute top-0 right-0 h-full bg-[#FFFFFF] z-10 will-change-transform border-l border-[rgba(0,0,0,0.08)] shadow-[0_0_50px_rgba(0,0,0,0.06)]"
            style={{
              width: '50.5%',
              transform: `translateX(${rightPanelX}%)`
            }}
          />

          {/* Layer 5: Accent Dots (Apple Signal Indicators, center initially, travel outward) */}
          <div 
            className="hero-dot hero-dot-green absolute z-20 pointer-events-none w-1.5 h-1.5 rounded-full will-change-transform"
            style={{
              top: '50%',
              left: '50%',
              backgroundColor: '#34C759',
              color: '#34C759',
              boxShadow: '0 0 10px rgba(52, 199, 89, 0.7)',
              filter: 'drop-shadow(0 0 5px rgba(52, 199, 89, 0.6))',
              transform: `translate(calc(-50% + ${dotGreenX}vw), calc(-50% + ${dotGreenY}vh))`
            }}
          />
          <div 
            className="hero-dot hero-dot-cyan absolute z-20 pointer-events-none w-1.5 h-1.5 rounded-full will-change-transform"
            style={{
              top: '50%',
              left: '50%',
              backgroundColor: '#0071E3',
              color: '#0071E3',
              boxShadow: '0 0 10px rgba(0, 113, 227, 0.7)',
              filter: 'drop-shadow(0 0 5px rgba(0, 113, 227, 0.6))',
              transform: `translate(calc(-50% + ${dotCyanX}vw), calc(-50% + ${dotCyanY}vh))`
            }}
          />

          {/* Layer 6: Splitting Wordmark (SF Pro Display / Syne, 36–48px, near-black ink #1D1D1F) */}
          <div 
            className="relative z-20 text-center pointer-events-none w-full px-6 flex justify-center items-center"
            style={{
              transform: `scale(${titleScale})`,
              letterSpacing: `${titleTracking}em`
            }}
          >
            <h1 className="hero-title font-['Syne'] font-extrabold uppercase text-[clamp(26px,3.8vw,48px)] text-[#1D1D1F] leading-none flex items-center justify-center space-x-6">
              <span 
                className="word-left inline-block will-change-transform transition-transform duration-75 whitespace-nowrap text-[#1D1D1F]"
                style={{ transform: `translateX(${wordLeftShift}px)` }}
              >
                Algor
              </span>
              <span 
                className="word-right inline-block will-change-transform transition-transform duration-75 text-[#1D1D1F] whitespace-nowrap"
                style={{ transform: `translateX(${wordRightShift}px)` }}
              >
                Algae<span className="text-[#0071E3]">.</span>
              </span>
            </h1>
          </div>

          {/* Layer 7: Corner Metadata Badges (Apple SF Pro Text, 12px, #86868B) */}
          {/* Top-Left: Project Year/Phase */}
          <div className="hero-metadata hero-metadata-tl absolute top-16 left-6 z-30 pointer-events-none text-[12px] uppercase tracking-[0.12em] text-[#86868B] font-medium">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34C759] mr-2 align-middle" />
            2026 // Autonomous Digital Twin
          </div>

          {/* Top-Right: Occupancy Badge and CO2 ppm */}
          <div className="hero-metadata hero-metadata-tr absolute top-16 right-6 z-30 pointer-events-none font-mono text-[12px] text-[#86868B] tracking-tight text-right">
            <span>OCCUPANCY: <strong className="text-[#1D1D1F] font-semibold">{occupancy}</strong></span>
            <span className="mx-2 text-[rgba(0,0,0,0.12)]">|</span>
            <span>CO₂: <strong className="text-[#0071E3] font-semibold">{co2Ppm} PPM</strong></span>
          </div>

          {/* Bottom-Left: Algae Health % */}
          <div className="hero-metadata hero-metadata-bl absolute bottom-8 left-6 z-30 pointer-events-none font-mono text-[12px] text-[#86868B] tracking-tight">
            <span>ALGAE HEALTH: </span>
            <strong className="text-[#34C759] font-semibold">{algaeHealth.toFixed(0)}%</strong>
          </div>

          {/* Bottom-Right: Atmospheric Rooftop Vent Status */}
          <div className="hero-metadata hero-metadata-br absolute bottom-8 right-6 z-30 pointer-events-none text-[12px] uppercase tracking-[0.12em] text-[#86868B] text-right font-medium">
            <span>ROOFTOP VENT: </span>
            <span className={isBypass ? 'text-[#FF3B30] font-semibold' : 'text-[#1D1D1F]'}>
              {isBypass ? 'BYPASS ACTIVE' : 'IDLE'}
            </span>
          </div>

          {/* Scroll Down Prompt Indicator (Fades out on scroll) */}
          <div 
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center transition-opacity duration-300"
            style={{ opacity: effectiveProgress < 0.25 ? 1 - effectiveProgress * 4 : 0 }}
          >
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#86868B] block mb-1 font-medium">
              Scroll to Open Portal
            </span>
            <div className="w-4 h-6 rounded-full border border-[rgba(0,0,0,0.18)] mx-auto flex items-start justify-center p-1">
              <div className="w-1 h-1.5 rounded-full bg-[#0071E3] animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. STATEMENT FOLD (FULL-HEIGHT HERO EXTENSION)
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen py-24 px-6 lg:px-16 flex flex-col justify-center border-t border-[rgba(0,0,0,0.08)] bg-[#FFFFFF] overflow-hidden">
        
        {/* Outlined Index Numeral "01" (Right edge background: Apple hairline stroke) */}
        <div 
          className="absolute right-6 lg:right-20 top-1/2 -translate-y-1/2 pointer-events-none select-none font-['Syne'] font-extrabold text-[clamp(120px,22vw,300px)] leading-none text-transparent z-0"
          style={{
            WebkitTextStroke: '2px rgba(0, 0, 0, 0.05)'
          }}
        >
          01
        </div>

        {/* Floating Circular Image: Bioreactor Cross-Section (Drifts and rotates on scroll) */}
        <div 
          className="absolute right-8 lg:right-32 top-1/2 -translate-y-1/2 w-52 h-52 lg:w-80 lg:h-80 rounded-full overflow-hidden pointer-events-none border border-[rgba(0,0,0,0.08)] shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-transform duration-75 will-change-transform opacity-90 hidden md:block z-10"
          style={{
            transform: `translateY(${driftY}px) rotate(${driftRot}deg)`
          }}
        >
          <img 
            src="/bioreactor-cross.jpg" 
            alt="Bioreactor cross-section" 
            className="w-full h-full object-cover scale-105"
          />
        </div>

        <div className="relative z-10 max-w-3xl space-y-8">
          {/* Small Label (12px uppercase, letter-spacing: 0.14em, #86868B) */}
          <div className="text-[12px] uppercase tracking-[0.14em] text-[#86868B] font-semibold">
            01 // Architectural Bio-Manifesto
          </div>

          {/* Statement: clamp(24px, 3.6vw, 52px) Syne 700, ~22ch measure, one phrase in Apple Blue #0071E3 */}
          <h2 className="font-['Syne'] font-bold text-[clamp(24px,3.6vw,52px)] leading-[1.12] text-[#1D1D1F] max-w-[22ch]">
            Architecture is no longer an inert envelope; it is an autonomous{' '}
            <span className="text-[#0071E3]">photosynthetic carbon sink</span>{' '}
            operating at cellular velocity.
          </h2>

          <p className="text-sm sm:text-base text-[#86868B] leading-relaxed max-w-xl">
            Commercial real estate accounts for nearly 40% of global operational carbon emissions. 
            Algor-Algae routes human metabolic breath exhaust into living Chlorella columns, 
            converting mechanical ventilation into continuous biofuel synthesis and pure oxygen generation.
          </p>

          <div className="pt-4 flex flex-wrap gap-4 text-xs">
            <button
              onClick={() => onNavigate('overview')}
              className="btn-apple-primary px-6 py-3 flex items-center space-x-2 tracking-[0.08em] uppercase text-xs"
            >
              <span>Explore 3D Digital Twin</span>
              <span>→</span>
            </button>
            <button
              onClick={() => onNavigate('hvac')}
              className="btn-apple-outline px-6 py-3 flex items-center space-x-2 tracking-[0.08em] uppercase text-xs"
            >
              <span>View 2D Schematic</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3. LIVING SYSTEMS DECK (THROWABLE OPERATIONAL CARDS)
         ══════════════════════════════════════════════════════════════════════ */}
      <section 
        className="relative w-full min-h-screen py-24 px-6 lg:px-16 border-t border-[rgba(0,0,0,0.08)] bg-[#F5F5F7] flex flex-col justify-center"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Operational states deck"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Context, Lede & Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-[12px] uppercase tracking-[0.14em] text-[#86868B] font-semibold">
              02 // Living Operational States
            </div>

            <h2 className="font-['Syne'] font-bold text-[clamp(28px,3.6vw,44px)] leading-tight text-[#1D1D1F]">
              Autonomous Bio-Responsive Dynamics
            </h2>

            <p className="text-sm text-[#86868B] leading-relaxed">
              The building management system modulates 3-way motorized dampers and circulation pumps based on human breath flux and photobioreactor vitality. Throw through the deck to examine real-time state transitions.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center space-x-3 text-[#86868B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                <span>State 1: Baseline Photosynthetic Equilibrium</span>
              </div>
              <div className="flex items-center space-x-3 text-[#86868B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500]" />
                <span>State 2: High Metabolic Surge Redirection</span>
              </div>
              <div className="flex items-center space-x-3 text-[#86868B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
                <span>State 3: Carotenoid Stress Acidification Bypass</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 text-xs uppercase tracking-wider">
              <button
                onClick={() => onNavigate('overview')}
                className="btn-apple-primary px-5 py-2.5 text-xs"
              >
                Launch Digital Twin
              </button>
              <button
                onClick={() => onNavigate('hvac')}
                className="btn-apple-outline px-5 py-2.5 text-xs"
              >
                View 2D Schematic
              </button>
            </div>
          </div>

          {/* Right Column: Physical Throwable Deck */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            
            {/* The Stack Container */}
            <div 
              ref={deckRef}
              className="deck relative w-full max-w-[400px] h-[450px] touch-pan-y cursor-grab active:cursor-grabbing select-none"
              tabIndex={0}
              role="region"
              aria-label="Operational states deck stack"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {deckCards.map((card, index) => {
                const isTop = index === 0;
                
                // Stack Layout according to specification:
                // Card N (top)     → scale: 1.00, rotate: 0deg, offset-x: 0, offset-y: 0
                // Card N–1         → scale: 0.98, rotate: −2deg, offset-y: 8px, offset-x: 4px
                // Card N–2         → scale: 0.96, rotate: −4deg, offset-y: 16px, offset-x: 8px
                // Card N-3         → scale: 0.94, rotate: -6deg, offset-y: 24px, offset-x: 12px
                let scale = isTop ? 1.0 : Math.max(0.9, 1.0 - index * 0.02);
                let scaleY = 1.0;
                let rot = isTop ? 0 : -index * 2;
                let translateY = isTop ? 0 : index * 8;
                let translateX = isTop ? 0 : index * 4;

                if (isTop) {
                  if (dragState.isDragging) {
                    translateX = dragState.dx;
                    translateY = dragState.dy;
                    rot = dragState.dx * 0.1; // rotate proportional to dx
                    scaleY = 1.05; // slight scaleY up on drag
                  } else if (isThrowing) {
                    translateX = throwDir * 450; // roll and throw
                    rot = throwDir * 45;
                    scaleY = 0.9; // slight compression during flight
                  }
                }

                return (
                  <div
                    key={card.id}
                    className="deck-card absolute inset-0 w-full h-full rounded-2xl p-7 bg-[#FFFFFF] border border-[rgba(0,0,0,0.08)] flex flex-col justify-between shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all will-change-transform"
                    style={{
                      zIndex: deckCards.length - index,
                      transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rot}deg) scale(${scale}) scaleY(${scaleY})`,
                      transition: (isTop && dragState.isDragging) ? 'none' : 'transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.15), opacity 0.35s ease',
                      opacity: isTop && isThrowing ? 0.3 : 1.0 - index * 0.1
                    }}
                  >
                    {/* Top Row: Index Numeral & Technical Mode Ornament */}
                    <div className="flex items-center justify-between">
                      <span className="font-['Syne'] font-extrabold text-2xl text-[rgba(0,0,0,0.12)]">
                        {card.number}
                      </span>
                      <span 
                        className="font-mono text-[10.5px] uppercase tracking-wider px-2 py-0.5 rounded-[980px] border font-medium"
                        style={{
                          borderColor: `${card.accentColor}40`,
                          backgroundColor: `${card.accentColor}14`,
                          color: card.accentColor
                        }}
                      >
                        {card.modeText}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="space-y-3">
                      <h3 className="card-title font-['Syne'] font-bold text-xl text-[#1D1D1F]">
                        {card.title}
                      </h3>
                      <p className="text-xs text-[#86868B] leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    {/* Telemetry Metrics Row */}
                    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-[rgba(0,0,0,0.08)] font-mono text-[11px]">
                      <div className="card-stat">
                        <span className="text-[#86868B] text-[9.5px] block uppercase font-medium">Occupants</span>
                        <span className="text-[#1D1D1F] font-bold">{card.occupancy}</span>
                      </div>
                      <div className="card-stat">
                        <span className="text-[#86868B] text-[9.5px] block uppercase font-medium">CO₂</span>
                        <span className="text-[#1D1D1F] font-bold">{card.co2} ppm</span>
                      </div>
                      <div className="card-stat">
                        <span className="text-[#86868B] text-[9.5px] block uppercase font-medium">Algae</span>
                        <span className="font-bold" style={{ color: card.accentColor }}>{card.algaeHealth}%</span>
                      </div>
                      <div className="card-stat text-right">
                        <span className="text-[#86868B] text-[9.5px] block uppercase font-medium">Damper</span>
                        <span className="text-[#1D1D1F] font-bold">{card.damper}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hint Line & Keyboard Controls */}
            <div className="mt-8 flex flex-col items-center space-y-3">
              <span className="text-[11px] uppercase tracking-[0.14em] text-[#86868B] font-medium">
                Drag to explore | ← → Keys
              </span>

              {/* Progress Dots */}
              <div className="deck-progress flex items-center space-x-2">
                {OPERATIONAL_STATES.map((state, i) => {
                  const isActive = deckCards[0].id === state.id;
                  return (
                    <button
                      key={state.id}
                      onClick={() => throwCard(1)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? 'bg-[#0071E3] scale-125' : 'bg-[rgba(0,0,0,0.15)]'}`}
                      aria-label={`Jump to state ${i + 1}`}
                    />
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4. ROSTER (HAIRLINE-RULED ROWS: CONTRIBUTORS / TEAM)
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full py-24 px-6 lg:px-16 border-t border-[rgba(0,0,0,0.08)] bg-[#FFFFFF]">
        <div className="max-w-5xl mx-auto space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[12px] uppercase tracking-[0.14em] text-[#86868B] font-semibold">
                03 // Contributors / Team
              </div>
              <h2 className="font-['Syne'] font-bold text-3xl text-[#1D1D1F] mt-1">
                Integrated Systems Engineering
              </h2>
            </div>
            <span className="font-mono text-xs text-[#86868B]">
              05 VERIFIED SUBSYSTEMS
            </span>
          </div>

          {/* Hairline-Ruled Rows */}
          <div className="border-t border-[rgba(0,0,0,0.08)]">
            {CONTRIBUTORS_ROSTER.map((item, i) => (
              <div 
                key={i} 
                className="py-5 border-b border-[rgba(0,0,0,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F5F5F7] transition-colors px-3 rounded-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
                  {/* Uppercase accent label: 12px, #86868B */}
                  <span className="text-[12px] uppercase tracking-[0.12em] text-[#86868B] sm:w-64 font-medium">
                    {item.role}
                  </span>
                  {/* Display-face name: 18px Syne 700, #1D1D1F */}
                  <span className="font-['Syne'] font-bold text-[18px] text-[#1D1D1F]">
                    {item.name}
                  </span>
                </div>
                {/* Right-aligned count: 12px monospace */}
                <span className="font-mono text-[12px] text-[#86868B] text-left sm:text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          5. DATES TABLE (DEPLOYMENT BENCHMARK MILESTONES)
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full py-24 px-6 lg:px-16 border-t border-[rgba(0,0,0,0.08)] bg-[#F5F5F7]">
        <div className="max-w-5xl mx-auto space-y-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-[12px] uppercase tracking-[0.14em] text-[#86868B] font-semibold">
                04 // Benchmark Validation
              </div>
              <h2 className="font-['Syne'] font-bold text-3xl text-[#1D1D1F] mt-1">
                Deployment Milestones
              </h2>
            </div>
            <span className="font-mono text-xs text-[#86868B]">
              LEED PLATINUM CRITERIA
            </span>
          </div>

          {/* Desktop Table: screens >= 768px */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.08)] font-semibold uppercase tracking-[0.12em] text-[#86868B]">
                  <th className="py-4 pr-6">Milestone</th>
                  <th className="py-4 pr-6">Phase Description</th>
                  <th className="py-4 pr-6 text-center">Status</th>
                  <th className="py-4 text-right">Target Specification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(0,0,0,0.08)]">
                {DEPLOYMENT_MILESTONES.map((m, i) => (
                  <tr key={i} className="hover:bg-white transition-colors">
                    {/* First column: Dates in Syne 700 */}
                    <td className="py-5 pr-6 font-['Syne'] font-bold text-sm text-[#1D1D1F]">
                      {m.date}
                    </td>
                    <td className="py-5 pr-6 text-[#1D1D1F]">
                      {m.title}
                    </td>
                    <td className="py-5 pr-6 text-center">
                      <span className="font-mono text-[10.5px] px-2.5 py-0.5 rounded-[980px] border border-[#34C759]/30 text-[#34C759] bg-[#34C759]/10 font-semibold">
                        {m.status}
                      </span>
                    </td>
                    <td className="py-5 font-mono text-xs text-[#86868B] text-right">
                      {m.target}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Collapse: Stacks to two-column grid per row on screens < 768px */}
          <div className="md:hidden divide-y divide-[rgba(0,0,0,0.08)] border-y border-[rgba(0,0,0,0.08)]">
            {DEPLOYMENT_MILESTONES.map((m, i) => (
              <div key={i} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-['Syne'] font-bold text-sm text-[#1D1D1F]">{m.date}</span>
                  <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-[980px] border border-[#34C759]/30 text-[#34C759] bg-[#34C759]/10 font-semibold">
                    {m.status}
                  </span>
                </div>
                <div className="text-xs text-[#1D1D1F]">{m.title}</div>
                <div className="font-mono text-[11px] text-[#86868B]">{m.target}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          6. CLOSE SECTION WITH CROPPED WORDMARK & APPLE FOOTER
         ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full pt-24 border-t border-[rgba(0,0,0,0.08)] bg-[#FFFFFF] overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 lg:px-16 space-y-12">
          
          <div className="space-y-4 max-w-xl">
            <h2 className="font-['Syne'] font-bold text-3xl sm:text-4xl text-[#1D1D1F]">
              Enter the Living Facade Digital Twin
            </h2>
            <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed">
              Real-time telemetry streaming at 30 FPS. Modulate dampers, inspect OpenCV spectrophotometry ROI boxes, and simulate human occupancy loads.
            </p>
          </div>

          {/* Two Buttons at Opposite Edges (Left and Right) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-xs uppercase tracking-wider">
            <button
              onClick={() => onNavigate('overview')}
              className="btn-apple-primary px-6 py-3 rounded-[980px] text-xs flex items-center justify-center space-x-2"
            >
              <span>Launch 3D Digital Twin</span>
              <span>→</span>
            </button>

            <button
              onClick={() => onNavigate('hvac')}
              className="btn-apple-outline px-6 py-3 rounded-[980px] text-xs flex items-center justify-center space-x-2"
            >
              <span>Inspect 2D HVAC Schematic</span>
              <span>→</span>
            </button>
          </div>

          {/* Hairline Footer Strip: Full-width 1px border above wordmark */}
          <div className="w-full h-px bg-[rgba(0,0,0,0.08)] mt-16" />
        </div>

        {/* Cropped Wordmark: Full-width Syne 800, translated down so page edge crops top */}
        <div className="w-full overflow-hidden select-none pointer-events-none mt-12 flex justify-center">
          <div className="font-['Syne'] font-extrabold text-[clamp(60px,14vw,220px)] leading-[0.7] tracking-[-0.035em] text-[#1D1D1F] text-center whitespace-nowrap translate-y-[28%] opacity-90">
            ALGOR-ALGAE<span className="text-[#0071E3]">.</span>
          </div>
        </div>
      </section>

      {/* Apple Retail System Footer (apple-design.md) */}
      <footer className="w-full bg-[#F5F5F7] border-t border-[rgba(0,0,0,0.08)] py-8 px-6 lg:px-16 text-center">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#86868B]">
          <div>
            Copyright © 2026 Algor-Algae Systems. All rights reserved. Built for Living Facade AI Bio-Architecture.
          </div>
          <div className="flex items-center space-x-5">
            <button onClick={() => onNavigate('overview')} className="hover:text-[#0066CC] transition-colors">3D Digital Twin</button>
            <button onClick={() => onNavigate('human')} className="hover:text-[#0066CC] transition-colors">Occupancy Inference</button>
            <button onClick={() => onNavigate('algae')} className="hover:text-[#0066CC] transition-colors">Algae Health</button>
            <button onClick={() => onNavigate('hvac')} className="hover:text-[#0066CC] transition-colors">HVAC Loop</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
