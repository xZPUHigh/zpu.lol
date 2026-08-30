"use client";

// Card/tile components shared by the about page and the favorites page.

import { useState } from "react";
import { useLang } from "../_i18n/context";
import { si } from "./data";

// Only the first ten of each collection are genuinely ranked โ€” everything
// after them is shuffled on mount and stays deliberately unnumbered, so a
// missing badge means "unranked", not "rank 11+".
export const RANKED_TOP = 10;
// Movies get a deeper chart than every other collection (24 vs. 10).
export const MOVIES_RANKED_TOP = 24;
// Series chart runs 12 deep instead of the usual 10.
export const SERIES_RANKED_TOP = 12;
// Anime chart runs 24 deep instead of the usual 10.
export const ANIME_RANKED_TOP = 24;
// Manga/manhwa chart runs 12 deep instead of the usual 10.
export const MANGA_RANKED_TOP = 12;
// Books chart runs 48 deep instead of the usual 10.
export const BOOKS_RANKED_TOP = 48;

// The badge hangs off the frame's top-left corner, which rules out putting it
// inside the tile's inner element (that one clips with overflow:hidden). It
// lives on the tile root instead, wrapped in a box that mirrors the frame's
// hover transform so the number zooms and tilts in lockstep with the artwork
// rather than drifting across it.
export function RankBadge({ rank }: { rank?: number }) {
  if (!rank) return null;
  return (
    <span className="zpu-rank-wrap">
      <span className={`zpu-rank${rank <= 3 ? " zpu-rank--podium" : ""}`}>#{rank}</span>
    </span>
  );
}

export function gameInitials(name: string): string {
  const parts = name.split(/[\s:\-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function GameTile({ name, image, price, rank }: { name: string; image?: string; price?: string; rank?: number }) {
  const [failed, setFailed] = useState(false);
  const showImg = image && !failed;
  return (
    <div className="zpu-game" title={price ? `${name} ยท ${price}` : name}>
      <RankBadge rank={rank} />
      <div className="zpu-game-icon">
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} loading="lazy" onError={() => setFailed(true)} />
        ) : (
          <span className="zpu-game-initial">{gameInitials(name)}</span>
        )}
      </div>
      <span className="zpu-game-name">{name}</span>
      {price && <span className="zpu-game-price">{price}</span>}
    </div>
  );
}

const CAR_BRANDS = [
  "Mercedes-AMG", "Mercedes-Benz", "Aston Martin", "Ferrari", "Porsche",
  "McLaren", "Bugatti", "Koenigsegg", "Pagani", "BMW", "Lotus", "Hennessey",
];
const CAR_LOGOS: Record<string, string> = {
  "Ferrari": si("ferrari"),
  "Porsche": si("porsche"),
  "McLaren": si("mclaren"),
  "BMW": si("bmw"),
  "Bugatti": si("bugatti"),
  "Aston Martin": si("astonmartin"),
  "Koenigsegg": si("koenigsegg"),
  "Mercedes-AMG": "/images/carlogos/mercedes.png",
  "Mercedes-Benz": "/images/carlogos/mercedes.png",
  "Pagani": "/images/carlogos/pagani.png",
  "Lotus": "/images/carlogos/lotus.png",
  "Hennessey": "/images/carlogos/hennessey.png",
};
export function CarCard({ name, image, price }: { name: string; image?: string; price?: string }) {
  const [failed, setFailed] = useState(false);
  const brand = CAR_BRANDS.find((b) => name.startsWith(b)) ?? "";
  const model = brand ? name.slice(brand.length).trim() : name;
  const logo = brand ? CAR_LOGOS[brand] : undefined;
  const showImg = image && !failed;
  return (
    <div className="zpu-car-card" title={price ? `${name} ยท ${price}` : name}>
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="zpu-car-photo" src={image} alt={name} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className="zpu-car-fallback">{gameInitials(name)}</span>
      )}
      {brand && <span className="zpu-car-brand">{brand}</span>}
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="zpu-car-logo" src={logo} alt={`${brand} logo`} loading="lazy" />
      )}
      <div className="zpu-car-overlay">
        <span className="zpu-car-model">{model || name}</span>
        {price && <span className="zpu-car-price">{price}</span>}
      </div>
    </div>
  );
}

// Same card as CarCard (photo, gradient, name pinned bottom-left) minus the
// brand pill/logo and price โ€” animals don't have a "brand".
export function AnimalCard({ name, image }: { name: string; image?: string }) {
  const [failed, setFailed] = useState(false);
  const showImg = image && !failed;
  return (
    <div className="zpu-car-card" title={name}>
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="zpu-car-photo" src={image} alt={name} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className="zpu-car-fallback">{gameInitials(name)}</span>
      )}
      <div className="zpu-car-overlay">
        <span className="zpu-car-model">{name}</span>
      </div>
    </div>
  );
}

