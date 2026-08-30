import type { Metadata } from "next";
import { DM_Mono, Instrument_Serif, Syne } from "next/font/google";
import "./globals.css";
import { LanguagePopup } from "./_components/language-popup";
import { LangProvider } from "./_i18n/context";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-display",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://zpu.lol"),
  title: {
    default: "ZPU (xZPUHigh) — Founder, Developer & Creator",
    template: "%s | ZPU",
  },
  description:
    "Official website of ZPU (xZPUHigh) — founder, developer, and entrepreneur building digital products, web experiences, and online businesses.",
  keywords: [
    "ZPU",
    "xZPUHigh",
    "zpu.lol",
    "Who is ZPU",
    "ใครคือ ZPU",
    "ZPU Chanon",
    "ZPU portfolio",
    "ZPU website",
    "ZPU developer",
    "ZPU founder",
    "Spectrum Cheat founder",
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/images/Spectrum Icon.png",
  },
  alternates: {
    canonical: "https://zpu.lol",
  },
  openGraph: {
    type: "profile",
    url: "https://zpu.lol",
    siteName: "ZPU",
    title: "ZPU (xZPUHigh) — Founder, Developer & Creator",
    description:
      "Meet ZPU (xZPUHigh) — founder, developer, and entrepreneur building digital products and online businesses.",
    images: [
      {
        url: "/images/benner_1.png",
        width: 6144,
        height: 1015,
        alt: "ZPU — Founder & Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZPU (xZPUHigh) — Founder, Developer & Creator",
    description:
      "Meet ZPU (xZPUHigh) — founder, developer, and entrepreneur building digital products and online businesses.",
    images: ["/images/benner_1.png"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "ZPU",
  alternateName: ["xZPUHigh", "Chanon", "Non"],
  url: "https://zpu.lol",
  image: "https://zpu.lol/images/ZPU.jpg",
  jobTitle: "Founder & Developer",
  description:
    "ZPU (xZPUHigh) is a founder, developer, and entrepreneur building digital products and online businesses.",
  nationality: "Thai",
  homeLocation: { "@type": "Place", name: "Bangkok, Thailand" },
  sameAs: [
    "https://www.youtube.com/@xZPUHigh",
    "https://www.tiktok.com/@xzpuhigh",
    "https://www.tiktok.com/@xzpuhighreal",
    "https://www.instagram.com/zpu.mnn2",
    "https://www.facebook.com/zpu.mnn2",
    "https://discord.gg/C3MpUNwsDU",
    "https://github.com/Spectrum-Cheat",
    "https://spectrumcheat.com",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmMono.variable} ${instrumentSerif.variable}`}
    >
      <body>
        <script
          id="person-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <LangProvider initialLang="en">
          <LanguagePopup />
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
