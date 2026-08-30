"use client";

// Page chrome shared by every ZPU page: the music player and the footer.

import { useEffect, useRef, useState } from "react";
import { useLang } from "../_i18n/context";
import { MUSIC, ZPU, si } from "./data";


function fmtTime(s: number): string {
  if (!s || Number.isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// `id` opts an entry into scroll-spy highlighting; `active` pins it lit, for
// pages whose whole content is that one nav entry.
export type ZpuNavItem = { href: string; label: string; id?: string; active?: boolean };

/* Dark is the base/OG design; light is opt-in and remembered per browser.
   The Select Language and Music popups render outside .zpu-page, so the theme
   is mirrored onto <html> for them to pick up — and cleaned up on unmount so
   other pages that don't have this toggle aren't affected. */
export function useZpuTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const saved = localStorage.getItem("zpu-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("zpu-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.documentElement.setAttribute("data-zpu-theme", theme);
    return () => document.documentElement.removeAttribute("data-zpu-theme");
  }, [theme]);
  return [theme, setTheme] as const;
}

// Highlights the nav entry for whichever section is currently in view.
export function useScrollSpy(ids: string[], initial: string) {
  const [active, setActive] = useState(initial);
  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(",")]);
  return active;
}

// Scroll-reveal: sections fade + rise as they enter the viewport.
export function useScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const secs = Array.from(
      document.querySelectorAll<HTMLElement>(".zpu-wrap > section:not(.zpu-home)")
    );
    secs.forEach((s) => s.classList.add("zpu-reveal"));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("zpu-reveal-in");
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    secs.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);
}