function isLightHex(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 200;
}

// Colors โ€” a single ribbon where each color owns a flat, fully-saturated
// band and only melts into its neighbor across a narrow seam. The earlier
// all-blobs-overlapping-at-once version turned muddy in the middle (every
// hue stacked on every other); this keeps each color legible on its own and
// blends only where it actually touches the next one.
export function ColorRibbon({ colors }: { colors: { name: string; hex: string }[] }) {
  const n = colors.length;
  const bw = 100 / n;
  const feather = Math.min(6, bw / 3);
  const stops: string[] = [];
  colors.forEach((c, i) => {
    const start = i === 0 ? 0 : i * bw + feather;
    const end = i === n - 1 ? 100 : (i + 1) * bw - feather;
    stops.push(`${c.hex} ${start}%`, `${c.hex} ${end}%`);
  });
  return (
    <div className="zpu-color-ribbon" style={{ background: `linear-gradient(90deg, ${stops.join(", ")})` }}>
      {colors.map((c, i) => (
        <span
          key={c.name}
          className={`zpu-color-ribbon-label${isLightHex(c.hex) ? " zpu-color-ribbon-label--dark" : ""}`}
          style={{ left: `${(i + 0.5) * bw}%` }}
        >
          {c.name}
        </span>
      ))}
    </div>
  );
}

// Bento grid placement for the "Facts About Me" cards.
// Per-fact icon shown in the coloured left tab of each fact card.

export function SectionHead({ title, sub }: { title: string; sub?: string }) {
  const parts = title.trim().split(/\s+/);
  const last = parts[parts.length - 1];
  const hasIcon = parts.length > 1 && /\p{Extended_Pictographic}/u.test(last);
  const icon = hasIcon ? last : "";
  const text = hasIcon ? parts.slice(0, -1).join(" ") : title.trim();
  return (
    <div className="zpu-sechead">
      {icon && <span className="zpu-sechead-ico" aria-hidden="true">{icon}</span>}
      <div className="zpu-sechead-body">
        <h2 className="zpu-works-title">{text}</h2>
        {sub && <p className="zpu-works-sub">{sub}</p>}
      </div>
    </div>
  );
}

// Games โ€” compact icon (OG); on hover the tile expands to reveal banner + logo.
export function GameCard({ name, image, banner, rank }: { name: string; image?: string; banner?: string; rank?: number }) {
  const [failed, setFailed] = useState(false);
  const showIcon = image && !failed;
  return (
    <div className="zpu-gcard" title={name}>
      <RankBadge rank={rank} />
      <div className="zpu-gcard-inner">
        {showIcon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="zpu-gcard-icon" src={image} alt={name} loading="lazy" onError={() => setFailed(true)} />
        ) : (
          <span className="zpu-gcard-fallback">{gameInitials(name)}</span>
        )}
        {banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="zpu-gcard-banner" src={banner} alt="" loading="lazy" />
        )}
        {banner && showIcon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="zpu-gcard-logo" src={image} alt="" loading="lazy" />
        )}
      </div>
      <span className="zpu-gcard-name">{name}</span>
    </div>
  );
}

const MANHWA_TITLES = new Set([
  "Solo Leveling", "Wind Breaker (Manhwa)", "The End Has Come", "Lookism",
  "Killer Peter", "Bad Guy", "Weak Hero", "Viral Hit", "Tower of God",
  "Study Group", "Omniscient Reader's Viewpoint",
]);
export function MangaTile({ name, image, rank }: { name: string; image?: string; rank?: number }) {
  const [failed, setFailed] = useState(false);
  const showImg = image && !failed;
  const isManhwa = MANHWA_TITLES.has(name);
  const display = name.replace(/\s*\((?:Manhwa|Manga)\)$/i, "");
  return (
    <div className="zpu-manga" title={name}>
      <RankBadge rank={rank} />
      <div className="zpu-manga-inner">
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="zpu-manga-cover" src={image} alt={name} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
        ) : (
          <span className="zpu-manga-fallback">{gameInitials(name)}</span>
        )}
        <span className={`zpu-manga-badge${isManhwa ? " zpu-manga-badge--manhwa" : ""}`}>
          {isManhwa ? "MANHWA" : "MANGA"}
        </span>
        <div className="zpu-manga-overlay">
          <span className="zpu-manga-name">{display}</span>
        </div>
      </div>
    </div>
  );
}

