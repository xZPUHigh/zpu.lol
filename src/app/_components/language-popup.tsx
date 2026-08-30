"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "../_i18n/context";

const LANGUAGES = [
  { code: "af", country: "za", name: "Afrikaans",              native: "Afrikaans"           },
  { code: "ar", country: "sa", name: "Arabic",                 native: "العربية"              },
  { code: "az", country: "az", name: "Azerbaijani",            native: "Azərbaycan"           },
  { code: "be", country: "by", name: "Belarusian",             native: "Беларуская"           },
  { code: "bg", country: "bg", name: "Bulgarian",              native: "Български"            },
  { code: "bn", country: "bd", name: "Bengali",                native: "বাংলা"                },
  { code: "bs", country: "ba", name: "Bosnian",                native: "Bosanski"             },
  { code: "cs", country: "cz", name: "Czech",                  native: "Čeština"              },
  { code: "da", country: "dk", name: "Danish",                 native: "Dansk"                },
  { code: "de", country: "de", name: "German",                 native: "Deutsch"              },
  { code: "el", country: "gr", name: "Greek",                  native: "Ελληνικά"             },
  { code: "es", country: "es", name: "Spanish",                native: "Español"              },
  { code: "et", country: "ee", name: "Estonian",               native: "Eesti"                },
  { code: "fa", country: "ir", name: "Persian",                native: "فارسی"                },
  { code: "fi", country: "fi", name: "Finnish",                native: "Suomi"                },
  { code: "fr", country: "fr", name: "French",                 native: "Français"             },
  { code: "he", country: "il", name: "Hebrew",                 native: "עברית"                },
  { code: "hi", country: "in", name: "Hindi",                  native: "हिन्दी"                },
  { code: "hr", country: "hr", name: "Croatian",               native: "Hrvatski"             },
  { code: "hu", country: "hu", name: "Hungarian",              native: "Magyar"               },
  { code: "hy", country: "am", name: "Armenian",               native: "Հայերեն"              },
  { code: "id", country: "id", name: "Indonesian",             native: "Bahasa Indonesia"     },
  { code: "is", country: "is", name: "Icelandic",              native: "Íslenska"             },
  { code: "it", country: "it", name: "Italian",                native: "Italiano"             },
  { code: "ja", country: "jp", name: "Japanese",               native: "日本語"               },
  { code: "ka", country: "ge", name: "Georgian",               native: "ქართული"              },
  { code: "kk", country: "kz", name: "Kazakh",                 native: "Қазақша"              },
  { code: "km", country: "kh", name: "Khmer",                  native: "ខ្មែរ"                },
  { code: "ko", country: "kr", name: "Korean",                 native: "한국어"               },
  { code: "lt", country: "lt", name: "Lithuanian",             native: "Lietuvių"             },
  { code: "lv", country: "lv", name: "Latvian",                native: "Latviešu"             },
  { code: "mk", country: "mk", name: "Macedonian",             native: "Македонски"           },
  { code: "mn", country: "mn", name: "Mongolian",              native: "Монгол"               },
  { code: "ms", country: "my", name: "Malay",                  native: "Bahasa Melayu"        },
  { code: "my", country: "mm", name: "Burmese",                native: "မြန်မာ"               },
  { code: "nl", country: "nl", name: "Dutch",                  native: "Nederlands"           },
  { code: "no", country: "no", name: "Norwegian",              native: "Norsk"                },
  { code: "pl", country: "pl", name: "Polish",                 native: "Polski"               },
  { code: "pt", country: "br", name: "Portuguese",             native: "Português"            },
  { code: "ro", country: "ro", name: "Romanian",               native: "Română"               },
  { code: "ru", country: "ru", name: "Russian",                native: "Русский"              },
  { code: "sk", country: "sk", name: "Slovak",                 native: "Slovenčina"           },
  { code: "sl", country: "si", name: "Slovenian",              native: "Slovenščina"          },
  { code: "sq", country: "al", name: "Albanian",               native: "Shqip"                },
  { code: "sr", country: "rs", name: "Serbian",                native: "Српски"               },
  { code: "sv", country: "se", name: "Swedish",                native: "Svenska"              },
  { code: "sw", country: "ke", name: "Swahili",                native: "Kiswahili"            },
  { code: "tl", country: "ph", name: "Filipino",               native: "Filipino"             },
  { code: "tr", country: "tr", name: "Turkish",                native: "Türkçe"               },
  { code: "uk", country: "ua", name: "Ukrainian",              native: "Українська"           },
  { code: "ur", country: "pk", name: "Urdu",                   native: "اردو"                 },
  { code: "uz", country: "uz", name: "Uzbek",                  native: "Oʻzbek"               },
  { code: "vi", country: "vn", name: "Vietnamese",             native: "Tiếng Việt"           },
  { code: "zh",    country: "cn", name: "Chinese (Simplified)",   native: "中文（简体）"      },
  { code: "zh-TW", country: "tw", name: "Chinese (Traditional)",  native: "繁體中文"          },
];

function FlagImg({ country, size = 48 }: { country: string; size?: number }) {
  const cdnSize = size <= 30 ? 40 : 80;
  return (
    <img
      src={`https://flagcdn.com/w${cdnSize}/${country}.png`}
      width={size}
      height={Math.round(size / 1.5)}
      alt={country}
      style={{ borderRadius: 6, objectFit: "cover", display: "block" }}
    />
  );
}

function GlobeIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: "var(--accent-2)" }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

const STORAGE_KEY = "spectrum-lang";