// Floating personal header — full-width at top, collapses into a pill on scroll.
export function ZpuTopbar({
  navItems,
  activeSection,
  theme,
  setTheme,
}: {
  navItems: ZpuNavItem[];
  activeSection?: string;
  theme: "dark" | "light";
  setTheme: (fn: (prev: "dark" | "light") => "dark" | "light") => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`zpu-topbar${scrolled ? " scrolled" : ""}`}>
      <div className="zpu-topbar-inner">
        <a href="/" className="zpu-topbar-brand" aria-label="ZPU">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/Spectrum Icon.png" alt="Spectrum Cheat logo" className="zpu-topbar-logo" />
        </a>

        <nav className="zpu-topbar-nav">
          {navItems.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className={n.active || (n.id && activeSection === n.id) ? "active" : ""}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="zpu-topbar-actions">
          <button
            className="zpu-tb-btn"
            aria-label="Change language"
            onClick={() => window.dispatchEvent(new CustomEvent("spectrum:show-lang"))}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>
          <button
            className={`zpu-tb-btn zpu-tb-theme${theme === "light" ? " is-light" : ""}`}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setTheme((p) => (p === "dark" ? "light" : "dark"))}
          >
            <svg className="zpu-tb-theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <svg className="zpu-tb-theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          </button>
          <button
            className="zpu-tb-btn zpu-tb-music"
            aria-label="Music"
            onClick={() => window.dispatchEvent(new CustomEvent("spectrum:show-music"))}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </button>

        </div>
      </div>
    </header>
  );
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [coverFailed, setCoverFailed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupClosing, setPopupClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openPopup = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPopupClosing(false);
    setPopupOpen(true);
  };
  const closePopup = () => {
    setPopupClosing(true);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setPopupOpen(false);
      setPopupClosing(false);
    }, 300);
  };

  // Spin the floating note icon only while music is actually playing.
  useEffect(() => {
    document.documentElement.classList.toggle("music-playing", playing);
    return () => document.documentElement.classList.remove("music-playing");
  }, [playing]);

  // Restore saved preferences only — NO autoplay.
  // Music stays silent until the user presses play themselves.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    let vol = 0.3;
    let mute = false;
    try {
      const sv = parseFloat(localStorage.getItem("spectrum-zpu-volume") ?? "");
      if (Number.isFinite(sv)) vol = Math.min(1, Math.max(0, sv));
      mute = localStorage.getItem("spectrum-zpu-muted") === "1";
    } catch { /* ignore */ }

    a.volume = vol;
    a.muted = mute;
    setVolume(vol);
    setMuted(mute);
    setPlaying(false);
  }, []);

  const save = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setPlaying(true)).catch(() => {});
      save("spectrum-zpu-paused", "0");
    } else {
      a.pause();
      setPlaying(false);
      save("spectrum-zpu-paused", "1");
    }
  }
  function restart() {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().then(() => setPlaying(true)).catch(() => {});
    save("spectrum-zpu-paused", "0");
  }
  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const a = audioRef.current;
    if (!a || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * dur;
  }
  function toggleMute() {
    const a = audioRef.current;
    if (!a) return;
    const m = !a.muted;
    a.muted = m;
    setMuted(m);
    save("spectrum-zpu-muted", m ? "1" : "0");
  }
  function changeVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    const a = audioRef.current;
    if (!a) return;
    a.volume = v;
    a.muted = v === 0;
    setVolume(v);
    setMuted(v === 0);
    save("spectrum-zpu-volume", String(v));
    save("spectrum-zpu-muted", v === 0 ? "1" : "0");
  }
  useEffect(() => {
    const handler = () => { if (popupOpen && !popupClosing) closePopup(); else openPopup(); };
    window.addEventListener("spectrum:show-music", handler);
    return () => window.removeEventListener("spectrum:show-music", handler);
  }, [popupOpen, popupClosing]);

  return (
    <div className={`zpu-music-wrap${popupOpen ? " open" : ""}${popupClosing ? " closing" : ""}`}>
      <div className="zpu-music-backdrop" onClick={closePopup} />
    <div className="zpu-player">
      <button className="zpu-player-close" aria-label="Close" onClick={closePopup}>✕</button>
      <audio
        ref={audioRef}
        src={MUSIC.src}
        preload="metadata"
        onTimeUpdate={(e) => {
          setCur(e.currentTarget.currentTime);
          const d = e.currentTarget.duration;
          if (d && Number.isFinite(d)) setDur(d);
        }}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (d && Number.isFinite(d)) setDur(d);
        }}
        onDurationChange={(e) => {
          const d = e.currentTarget.duration;
          if (d && Number.isFinite(d)) setDur(d);
        }}
        onEnded={() => setPlaying(false)}
      />

      <div className="zpu-player-cover">
        {MUSIC.cover && !coverFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={MUSIC.cover} alt={MUSIC.title} onError={() => setCoverFailed(true)} />
        ) : (
          <span className="zpu-player-cover-ph">♫</span>
        )}
      </div>

      <div className="zpu-player-main">
        <div className="zpu-player-info">
          <span className="zpu-player-title">{MUSIC.title}</span>
          <span className="zpu-player-artist">{MUSIC.artist}</span>
        </div>

        <div className="zpu-player-bar-row">
          <span className="zpu-player-time">{fmtTime(cur)}</span>
          <div className="zpu-player-bar" onClick={seek}>
            <div className="zpu-player-fill" style={{ width: dur ? `${(cur / dur) * 100}%` : "0%" }} />
          </div>
          <span className="zpu-player-time">{fmtTime(dur)}</span>
        </div>

        <div className="zpu-player-controls">
          <button className="zpu-player-btn" onClick={restart} aria-label="Restart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>
          <button className="zpu-player-play" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
            {playing ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button className="zpu-player-btn" onClick={restart} aria-label="Next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6h2v12h-2zm-2 6L6 6v12z" />
            </svg>
          </button>

          <div className="zpu-player-volume">
            <button className="zpu-player-btn" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
              {muted || volume === 0 ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3z" />
                  <path d="M16 9l4 4m0-4l-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3z" />
                  <path d="M16 8a5 5 0 0 1 0 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              )}
            </button>
            <input
              className="zpu-player-vol-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={changeVolume}
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

// Plain single-color icon (currentColor via CSS mask) matching the main
// site's footer look — no brand colors, just muted โ’ accent on hover.
function FooterSocialIcon({ slug }: { slug: string }) {
  const url = si(slug);
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: 18,
        height: 18,
        backgroundColor: "currentColor",
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

// Footer scoped to the ZPU about page — personal nav/socials instead of the
// marketing site's Platform/Legal/FAQ columns.
export function ZpuFooter({ explore }: { explore?: ZpuNavItem[] }) {
  const { t } = useLang();
  const year = new Date().getFullYear();

  // The favorites page has a different set of sections, so it passes its own
  // Explore column instead of the about page's anchors.
  const exploreLinks: ZpuNavItem[] = explore ?? [
    { href: "#zpu-top", label: t("zpuNavHome") },
    { href: "#zpu-facts", label: t("zpuNavAbout") },
    { href: "#zpu-interests", label: t("zpuNavInterests") },
    { href: "#zpu-skills", label: t("zpuNavSkills") },
    // { href: "#zpu-items", label: t("zpuNavItems") }, // Hidden: My Everyday Carry & Accessories
    { href: "#zpu-works", label: t("zpuNavProjects") },
    { href: "#zpu-connect", label: t("zpuNavContact") },
  ];
  const connectSocials = ZPU.socials.filter((s) =>
    ["youtube", "discord", "instagram", "tiktok"].includes(s.platform)
  );
  const moreLinks = [
    { label: "Spectrum Cheat", href: "https://spectrumcheat.com" },
    { label: "Blox Cheat", href: "https://spectrumcheat.com/bloxcheat" },
    { label: "Spectrum Store", href: "https://spectrumcheat.rexzy.xyz" },
  ];
  const bottomSocials = ZPU.socials.filter((s) => s.platform !== "spectrum");

  return (
    <footer className="footer zpu-own-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="logo-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/Spectrum Icon.png" alt="Spectrum Cheat logo" className="logo-image" width={100} height={100} />
            </div>
            <span className="brand-name">{ZPU.aka}</span>
            <p className="footer-tagline">{t("zpuFooterTagline")}</p>
          </div>

          <div className="footer-links">
            <div className="link-col">
              <h4>{t("zpuFooterExplore")}</h4>
              <ul>
                {exploreLinks.map((l) => (
                  <li key={l.href}><a href={l.href}>{l.label}</a></li>
                ))}
              </ul>
            </div>
            <div className="link-col">
              <h4>{t("zpuFooterConnect")}</h4>
              <ul>
                {connectSocials.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target={s.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="link-col">
              <h4>{t("zpuFooterMore")}</h4>
              <ul>
                {moreLinks.map((l) => (
                  <li key={l.href}><a href={l.href}>{l.label}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2021–{year} Spectrum Cheat. {t("zpuFooterRights")}</span>
          <div className="footer-socials">
            {bottomSocials.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={s.label}
              >
                <FooterSocialIcon slug={s.platform} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}