// Books โ€” hover opens the cover (hinged on the spine) to reveal the title page.
export function BookTile({ name, image, rank }: { name: string; image?: string; rank?: number }) {
  const [failed, setFailed] = useState(false);
  const showImg = image && !failed;
  return (
    <div className="zpu-book" title={name}>
      <RankBadge rank={rank} />
      <div className="zpu-book-3d">
        <div className="zpu-book-page">
          <span className="zpu-book-page-label">Title</span>
          <span className="zpu-book-page-title">{name}</span>
          <span className="zpu-book-page-rule" aria-hidden="true" />
        </div>
        <div className="zpu-book-cover">
          {showImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={name} loading="lazy" onError={() => setFailed(true)} />
          ) : (
            <span className="zpu-book-fallback">{gameInitials(name)}</span>
          )}
          <span className="zpu-book-binding" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

// Series โ€” Netflix-style cover: play button + title appear on hover.
export function SeriesTile({ name, image, rank }: { name: string; image?: string; rank?: number }) {
  const [failed, setFailed] = useState(false);
  const showImg = image && !failed;
  const tmdb = `https://www.themoviedb.org/search?query=${encodeURIComponent(name)}`;
  return (
    <div className="zpu-series" title={name}>
      <RankBadge rank={rank} />
      <div className="zpu-series-inner">
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="zpu-series-cover" src={image} alt={name} loading="lazy" onError={() => setFailed(true)} />
        ) : (
          <span className="zpu-series-fallback">{gameInitials(name)}</span>
        )}
        <div className="zpu-series-info">
          <a className="zpu-series-play" href={tmdb} target="_blank" rel="noreferrer" aria-label={`Find ${name} on TMDB`}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </a>
          <span className="zpu-series-name">{name}</span>
        </div>
      </div>
    </div>
  );
}

// Places โ€” landscape photo (a 2:3 poster crops scenery badly) with the
// country's flag chipped in below. Flags come from flagcdn by ISO code, the
// same source the language chips use, so no flag files are stored here.
export function PlaceCard({
  name, country, code, image, rank,
}: { name: string; country: string; code: string; image?: string; rank?: number }) {
  const [failed, setFailed] = useState(false);
  const [flagFailed, setFlagFailed] = useState(false);
  const showImg = image && !failed;
  return (
    <div className="zpu-place" title={`${name} ยท ${country}`}>
      <RankBadge rank={rank} />
      <div className="zpu-place-inner">
        {showImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="zpu-place-photo" src={image} alt={name} loading="lazy" onError={() => setFailed(true)} />
        ) : (
          <span className="zpu-place-fallback">{gameInitials(name)}</span>
        )}
        <div className="zpu-place-overlay">
          <span className="zpu-place-country">
            {!flagFailed && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="zpu-place-flag"
                src={`https://flagcdn.com/w80/${code.toLowerCase()}.png`}
                alt=""
                loading="lazy"
                onError={() => setFlagFailed(true)}
              />
            )}
            {country}
          </span>
          <span className="zpu-place-name">{name}</span>
        </div>
      </div>
    </div>
  );
}

export function SportCard({ sport, player, image }: { sport: string; player: string; image?: string }) {
  const [failed, setFailed] = useState(false);
  const showImg = image && !failed;
  return (
    <div className="zpu-sport" title={`${sport} ยท ${player}`}>
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="zpu-sport-photo" src={image} alt={player} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className="zpu-sport-fallback">{gameInitials(player)}</span>
      )}
      <span className={`zpu-sport-tag${["Parkour", "Cycling", "Skydiving"].includes(sport) ? " zpu-sport-tag--dark" : ""}`}>{sport}</span>
      <div className="zpu-sport-overlay">
        <span className="zpu-sport-name">{player}</span>
      </div>
    </div>
  );
}


export function ArtistCard({ name, image, songs }: { name: string; image?: string; songs: string[] }) {
  const { t } = useLang();
  const [failed, setFailed] = useState(false);
  const showImg = image && !failed;
  return (
    <div className="zpu-artist">
      <div className="zpu-artist-head">
        <div className="zpu-artist-photo">
          {showImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={name} loading="lazy" onError={() => setFailed(true)} />
          ) : (
            <span className="zpu-game-initial">{gameInitials(name)}</span>
          )}
        </div>
        <div className="zpu-artist-meta">
          <span className="zpu-artist-name">{name}</span>
          <span className="zpu-artist-label">
            <span className="zpu-eq" aria-hidden="true"><i /><i /><i /></span>
            {t("zpuArtistsTracks")}
          </span>
        </div>
      </div>
      <ol className="zpu-artist-songs">
        {songs.map((s, i) => (
          <li key={s} className="zpu-artist-track">
            <span className="zpu-artist-rank"><span className="zpu-artist-num">{i + 1}</span></span>
            <span className="zpu-artist-title">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}