export function LanguagePopup() {
  const { setLang } = useLang();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [search, setSearch] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeModal = () => {
    setClosing(true);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setVisible(false);
      setClosing(false);
      setShowOther(false);
      setSearch("");
    }, 280);
  };

  function triggerGoogleTranslate(langCode: string) {
    // Map our codes → Google Translate codes
    const GT_CODE_MAP: Record<string, string> = {
      "zh":    "zh-CN",
      "zh-TW": "zh-TW",
      "he":    "iw",   // Google uses "iw" for Hebrew
    };
    const gtCode = GT_CODE_MAP[langCode] ?? langCode;

    const tryTranslate = () => {
      const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
      if (combo) {
        combo.value = gtCode;
        combo.dispatchEvent(new Event("change"));
        return true;
      }
      return false;
    };
    if (!tryTranslate()) {
      let attempts = 0;
      const interval = setInterval(() => {
        if (tryTranslate() || attempts++ > 20) clearInterval(interval);
      }, 200);
    }
  }

  useEffect(() => {
    const handler = () => { setClosing(false); setVisible(true); };
    window.addEventListener("spectrum:show-lang", handler);
    return () => window.removeEventListener("spectrum:show-lang", handler);
  }, []);

  useEffect(() => {
    // Inject Google Translate script once
    if (!document.getElementById("gt-init-fn")) {
      const initScript = document.createElement("script");
      initScript.id = "gt-init-fn";
      initScript.textContent = `
        function googleTranslateElementInit() {
          new google.translate.TranslateElement(
            { pageLanguage: 'en', autoDisplay: false },
            'google_translate_element'
          );
        }
      `;
      document.head.appendChild(initScript);
    }

    if (!document.getElementById("gt-widget-script")) {
      const widgetScript = document.createElement("script");
      widgetScript.id = "gt-widget-script";
      widgetScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      widgetScript.async = true;
      document.head.appendChild(widgetScript);
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // No auto-popup — default to English, user switches manually via the language button.
    } else {
      document.documentElement.lang = saved;
      if (saved === "th") {
        setLang("th");
      } else if (saved === "zh") {
        setLang("zh");
      } else if (saved === "vi") {
        setLang("vi");
      } else if (saved === "pt") {
        setLang("pt");
      } else if (saved !== "en") {
        setTimeout(() => triggerGoogleTranslate(saved), 1500); // other → Google Translate
      }
    }
  }, [setLang]);

  function select(code: string) {
    localStorage.setItem(STORAGE_KEY, code);
    document.documentElement.lang = code;
    closeModal();

    if (code === "th") {
      setLang("th");
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${location.hostname}`;
    } else if (code === "zh") {
      setLang("zh");
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${location.hostname}`;
    } else if (code === "vi") {
      setLang("vi");
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${location.hostname}`;
    } else if (code === "pt") {
      setLang("pt");
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${location.hostname}`;
    } else if (code === "en") {
      setLang("en");
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${location.hostname}`;
    } else {
      // Other → Google Translate
      triggerGoogleTranslate(code);
    }
  }

  if (!visible) return null;

  const filtered = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.native.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={`lang-overlay${closing ? " closing" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          localStorage.setItem(STORAGE_KEY, "en");
          closeModal();
        }
      }}
    >
      <div className={`lang-modal${closing ? " closing" : ""}`}>
        {!showOther ? (
          <>
            <button className="lang-close" aria-label="Close" onClick={() => { localStorage.setItem(STORAGE_KEY, "en"); closeModal(); }}>✕</button>
            <p className="lang-eyebrow">Spectrum Cheat</p>
            <h2 className="lang-title">Select Language</h2>
            <p className="lang-sub">เลือกภาษาของเว็บ</p>

            <div className="lang-options">
              <button className="lang-option" onClick={() => select("th")}>
                <FlagImg country="th" />
                <span className="lang-name">ภาษาไทย</span>
                <span className="lang-native">Thailand</span>
              </button>
              <button className="lang-option" onClick={() => select("en")}>
                <FlagImg country="us" />
                <span className="lang-name">English</span>
                <span className="lang-native">United States</span>
              </button>
              <button className="lang-option" onClick={() => select("zh")}>
                <FlagImg country="cn" />
                <span className="lang-name">中文（简体）</span>
                <span className="lang-native">China</span>
              </button>
              <button className="lang-option" onClick={() => select("vi")}>
                <FlagImg country="vn" />
                <span className="lang-name">Tiếng Việt</span>
                <span className="lang-native">Vietnam</span>
              </button>
              <button className="lang-option" onClick={() => select("pt")}>
                <FlagImg country="br" />
                <span className="lang-name">Português</span>
                <span className="lang-native">Brasil</span>
              </button>
              <button className="lang-option lang-option--other" onClick={() => setShowOther(true)}>
                <GlobeIcon />
                <span className="lang-name">Other</span>
                <span className="lang-native">More languages</span>
              </button>
            </div>

            <p className="lang-hint">Other languages are translated by Spectrum Assistant</p>
          </>
        ) : (
          <>
            <button className="lang-back" onClick={() => { setShowOther(false); setSearch(""); }}>
              ← Back
            </button>
            <h2 className="lang-title" style={{ marginBottom: "6px" }}>Other Language</h2>
            <p className="lang-sub" style={{ marginBottom: "16px" }}>Search for your language</p>

            <input
              className="lang-search"
              placeholder="Search language or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />

            <div className="lang-list">
              {filtered.length === 0 ? (
                <p className="lang-no-result">No results found</p>
              ) : (
                filtered.map((lang) => (
                  <button key={lang.code} className="lang-list-item" onClick={() => select(lang.code)}>
                    <FlagImg country={lang.country} size={28} />
                    <span className="lang-list-name">{lang.name}</span>
                    <span className="lang-list-native">{lang.native}</span>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
