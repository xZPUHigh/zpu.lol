"use client";

// Every favorites collection in full. These sections used to live on
// /about/zpu, where ten of them buried the rest of the page โ€” now the about
// page shows one overview shelf that deep-links here (#fav-<topic>).

import { useEffect, useState } from "react";
import { useLang } from "../_i18n/context";
import {
  ZpuFooter,
  ZpuTopbar,
  MusicPlayer,
  useScrollReveal,
  useScrollSpy,
  useZpuTheme,
} from "../_shared/chrome";
import {
  ANIME_RANKED_TOP,
  AnimalCard,
  ArtistCard,
  BOOKS_RANKED_TOP,
  BookTile,
  CarCard,
  ColorRibbon,
  GameCard,
  GameTile,
  MangaTile,
  MANGA_RANKED_TOP,
  MOVIES_RANKED_TOP,
  PlaceCard,
  RANKED_TOP,
  SectionHead,
  SERIES_RANKED_TOP,
  SeriesTile,
  SportCard,
} from "../_shared/tiles";
import { FAV_TOPICS, FAV_TOTAL, ZPU, fmtPrice } from "../_shared/data";

const SECTION_IDS = FAV_TOPICS.map((topic) => `fav-${topic.id}`);

// Display index โ’ badge number. The ranked entries are always the first ten
// of a collection, so anything past that gets no badge at all.
const rankOf = (i: number) => (i < RANKED_TOP ? i + 1 : undefined);
// Movies chart runs 25 deep instead of the usual 10.
const rankOfMovie = (i: number) => (i < MOVIES_RANKED_TOP ? i + 1 : undefined);
// Series chart runs 12 deep instead of the usual 10.
const rankOfSeries = (i: number) => (i < SERIES_RANKED_TOP ? i + 1 : undefined);
// Anime chart runs 24 deep instead of the usual 10.
const rankOfAnime = (i: number) => (i < ANIME_RANKED_TOP ? i + 1 : undefined);
// Manga/manhwa chart runs 12 deep instead of the usual 10.
const rankOfManga = (i: number) => (i < MANGA_RANKED_TOP ? i + 1 : undefined);
// Books chart runs 24 deep instead of the usual 10.
const rankOfBook = (i: number) => (i < BOOKS_RANKED_TOP ? i + 1 : undefined);

// "Explore all" toggle shared by every collection โ€” each section starts
// clipped to `preview` items so the page opens at a scannable length.
function ShowMore({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const { t } = useLang();
  return (
    <button className="zpu-works-more" onClick={onToggle}>
      {t(open ? "zpuShowLess" : "zpuExploreAll")}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform .2s" }}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

export function ZpuFavorites() {
  const { t, lang } = useLang();
  const [theme, setTheme] = useZpuTheme();
  useScrollReveal();
  const activeSection = useScrollSpy(SECTION_IDS, SECTION_IDS[0]);

  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !p[id] }));

  // Randomize movies on the client after mount, but SPREAD each franchise
  // (Spider-Man, John Wick, Iron Man, ...) so no two films from the same
  // series ever land next to each other (keeps SSR order first to avoid
  // hydration mismatch). The ranked top ten is held out of the shuffle โ€”
  // a numbered chart that reorders itself on every reload is not a chart.
  const [moviesOrder, setMoviesOrder] = useState(ZPU.favMovies);
  useEffect(() => {
    type Movie = { name: string; image?: string };
    const top = ZPU.favMovies.slice(0, MOVIES_RANKED_TOP);
    const rest = ZPU.favMovies.slice(MOVIES_RANKED_TOP);
    const shuffle = <T,>(arr: T[]) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    // Some franchises share no common word, so match those titles explicitly.
    const fastFurious = new Set([
      "The Fast and the Furious", "2 Fast 2 Furious",
      "The Fast and the Furious: Tokyo Drift", "Fast & Furious",
      "Fast Five", "Fast & Furious 6", "Furious 7",
      "The Fate of the Furious", "F9", "Fast X",
    ]);
    const jamesBond = new Set([
      "Casino Royale", "Quantum of Solace", "Skyfall",
      "Spectre", "No Time to Die",
    ]);
    // group by franchise (falls back to the film's own name for standalones)
    const franchise = (name: string) => {
      if (name === "Prey") return "Predator"; // Predator film without the word
      if (name === "The King's Man") return "Kingsman"; // Kingsman prequel
      if (name === "Logan") return "Wolverine"; // Wolverine film without the word
      if (name === "Prometheus") return "Alien"; // Alien prequel without the word
      if (name === "Raiders of the Lost Ark") return "Indiana Jones";
      if (name === "Batman Begins") return "The Dark Knight"; // Nolan trilogy
      if (name === "Leatherface") return "Texas Chain"; // 2017 TCM film
      if (name === "Jigsaw" || name === "Spiral") return "Saw"; // Saw films without the word
      if (fastFurious.has(name)) return "Fast & Furious";
      if (jamesBond.has(name)) return "James Bond";
      for (const key of [
        "Spider-Man", "John Wick", "Iron Man", "Harry Potter",
        "The Lord of the Rings", "Final Destination", "Predator",
        "Pirates of the Caribbean", "Captain America", "Black Panther",
        "Back to the Future", "Peaky Blinders", "Kingsman", "Narcos",
        "Doctor Strange", "Avengers", "Wolverine", "The Dark Knight",
        "The Godfather", "Top Gun", "Jurassic", "Terminator", "Rocky",
        "Creed", "Alien", "Star Wars", "Indiana Jones", "The Mummy",
        "Wonder Woman", "Aquaman", "Thor", "Ant-Man",
        "Terrifier", "The Conjuring", "Texas Chain", "Saw",
        "The Equalizer", "Dune",
      ]) {
        if (name.includes(key)) return key;
      }
      return name;
    };
    const groups = new Map<string, Movie[]>();
    for (const m of shuffle(rest)) {
      const k = franchise(m.name);
      (groups.get(k) ?? groups.set(k, []).get(k)!).push(m);
    }
    // largest groups first, then place into even indices, then odd โ€” this
    // guarantees no two same-group items are adjacent.
    const flat = [...groups.values()].sort((a, b) => b.length - a.length).flat();
    const n = flat.length;
    const result = new Array<Movie>(n);
    let idx = 0;
    for (let i = 0; i < n; i += 2) result[i] = flat[idx++];
    for (let i = 1; i < n; i += 2) result[i] = flat[idx++];
    setMoviesOrder([...top, ...result]);
  }, []);

  // Shuffle books / anime / manga / cars / series on mount, keeping the ranked
  // top ten pinned in place (SSR keeps source order to avoid a hydration
  // mismatch). Cars pass keep=0 โ€” they carry no ranks, so there is nothing to
  // pin and the whole list can move.
  const shuffleTail = <T,>(src: T[], keep = RANKED_TOP) => {
    const arr = src.slice(keep);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return [...src.slice(0, keep), ...arr];
  };
  const shuffle = <T,>(src: T[]) => {
    const arr = [...src];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  // Books: the Lupin (20) + Dune (23) run shuffles among itself every load โ€”
  // still always ranks #1-43, just not the same book in the same slot twice.
  // The remaining top-48 picks (#44-48) and the unranked tail stay/shuffle
  // as usual.
  const LUPIN_DUNE_COUNT = 43;
  const shuffleBooks = (src: typeof ZPU.favBooks) => [
    ...shuffle(src.slice(0, LUPIN_DUNE_COUNT)),
    ...shuffleTail(src.slice(LUPIN_DUNE_COUNT), BOOKS_RANKED_TOP - LUPIN_DUNE_COUNT),
  ];
  // Animals: everything shuffles freely except Siberian Husky, which is
  // locked to slot 2 (index 1), and Beagle, locked to slot 3 (index 2).
  const ANIMAL_PINS: Record<number, string> = { 1: "Siberian Husky", 2: "Beagle" };
  const shuffleAnimals = (src: typeof ZPU.favAnimals) => {
    const pinnedNames = new Set(Object.values(ANIMAL_PINS));
    const rest = shuffle(src.filter((a) => !pinnedNames.has(a.name)));
    const result: typeof src = [];
    let ri = 0;
    for (let i = 0; i < src.length; i++) {
      const pinName = ANIMAL_PINS[i];
      const pinned = pinName ? src.find((a) => a.name === pinName) : undefined;
      result.push(pinned ?? rest[ri++]);
    }
    return result;
  };
  const [booksOrder, setBooksOrder] = useState(ZPU.favBooks);
  const [animeOrder, setAnimeOrder] = useState(ZPU.favAnime);
  const [mangaOrder, setMangaOrder] = useState(ZPU.favManga);
  const [carsOrder, setCarsOrder] = useState(ZPU.favCars);
  const [seriesOrder, setSeriesOrder] = useState(ZPU.favSeries);
  const [animalsOrder, setAnimalsOrder] = useState(ZPU.favAnimals);
  useEffect(() => {
    setBooksOrder(shuffleBooks(ZPU.favBooks));
    setAnimeOrder(shuffleTail(ZPU.favAnime, ANIME_RANKED_TOP));
    setMangaOrder(shuffleTail(ZPU.favManga, MANGA_RANKED_TOP));
    setCarsOrder(shuffleTail(ZPU.favCars, 0));
    setSeriesOrder(shuffleTail(ZPU.favSeries, SERIES_RANKED_TOP));
    setAnimalsOrder(shuffleAnimals(ZPU.favAnimals));
  }, []);
  // How many items each collection shows before "Explore all".
  const PREVIEW: Record<string, number> = {
    games: 20, movies: 12, series: 12, anime: 12, manga: 12,
    books: 12, artists: 4, colors: 12, cars: 6, sports: 12, places: 12, food: 24, animals: 6,
  };

  // The grid + tile type differ per collection; the wrapper section, heading
  // and Explore-all button are identical, so only the inside is switched here.
  const grid = (id: string, expanded: boolean) => {
    const cut = <T,>(arr: T[]) => (expanded ? arr : arr.slice(0, PREVIEW[id] ?? 12));
    switch (id) {
      case "games":
        return (
          <div className="zpu-gcard-grid">
            {cut(ZPU.favGames).map((g, i) => (
              <GameCard key={g.name} name={g.name} image={g.image} banner={g.banner} rank={rankOf(i)} />
            ))}
          </div>
        );
      case "food":
        return (
          <div className="zpu-games-grid">
            {cut(ZPU.favFood).map((g, i) => <GameTile key={g.name} name={g.name} image={g.image} rank={rankOf(i)} />)}
          </div>
        );
      case "animals":
        return (
          <div className="zpu-cars-grid">
            {cut(animalsOrder).map((g) => <AnimalCard key={g.name} name={g.name} image={g.image} />)}
          </div>
        );
      case "movies":
      case "series":
      case "anime": {
        const src = id === "movies" ? moviesOrder : id === "series" ? seriesOrder : animeOrder;
        const rankFn = id === "movies" ? rankOfMovie : id === "series" ? rankOfSeries : rankOfAnime;
        return (
          <div className="zpu-series-grid">
            {cut(src).map((g, i) => <SeriesTile key={g.name} name={g.name} image={g.image} rank={rankFn(i)} />)}
          </div>
        );
      }
      case "books":
        return (
          <div className="zpu-books-grid">
            {cut(booksOrder).map((g, i) => <BookTile key={g.name} name={g.name} image={g.image} rank={rankOfBook(i)} />)}
          </div>
        );
      case "manga":
        return (
          <div className="zpu-manga-grid">
            {cut(mangaOrder).map((g, i) => <MangaTile key={g.name} name={g.name} image={g.image} rank={rankOfManga(i)} />)}
          </div>
        );
      case "places":
        return (
          <div className="zpu-places-grid">
            {cut(ZPU.favPlaces).map((p, i) => (
              <PlaceCard key={p.name} name={p.name} country={p.country} code={p.code} image={p.image} rank={rankOf(i)} />
            ))}
          </div>
        );
      case "sports":
        return (
          <div className="zpu-sports-grid">
            {cut(ZPU.favSports).map((s) => (
              <SportCard key={s.player} sport={s.sport} player={s.player} image={s.image} />
            ))}
          </div>
        );
      case "cars":
        return (
          <div className="zpu-cars-grid">
            {cut(carsOrder).map((g) => (
              <CarCard key={g.name} name={g.name} image={g.image}
                price={g.priceUsd ? fmtPrice(g.priceUsd * 34.5, lang) : undefined} />
            ))}
          </div>
        );
      case "artists":
        return (
          <div className="zpu-artists-grid">
            {cut(ZPU.favArtists).map((a) => (
              <ArtistCard key={a.name} name={a.name} image={a.image} songs={a.songs} />
            ))}
          </div>
        );
      case "colors":
        return <ColorRibbon colors={ZPU.favColors} />;
      default:
        return null;
    }
  };

  // Same seven entries as the about page so the header doesn't change shape
  // between the two โ€” every one except Interests jumps back to /about/zpu.
  const navItems = [
    { href: "/#zpu-top", label: t("zpuNavHome") },
    { href: "/#zpu-facts", label: t("zpuNavAbout") },
    { href: "#fav-top", active: true, label: t("zpuNavInterests") },
    { href: "/#zpu-skills", label: t("zpuNavSkills") },
    { href: "/#zpu-items", label: t("zpuNavItems") },
    { href: "/#zpu-works", label: t("zpuNavProjects") },
    { href: "/#zpu-connect", label: t("zpuNavContact") },
  ];

  return (
    <main className="zpu-page zpu-fav-page" data-theme={theme}>
      <div className="zpu-dots" />
      <ZpuTopbar navItems={navItems} theme={theme} setTheme={setTheme} />
      <MusicPlayer />

      <div className="zpu-wrap">
        <section className="zpu-fav-hero" id="fav-top">
          <a className="zpu-fav-back" href="/">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            {t("zpuNavHome")}
          </a>
          <h1 className="zpu-fav-title">{t("zpuCollectionsTitle")}</h1>
          <p className="zpu-fav-sub">{t("zpuCollectionsSub")}</p>
          <div className="zpu-fav-meta">
            <span className="zpu-fav-total">{FAV_TOTAL}</span>
            <span className="zpu-fav-total-label">{t("zpuCollectionsItems")}</span>
            <span className="zpu-fav-dot" aria-hidden="true" />
            <span className="zpu-fav-total">{FAV_TOPICS.length}</span>
            <span className="zpu-fav-total-label">{t("zpuCollectionsTopics")}</span>
          </div>
        </section>

        {/* Sticky topic rail โ€” same scroll-spy the top nav uses, so the chip
            for whichever collection you are scrolled into stays lit. */}
        <nav className="zpu-fav-rail" aria-label={t("zpuCollectionsTitle")}>
          <div className="zpu-fav-rail-inner">
            {FAV_TOPICS.map((topic) => (
              <a
                key={topic.id}
                href={`#fav-${topic.id}`}
                className={`zpu-fav-chip${activeSection === `fav-${topic.id}` ? " active" : ""}`}
                style={{ "--coll-accent": topic.accent } as React.CSSProperties}
              >
                {t(topic.labelKey)}
                <span className="zpu-fav-chip-count">{topic.count}</span>
              </a>
            ))}
          </div>
        </nav>

        {FAV_TOPICS.map((topic) => {
          const expanded = !!open[topic.id];
          return (
            <section
              key={topic.id}
              id={`fav-${topic.id}`}
              className="zpu-games-sec zpu-fav-sec"
              style={{ "--coll-accent": topic.accent } as React.CSSProperties}
            >
              <SectionHead title={t(topic.titleKey)} sub={t(topic.subKey)} />
              {grid(topic.id, expanded)}
              {topic.count > (PREVIEW[topic.id] ?? 12) && (
                <ShowMore open={expanded} onToggle={() => toggle(topic.id)} />
              )}
            </section>
          );
        })}
      </div>

      <ZpuFooter
        explore={FAV_TOPICS.map((topic) => ({
          href: `#fav-${topic.id}`,
          label: t(topic.labelKey),
        }))}
      />
    </main>
  );
}

