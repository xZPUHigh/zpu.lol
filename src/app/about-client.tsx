"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "./_i18n/context";
import type { TranslationKey } from "./_i18n/translations";

import { ZpuFooter, ZpuTopbar, MusicPlayer, useScrollReveal, useScrollSpy, useZpuTheme } from "./_shared/chrome";
import { SectionHead } from "./_shared/tiles";
import { BIRTHDAY_18, FAV_TOPICS, FAV_TOTAL, ZPU, fmtPrice, si } from "./_shared/data";

// Section order for the top nav, the scroll-spy and the footer's Explore column.
const NAV_IDS = ["zpu-top", "zpu-facts", "zpu-interests", "zpu-skills", "zpu-items", "zpu-works", "zpu-connect"];
const NAV_LABEL_KEYS: TranslationKey[] = [
  "zpuNavHome", "zpuNavAbout", "zpuNavInterests", "zpuNavSkills",
  "zpuNavItems", "zpuNavProjects", "zpuNavContact",
];

function LiveClock({ timezone }: { timezone: string }) {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const tick = () => {
      const t = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date());
      setTime(t);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timezone]);
  return <>{time}</>;
}

function LiveDate({ timezone }: { timezone: string }) {
  const [date, setDate] = useState("");
  useEffect(() => {
    const tick = () => {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
        day: "numeric",
        month: "short",
      }).formatToParts(new Date());
      const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
      setDate(`${get("weekday")}, ${get("day")} ${get("month")}`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [timezone]);
  return <>{date}</>;
}

// A live "status" that picks a random thing ZPU is into โ€” reshuffled every refresh.
// All 77 Thai provinces โ€” "Living in" picks a fresh one on every refresh.
const TH_PROVINCES = [
  "Chiang Mai, Thailand", "Chiang Rai, Thailand", "Lampang, Thailand", "Lamphun, Thailand",
  "Mae Hong Son, Thailand", "Nan, Thailand", "Phayao, Thailand", "Phrae, Thailand",
  "Uttaradit, Thailand", "Sukhothai, Thailand", "Tak, Thailand", "Kamphaeng Phet, Thailand",
  "Phitsanulok, Thailand", "Phichit, Thailand", "Phetchabun, Thailand", "Nakhon Sawan, Thailand",
  "Uthai Thani, Thailand", "Bangkok, Thailand", "Nonthaburi, Thailand", "Pathum Thani, Thailand",
  "Phra Nakhon Si Ayutthaya, Thailand", "Ang Thong, Thailand", "Lopburi, Thailand", "Sing Buri, Thailand",
  "Chai Nat, Thailand", "Saraburi, Thailand", "Nakhon Nayok, Thailand", "Suphan Buri, Thailand",
  "Nakhon Pathom, Thailand", "Samut Prakan, Thailand", "Samut Sakhon, Thailand", "Samut Songkhram, Thailand",
  "Phetchaburi, Thailand", "Prachuap Khiri Khan, Thailand", "Kanchanaburi, Thailand", "Ratchaburi, Thailand",
  "Chachoengsao, Thailand", "Prachinburi, Thailand", "Sa Kaeo, Thailand", "Chumphon, Thailand",
  "Ranong, Thailand", "Surat Thani, Thailand", "Nakhon Si Thammarat, Thailand", "Krabi, Thailand",
  "Phang Nga, Thailand", "Phuket, Thailand", "Trang, Thailand", "Phatthalung, Thailand",
  "Satun, Thailand", "Songkhla, Thailand", "Pattani, Thailand", "Yala, Thailand", "Narathiwat, Thailand",
];

// Quote card under "Facts About Me" โ€” shows one quote in the currently
// selected site language, rotating on its own.
const QUOTES: Record<"en" | "th" | "zh" | "vi" | "pt", string>[] = [
  { th: "เธเธเน€เธฃเธดเนเธก เนเธกเนเธเธฐเธขเธฑเธเนเธกเนเธเธฃเนเธญเธก", en: "Start before you're ready.", zh: "ๅณไฝฟ่ฟๆฒกๅๅคๅฅฝ๏ผไน่ฆๅผ€ๅงใ€", vi: "Hรฃy bแบฏt ฤ‘แบงu dรน chฦฐa sแบตn sร ng.", pt: "Comece mesmo sem estar pronto." },
  { th: "เธ—เธณเนเธเธ—เธฑเนเธเธ—เธตเนเธเธฅเธฑเธง เธ—เธณเนเธเธ—เธฑเนเธเธ—เธตเนเน€เธซเธเธทเนเธญเธข เนเธ•เนเธเธเธ—เธณเธ•เนเธญ", en: "Do it scared, do it tired, just do it anyway.", zh: "ๅฎณๆ€•ไนๅ๏ผ็–ฒๆซไนๅ๏ผๆ— ่ฎบๅฆไฝ•้ฝๅปๅใ€", vi: "Hรฃy lร m dรน sแปฃ, dรน mแปt, cแปฉ lร m thรดi.", pt: "Faรงa com medo, faรงa cansado, mas faรงa mesmo assim." },
  { th: "เธเธงเธฒเธกเธชเธกเนเธณเน€เธชเธกเธญเธเธเธฐเธเธฃเธชเธงเธฃเธฃเธเน", en: "Consistency beats talent.", zh: "ๅๆ่่ฟๅคฉ่ตใ€", vi: "Sแปฑ kiรชn trรฌ vฦฐแปฃt qua tร i nฤng.", pt: "A consistรชncia vence o talento." },
  { th: "เธเธงเธฒเธกเธเนเธฒเธงเธซเธเนเธฒเน€เธฅเนเธ เน เธขเธฑเธเธ”เธตเธเธงเนเธฒเนเธกเนเน€เธฃเธดเนเธกเน€เธฅเธข", en: "Small progress is still progress.", zh: "ๅฐๅฐ็่ฟๆญฅไนๆฏ่ฟๆญฅใ€", vi: "Tiแบฟn bแป nhแป vแบซn lร  tiแบฟn bแป.", pt: "Pequenos progressos ainda sรฃo progresso." },
  { th: "เธญเธขเนเธฒเธซเธขเธธเธ”เน€เธเธตเธขเธเน€เธเธฃเธฒเธฐเธกเธฑเธเธขเธฒเธ", en: "Don't stop because it's hard.", zh: "ไธ่ฆๅ ไธบๅฐ้พ่€ๅๆญขใ€", vi: "ฤแปซng dแปซng lแบกi chแป vรฌ khรณ.", pt: "Nรฃo pare sรณ porque รฉ difรญcil." },
  { th: "เธ—เธธเธเธงเธฑเธเธ—เธตเนเธเธธเธ“เธฅเธเธกเธทเธญ เธเธธเธ“เธเธณเธฅเธฑเธเน€เธเนเธฒเนเธเธฅเนเธเธงเธฒเธกเธเธฑเธ", en: "Every day you show up, you're closer to your dream.", zh: "ๆฏไธ€ๅคฉๅๆ๏ผ้ฝไผๆดๆฅ่ฟ‘ๆขฆๆณใ€", vi: "Mแป—i ngร y cแป‘ gแบฏng lร  mแปt ngร y gแบงn hฦกn vแปi ฦฐแปc mฦก.", pt: "Cada dia que vocรช aparece รฉ um dia mais perto do seu sonho." },
  { th: "เธเธงเธฒเธกเธชเธณเน€เธฃเนเธเธชเธฃเนเธฒเธเธเธฒเธเธงเธดเธเธฑเธข เนเธกเนเนเธเนเนเธฃเธเธเธฑเธเธ”เธฒเธฅเนเธ", en: "Success is built by discipline, not motivation.", zh: "ๆๅๆฅ่ช่ชๅพ๏ผ่€ไธๆฏไธ€ๆ—ถ็ๅจๅใ€", vi: "Thร nh cรดng ฤ‘แบฟn tแปซ kแปท luแบญt, khรดng phแบฃi cแบฃm hแปฉng.", pt: "O sucesso รฉ construรญdo pela disciplina, nรฃo pela motivaรงรฃo." },
  { th: "เธญเธขเนเธฒเน€เธเธฃเธตเธขเธเน€เธ—เธตเธขเธเธ•เธฑเธงเน€เธญเธเธเธฑเธเธเธเธญเธทเนเธ", en: "Compare yourself only to who you were yesterday.", zh: "ๅชๅ’ๆจๅคฉ็่ชๅทฑๆฏ”่พใ€", vi: "Chแป so sรกnh vแปi chรญnh mรฌnh cแปงa hรดm qua.", pt: "Compare-se apenas com quem vocรช era ontem." },
  { th: "เธเธงเธฒเธกเธญเธ”เธ—เธเธกเธฑเธเนเธ”เนเธฃเธฑเธเธเธฅเธ•เธญเธเนเธ—เธเน€เธชเธกเธญ", en: "Patience always pays off.", zh: "่€ๅฟ็ปไผๅพ—ๅฐๅๆฅใ€", vi: "Kiรชn nhแบซn luรดn ฤ‘ฦฐแปฃc ฤ‘แปn ฤ‘รกp.", pt: "A paciรชncia sempre recompensa." },
  { th: "เธเธเน€เธเนเธเธเธเธ—เธตเนเธ•เธฑเธงเน€เธญเธเนเธเธงเธฑเธขเน€เธ”เนเธเธเธฐเธ เธนเธกเธดเนเธ", en: "Become someone your younger self would admire.", zh: "ๆไธบๅฐๆ—ถๅ€็่ชๅทฑไผ้ชๅฒ็ไบบใ€", vi: "Hรฃy trแป thร nh ngฦฐแปi mร  bแบฃn thรขn ngร y bรฉ sแบฝ tแปฑ hร o.", pt: "Torne-se alguรฉm que seu eu mais jovem admiraria." },
  { th: "เธเธงเธฒเธกเธเธฅเนเธฒเธเธทเธญเธเธฒเธฃเธฅเธเธกเธทเธญ เนเธกเนเธเธฐเนเธกเนเธกเธฑเนเธเนเธ", en: "Courage is acting without certainty.", zh: "ๅๆ•ขๆฏๅจๆฒกๆๆๆกๆ—ถไพ็ถ่กๅจใ€", vi: "Dลฉng cแบฃm lร  hร nh ฤ‘แปng dรน chฦฐa chแบฏc chแบฏn.", pt: "Coragem รฉ agir mesmo sem certeza." },
  { th: "เธเธเธชเธฃเนเธฒเธเธเธตเธงเธดเธ•เธ—เธตเนเธเธธเธ“เนเธกเนเธ•เนเธญเธเธซเธเธตเธเธฒเธเธกเธฑเธ", en: "Build a life you don't need to escape from.", zh: "ๅ้€ ไธ€ไธชๆ— ้€้€็ฆป็ไบบ็”ใ€", vi: "Xรขy dแปฑng cuแปc sแป‘ng mร  bแบกn khรดng muแป‘n trแป‘n khแปi.", pt: "Construa uma vida da qual vocรช nรฃo precise fugir." },
  { th: "เธเธงเธฒเธกเธเธฑเธเธเธฐเนเธกเนเธกเธตเธงเธฑเธเธ—เธณเธเธฒเธ เธ–เนเธฒเธเธธเธ“เนเธกเนเธฅเธเธกเธทเธญ", en: "Dreams don't work unless you do.", zh: "ๆขฆๆณไธไผ่ชๅทฑๅฎ็ฐใ€", vi: "ฦฏแปc mฦก sแบฝ khรดng tแปฑ thร nh hiแปn thแปฑc.", pt: "Sonhos nรฃo funcionam sem vocรช." },
  { th: "เธ—เธณเธงเธฑเธเธเธตเนเนเธซเนเธ”เธตเธเธงเนเธฒเน€เธกเธทเนเธญเธงเธฒเธ", en: "Be better than yesterday.", zh: "ไปๅคฉๆฏ”ๆจๅคฉๆดๅฅฝใ€", vi: "Hรดm nay tแป‘t hฦกn hรดm qua.", pt: "Seja melhor do que ontem." },
  { th: "เธเธงเธฒเธกเธชเธณเน€เธฃเนเธเธเธทเธญเธเธฅเธฅเธฑเธเธเนเธเธญเธเธเธฒเธฃเนเธกเนเธขเธญเธกเนเธเน", en: "Success is the reward for not giving up.", zh: "ๆๅๆฏไธๆ”พๅผ็ๅๆฅใ€", vi: "Thร nh cรดng lร  phแบงn thฦฐแปng cแปงa sแปฑ khรดng bแป cuแปc.", pt: "O sucesso รฉ a recompensa por nรฃo desistir." },
  { th: "เธเธงเธฒเธกเน€เธฃเนเธงเนเธกเนเธชเธณเธเธฑเธ เธ–เนเธฒเธขเธฑเธเน€เธ”เธดเธเนเธเธเนเธฒเธเธซเธเนเธฒ", en: "It doesn't matter how fast you go, as long as you don't stop.", zh: "่ตฐๅพ—ๆ…ขๆฒกๅ…ณ็ณป๏ผๅช่ฆไธๅไธใ€", vi: "ฤi chแบญm khรดng sao, miแป…n lร  ฤ‘แปซng dแปซng lแบกi.", pt: "Nรฃo importa a velocidade, desde que vocรช continue." },
  { th: "เธญเธขเนเธฒเธฃเธญเน€เธงเธฅเธฒเธ—เธตเนเธชเธกเธเธนเธฃเธ“เนเนเธเธ", en: "Don't wait for perfect timing.", zh: "ไธ่ฆ็ญๅพ…ๅฎ็พๆ—ถๆบใ€", vi: "ฤแปซng chแป thแปi ฤ‘iแปm hoร n hแบฃo.", pt: "Nรฃo espere o momento perfeito." },
  { th: "เธฅเธเธกเธทเธญเธเนเธญเธ เนเธฅเนเธงเธเนเธญเธขเน€เธเนเธเธเธถเนเธเธฃเธฐเธซเธงเนเธฒเธเธ—เธฒเธ", en: "Learn by doing.", zh: "ๅจๅฎ่ทตไธญๆ้•ฟใ€", vi: "Hแปc bแบฑng cรกch bแบฏt ฤ‘แบงu lร m.", pt: "Aprenda fazendo." },
  { th: "เธเธงเธฒเธกเธเธขเธฒเธขเธฒเธกเนเธกเนเธกเธตเธงเธฑเธเธชเธนเธเน€เธเธฅเนเธฒ", en: "Effort is never wasted.", zh: "ๅชๅๆฐธ่ฟไธไผ็ฝ่ดนใ€", vi: "Mแปi nแป— lแปฑc ฤ‘แปu cรณ giรก trแป.", pt: "Nenhum esforรงo รฉ em vรฃo." },
  { th: "เธญเธขเนเธฒเธเธฅเนเธญเธขเนเธซเนเธเธงเธฒเธกเธเธฅเธฑเธงเธเธณเธซเธเธ”เธเธตเธงเธดเธ•เธเธธเธ“", en: "Don't let fear decide your future.", zh: "ไธ่ฆ่ฎฉๆๆงๅณๅฎไฝ ็ๆชๆฅใ€", vi: "ฤแปซng ฤ‘แป nแป—i sแปฃ quyแบฟt ฤ‘แปnh tฦฐฦกng lai cแปงa bแบกn.", pt: "Nรฃo deixe o medo decidir seu futuro." },
  { th: "เธญเธขเนเธฒเธเธฅเธฑเธงเธเธฒเธฃเน€เธฃเธดเนเธกเนเธซเธกเน", en: "Never be afraid to start over.", zh: "ๆฐธ่ฟไธ่ฆๅฎณๆ€•้ๆ–ฐๅผ€ๅงใ€", vi: "ฤแปซng bao giแป sแปฃ bแบฏt ฤ‘แบงu lแบกi.", pt: "Nunca tenha medo de recomeรงar." },
  { th: "เธ—เธธเธเธเธงเธฒเธกเธชเธณเน€เธฃเนเธเน€เธเธขเน€เธเนเธเนเธเนเธเธงเธฒเธกเธเธดเธ”", en: "Every achievement was once just an idea.", zh: "ๆฏไธชๆๅฐฑ้ฝๆพๅชๆฏไธ€ไธชๆณๆณ•ใ€", vi: "Mแปi thร nh tแปฑu tแปซng chแป lร  mแปt รฝ tฦฐแปng.", pt: "Toda conquista jรก foi apenas uma ideia." },
  { th: "เธเธฑเธขเธเธเธฐเธ—เธตเนเนเธ—เนเธเธฃเธดเธเธเธทเธญเธเธฒเธฃเนเธกเนเธซเธขเธธเธ”", en: "The real victory is refusing to quit.", zh: "็ๆญฃ็่ๅฉๆฏไธๆ”พๅผใ€", vi: "Chiแบฟn thแบฏng thแบญt sแปฑ lร  khรดng bแป cuแปc.", pt: "A verdadeira vitรณria รฉ nรฃo desistir." },
  { th: "เธเธงเธฒเธกเน€เธเธตเธขเธเธเธทเธญเธ—เธตเนเธ—เธตเนเธเธฒเธฃเน€เธ•เธดเธเนเธ•เน€เธเธดเธ”เธเธถเนเธ", en: "Growth happens in silence.", zh: "ๆ้•ฟๅ‘็”ๅจๅฎ้ไนไธญใ€", vi: "Sแปฑ trฦฐแปng thร nh diแป…n ra trong im lแบทng.", pt: "O crescimento acontece em silรชncio." },
  { th: 'เธญเธขเนเธฒเธเธฅเนเธญเธขเนเธซเนเธเธณเธงเนเธฒ "เธชเธฑเธเธงเธฑเธ" เธเธฅเธฒเธขเน€เธเนเธ "เนเธกเนเน€เธเธข"', en: 'Don\'t let "someday" become "never."', zh: "ๅซ่ฎฉโ€ๆ€ปๆไธ€ๅคฉโ€ๅๆโ€ๆฐธ่ฟไธไผโ€ใ€", vi: 'ฤแปซng ฤ‘แป "mแปt ngร y nร o ฤ‘รณ" trแป thร nh "khรดng bao giแป".', pt: 'Nรฃo deixe o "algum dia" virar "nunca".' },
  { th: "เธ—เธธเธเธงเธฑเธเธ—เธตเนเธขเธฒเธ เธเธณเธฅเธฑเธเธชเธฃเนเธฒเธเธเธธเธ“เนเธซเนเนเธเนเธเนเธเธฃเนเธเธเธถเนเธ", en: "Hard days build strong people.", zh: "่ฐ้พ็ๆ—ฅๅญ้€ ๅฐฑๅๅผบ็ไบบใ€", vi: "Nhแปฏng ngร y khรณ khฤn tแบกo nรชn con ngฦฐแปi mแบกnh mแบฝ.", pt: "Dias difรญceis formam pessoas fortes." },
  { th: "เธญเธขเนเธฒเธซเธขเธธเธ”เน€เธฃเธตเธขเธเธฃเธนเน", en: "Never stop learning.", zh: "ๆฐธ่ฟไธ่ฆๅๆญขๅญฆไน ใ€", vi: "ฤแปซng bao giแป ngแปซng hแปc hแปi.", pt: "Nunca pare de aprender." },
  { th: "เธ—เธณเธชเธดเนเธเน€เธฅเนเธ เน เนเธซเนเธ”เธต เนเธฅเนเธงเธชเธดเนเธเนเธซเธเนเธเธฐเธ•เธฒเธกเธกเธฒ", en: "Master the small things first.", zh: "ๅ…ๅๅฅฝๅฐไบ๏ผๅคงไบ่ช็ถไผๆฅใ€", vi: "Hรฃy lร m tแป‘t nhแปฏng ฤ‘iแปu nhแป trฦฐแปc.", pt: "Domine as pequenas coisas primeiro." },
  { th: "เธญเธขเนเธฒเน€เธชเธตเธขเน€เธงเธฅเธฒเน€เธเนเธเธเธเธญเธทเนเธ", en: "Don't waste your life being someone else.", zh: "ไธ่ฆๆตช่ดน็”ๅ‘ฝๅปๆไธบๅซไบบใ€", vi: "ฤแปซng lรฃng phรญ cuแปc ฤ‘แปi ฤ‘แป trแป thร nh ngฦฐแปi khรกc.", pt: "Nรฃo desperdice sua vida sendo outra pessoa." },
  { th: "เธญเธเธฒเธเธ•เธชเธฃเนเธฒเธเธเธฒเธเธชเธดเนเธเธ—เธตเนเธเธธเธ“เธ—เธณเธงเธฑเธเธเธตเน", en: "Tomorrow is built by what you do today.", zh: "ๆๅคฉ็”ฑไปๅคฉ็่กๅจๅณๅฎใ€", vi: "Ngร y mai ฤ‘ฦฐแปฃc tแบกo nรชn tแปซ viแปc bแบกn lร m hรดm nay.", pt: "O amanhรฃ รฉ construรญdo pelo que vocรช faz hoje." },
  { th: "เธญเธขเนเธฒเธเธฅเนเธญเธขเนเธซเนเธเนเธญเธญเนเธฒเธเนเธซเธเนเธเธงเนเธฒเธเธงเธฒเธกเธเธฑเธ", en: "Don't let excuses become bigger than your dreams.", zh: "ไธ่ฆ่ฎฉๅ€ๅฃๆฏ”ๆขฆๆณๆดๅคงใ€", vi: "ฤแปซng ฤ‘แป lรฝ do lแปn hฦกn ฦฐแปc mฦก.", pt: "Nรฃo deixe as desculpas serem maiores que seus sonhos." },
  { th: "เธเธฒเธฃเธฅเธเธกเธทเธญเธเธทเธญเธเธธเธ”เน€เธฃเธดเนเธกเธ•เนเธเธเธญเธเธ—เธธเธเธญเธขเนเธฒเธ", en: "Action is where everything begins.", zh: "ไธ€ๅ้ฝๅงไบ่กๅจใ€", vi: "Hร nh ฤ‘แปng lร  nฦกi mแปi thแปฉ bแบฏt ฤ‘แบงu.", pt: "A aรงรฃo รฉ onde tudo comeรงa." },
  { th: "เนเธกเนเธกเธตเธ—เธฒเธเธฅเธฑเธ”เธชเธนเนเธเธงเธฒเธกเธขเธดเนเธเนเธซเธเน", en: "There are no shortcuts to greatness.", zh: "้€ๅพ€ๅ“่ถๆฒกๆๆทๅพใ€", vi: "Khรดng cรณ ฤ‘ฦฐแปng tแบฏt ฤ‘แบฟn sแปฑ vฤฉ ฤ‘แบกi.", pt: "Nรฃo hรก atalhos para a grandeza." },
  { th: "เธเธเธฐเธ•เธฑเธงเน€เธญเธเธ—เธธเธเธงเธฑเธ", en: "Win against yourself every day.", zh: "ๆฏๅคฉๆ่ๆจๅคฉ็่ชๅทฑใ€", vi: "Chiแบฟn thแบฏng chรญnh mรฌnh mแป—i ngร y.", pt: "Venรงa a si mesmo todos os dias." },
  { th: "เธเธเธ—เธณเนเธซเนเธ•เธฑเธงเน€เธญเธเธกเธตเธเนเธฒเธเธเนเธญเธเธฒเธชเธ•เนเธญเธเธ•เธฒเธกเธซเธฒ", en: "Become so valuable that opportunities find you.", zh: "่ฎฉ่ชๅทฑ่ถณๅคไผ็ง€๏ผๆบไผ่ช็ถไผๆฅใ€", vi: "Hรฃy trแป nรชn giรก trแป ฤ‘แป cฦก hแปi tแปฑ tรฌm ฤ‘แบฟn.", pt: "Torne-se tรฃo valioso que as oportunidades encontrem vocรช." },
  { th: "เธงเธดเธเธฑเธขเธเธฐเธเธฒเธเธธเธ“เนเธเนเธเธฅเธเธงเนเธฒเนเธฃเธเธเธนเธเนเธ", en: "Discipline will take you further than motivation.", zh: "่ชๅพๆฏ”ๅจๅๆดๅฏ้ ใ€", vi: "Kแปท luแบญt sแบฝ ฤ‘ฦฐa bแบกn ฤ‘i xa hฦกn cแบฃm hแปฉng.", pt: "A disciplina leva vocรช mais longe do que a motivaรงรฃo." },
  { th: "เธญเธขเนเธฒเธซเธขเธธเธ”เน€เธเธฃเธฒเธฐเธเธเธญเธทเนเธเนเธกเนเน€เธเธทเนเธญ", en: "Don't stop because others don't believe.", zh: "ไธ่ฆๅ ไธบๅซไบบไธ็ธไฟกๅฐฑๅไธใ€", vi: "ฤแปซng dแปซng lแบกi chแป vรฌ ngฦฐแปi khรกc khรดng tin.", pt: "Nรฃo pare porque os outros nรฃo acreditam." },
  { th: "เธเธงเธฒเธกเธฅเนเธกเน€เธซเธฅเธงเธเธทเธญเธเธ—เน€เธฃเธตเธขเธ เนเธกเนเนเธเนเธเธธเธ”เธเธ", en: "Failure is a lesson, not the end.", zh: "ๅคฑ่ดฅๆฏ่ฏพ็จ๏ผไธๆฏ็ป็นใ€", vi: "Thแบฅt bแบกi lร  bร i hแปc, khรดng phแบฃi kแบฟt thรบc.", pt: "O fracasso รฉ uma liรงรฃo, nรฃo um fim." },
  { th: "เธเธงเธฒเธกเธเธฑเธเธ•เนเธญเธเธเธฒเธฃเธเธฒเธฃเธฅเธเธกเธทเธญ เนเธกเนเนเธเนเนเธเนเธเธงเธฒเธกเธซเธงเธฑเธ", en: "Dreams need action, not wishes.", zh: "ๆขฆๆณ้€่ฆ่กๅจ๏ผ่€ไธๆฏๅนปๆณใ€", vi: "ฦฏแปc mฦก cแบงn hร nh ฤ‘แปng, khรดng chแป hy vแปng.", pt: "Sonhos precisam de aรงรฃo, nรฃo apenas de desejos." },
  { th: "เธ—เธธเธเธเนเธฒเธงเน€เธฅเนเธ เน เธกเธตเธเธงเธฒเธกเธซเธกเธฒเธข", en: "Every small step matters.", zh: "ๆฏไธ€ๆญฅ้ฝ็ฎ—ๆ•ฐใ€", vi: "Mแป—i bฦฐแปc nhแป ฤ‘แปu cรณ รฝ nghฤฉa.", pt: "Cada pequeno passo importa." },
  { th: "เธญเธขเนเธฒเธเธฅเธฑเธงเธ—เธตเนเธเธฐเน€เธ•เธดเธเนเธ•", en: "Don't be afraid to grow.", zh: "ไธ่ฆๅฎณๆ€•ๆ้•ฟใ€", vi: "ฤแปซng sแปฃ trฦฐแปng thร nh.", pt: "Nรฃo tenha medo de crescer." },
  { th: "เน€เธงเธฅเธฒเธเธฐเธเนเธฒเธเนเธเธญเธขเธนเนเธ”เธต เธเธเนเธเนเธกเธฑเธเนเธซเนเธเธธเนเธก", en: "Time will pass anyway, use it well.", zh: "ๆ—ถ้—ด็ปไผๆต้€๏ผๅฅฝๅฅฝๅฉ็”จๅฎใ€", vi: "Thแปi gian vแบซn sแบฝ trรดi, hรฃy tแบญn dแปฅng nรณ.", pt: "O tempo vai passar de qualquer forma, aproveite-o." },
  { th: "เธเธงเธฒเธกเธเธขเธฒเธขเธฒเธกเนเธเธงเธฑเธเธเธตเน เธเธทเธญเธเธงเธฒเธกเธ เธนเธกเธดเนเธเนเธเธงเธฑเธเธซเธเนเธฒ", en: "Today's effort becomes tomorrow's pride.", zh: "ไปๅคฉ็ๅชๅ๏ผๆฏๆๅคฉ็้ชๅฒใ€", vi: "Nแป— lแปฑc hรดm nay lร  niแปm tแปฑ hร o ngร y mai.", pt: "O esforรงo de hoje serรก o orgulho de amanhรฃ." },
  { th: "เธชเธดเนเธเธ—เธตเนเธขเธฒเธเธ—เธตเนเธชเธธเธ” เธกเธฑเธเธเธธเนเธกเธเนเธฒเธ—เธตเนเธชเธธเธ”", en: "The hardest things are often the most rewarding.", zh: "ๆ€้พ็ไบๆ…ๅพ€ๅพ€ๆ€ๅ€ผๅพ—ใ€", vi: "ฤiแปu khรณ nhแบฅt thฦฐแปng ฤ‘รกng giรก nhแบฅt.", pt: "As coisas mais difรญceis costumam valer mais a pena." },
  { th: "เธญเธขเนเธฒเนเธซเนเน€เธกเธทเนเธญเธงเธฒเธเธเธณเธซเธเธ”เธเธฃเธธเนเธเธเธตเน", en: "Don't let yesterday define tomorrow.", zh: "ไธ่ฆ่ฎฉๆจๅคฉๅณๅฎๆๅคฉใ€", vi: "ฤแปซng ฤ‘แป hรดm qua quyแบฟt ฤ‘แปnh ngร y mai.", pt: "Nรฃo deixe o ontem definir o amanhรฃ." },
  { th: "เธเธตเธงเธดเธ•เธ”เธตเธเธถเนเธเน€เธกเธทเนเธญเธเธธเธ“เธ”เธตเธเธถเนเธ", en: "Your life improves when you do.", zh: "ๅฝ“ไฝ ๅๅพ—ๆดๅฅฝ๏ผ็”ๆดปไนไผๅๅฅฝใ€", vi: "Cuแปc sแป‘ng tแป‘t hฦกn khi bแบกn tแป‘t hฦกn.", pt: "Sua vida melhora quando vocรช melhora." },
  { th: "เธเธงเธฒเธกเธเธฑเธเนเธซเธเน เน€เธฃเธดเนเธกเธเธฒเธเธเนเธฒเธงเน€เธฅเนเธ", en: "Big dreams begin with small steps.", zh: "ไผๅคง็ๆขฆๆณๅงไบๅฐๅฐ็ไธ€ๆญฅใ€", vi: "ฦฏแปc mฦก lแปn bแบฏt ฤ‘แบงu tแปซ nhแปฏng bฦฐแปc nhแป.", pt: "Grandes sonhos comeรงam com pequenos passos." },
  { th: "เธ—เธณเนเธซเนเธ•เธฑเธงเน€เธญเธเธ เธนเธกเธดเนเธ เนเธกเนเนเธเนเนเธเนเธเธเธญเธทเนเธ", en: "Make yourself proud, not just others.", zh: "่ฎฉ่ชๅทฑ้ชๅฒ๏ผ่€ไธไป…ๆฏๅซไบบใ€", vi: "Hรฃy khiแบฟn chรญnh mรฌnh tแปฑ hร o, khรดng chแป ngฦฐแปi khรกc.", pt: "Orgulhe a si mesmo, nรฃo apenas os outros." },
  { th: "เนเธกเนเธกเธตเนเธเธฃเธ—เธณเนเธ—เธเธเธธเธ“เนเธ”เน", en: "No one can do it for you.", zh: "ๆฒกๆไบบ่ฝๆฟไฝ ๅฎๆใ€", vi: "Khรดng ai cรณ thแป lร m thay bแบกn.", pt: "Ninguรฉm pode fazer isso por vocรช." },
  { th: "เธเธเน€เธเนเธเน€เธซเธ•เธธเธเธฅเธ—เธตเนเธ—เธณเนเธซเนเธ•เธฑเธงเน€เธญเธเธขเธดเนเธกเนเธ”เน", en: "Be your own reason to smile.", zh: "ๆไธบ่ฎฉ่ชๅทฑๅพฎ็ฌ‘็็็”ฑใ€", vi: "Hรฃy lร  lรฝ do ฤ‘แป chรญnh mรฌnh mแปm cฦฐแปi.", pt: "Seja o seu prรณprio motivo para sorrir." },
];

function QuoteCard() {
  const { t, lang } = useLang();
  const [idx, setIdx] = useState<number | null>(null);
  useEffect(() => {
    setIdx(Math.floor(Math.random() * QUOTES.length));
    const id = setInterval(() => {
      setIdx((prev) => {
        if (QUOTES.length <= 1) return prev;
        let next = Math.floor(Math.random() * QUOTES.length);
        while (next === prev) next = Math.floor(Math.random() * QUOTES.length);
        return next;
      });
    }, 15000);
    return () => clearInterval(id);
  }, []);
  if (idx === null) return null;
  const q = QUOTES[idx];
  const text = q[lang] || q.en;
  return (
    <section className="zpu-quote-sec">
      <div className="zpu-quote-card">
        <span className="zpu-quote-mark zpu-quote-mark--open" aria-hidden="true">&ldquo;</span>
        <span className="zpu-quote-mark zpu-quote-mark--close" aria-hidden="true">&rdquo;</span>
        <div className="zpu-quote-body">
          <span className="zpu-quote-title">{t("zpuQuoteOfDay")}</span>
          <p key={`${idx}-${lang}`} className="zpu-quote-text" lang={lang}>{text}</p>
        </div>
      </div>
    </section>
  );
}

// The heatmap is decorative โ€” there is no tracker behind it. Each day's count
// is hashed from its own date so the pattern is identical on the server and
// the client (no hydration mismatch) and stays put across reloads, instead of
// reshuffling on every visit the way Math.random() would.
function activityCount(dateKey: string): number {
  // FNV-1a โ€” mixes adjacent dates far better than a plain *31 rolling hash,
  // which left visible diagonal streaks across the grid.
  let h = 2166136261;
  for (let i = 0; i < dateKey.length; i++) {
    h ^= dateKey.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const r = (h % 100000) / 100000;
  // Weekends idle more often than weekdays, so the grid reads like a real
  // working rhythm rather than uniform noise.
  const weekday = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
  const idle = weekday === 0 || weekday === 6 ? 0.44 : 0.19;
  if (r < idle) return 0; // day off โ€” left uncoloured
  const t = (r - idle) / (1 - idle);
  return 1 + Math.floor(t * t * 17); // squared: mostly light days, rare spikes
}

function activityLevel(count: number): number {
  if (count <= 0) return 0;
  if (count <= 3) return 1;
  if (count <= 7) return 2;
  if (count <= 12) return 3;
  return 4;
}

const ACTIVITY_MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// GitHub-style contribution heatmap โ€” 12 months ร— 7 days, "Mon 'YY" labels
// above the week each month starts, count + legend below.
function ActivityOverview() {
  const { t } = useLang();
  const { weeks, monthLabels, total } = useMemo(() => {
    const WEEKS = 53;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - (WEEKS * 7 - 1));
    start.setDate(start.getDate() - start.getDay()); // back up to that week's Sunday

    const cols: { date: Date; key: string; level: number }[][] = [];
    const labels: { col: number; label: string }[] = [];
    const cursor = new Date(start);
    let lastMonth = -1;
    let total = 0;
    for (let w = 0; w < WEEKS; w++) {
      const col: { date: Date; key: string; level: number }[] = [];
      for (let d = 0; d < 7; d++) {
        // Local date parts โ€” toISOString() would shift to UTC and hand the
        // day before its neighbour's key in UTC+7.
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
        let level = -1;
        if (cursor >= start && cursor <= today) {
          const count = activityCount(key);
          level = activityLevel(count);
          total += count;
        }
        col.push({ date: new Date(cursor), key, level });
        cursor.setDate(cursor.getDate() + 1);
      }
      const firstOfWeek = col[0].date;
      // Months land ~4.3 columns apart, too tight for "Month, Year" โ€” use a
      // compact "Mon 'YY". The very first column is often a partial month
      // (grid starts mid-month), which would otherwise get its own label
      // just 1-2 columns before the next real one โ€” enforce a minimum gap.
      const MIN_LABEL_GAP = 3;
      const lastLabelCol = labels.length > 0 ? labels[labels.length - 1].col : -Infinity;
      if (firstOfWeek.getMonth() !== lastMonth && firstOfWeek <= today && w - lastLabelCol >= MIN_LABEL_GAP) {
        labels.push({ col: w, label: `${ACTIVITY_MONTH_NAMES[firstOfWeek.getMonth()]} '${String(firstOfWeek.getFullYear()).slice(-2)}` });
        lastMonth = firstOfWeek.getMonth();
      }
      cols.push(col);
    }
    return { weeks: cols, monthLabels: labels, total };
  }, []);

  return (
    <section className="zpu-activity-sec">
      <SectionHead title={t("zpuActivityTitle")} sub={t("zpuActivitySub")} />
      <div className="zpu-activity-card">
        <div className="zpu-activity-scroll">
          <div className="zpu-activity-grid" style={{ ["--weeks" as string]: weeks.length }}>
            <div className="zpu-activity-months">
              {monthLabels.map((m, i) => (
                <span key={`${m.col}-${i}`} style={{ gridColumnStart: m.col + 1 }}>{m.label}</span>
              ))}
            </div>
            <div className="zpu-activity-cells">
              {weeks.map((col, w) => (
                <div key={w} className="zpu-activity-col">
                  {col.map((cell) => (
                    <span
                      key={cell.key}
                      className={`zpu-activity-cell${cell.level >= 0 ? ` lv${cell.level}` : " empty"}`}
                      title={cell.level >= 0 ? cell.date.toDateString() : undefined}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="zpu-activity-foot">
          <span className="zpu-activity-total">{total.toLocaleString()} {t("zpuActivityCount")}</span>
          <div className="zpu-activity-legend">
            <span>{t("zpuActivityLess")}</span>
            <span className="zpu-activity-cell lv0" />
            <span className="zpu-activity-cell lv1" />
            <span className="zpu-activity-cell lv2" />
            <span className="zpu-activity-cell lv3" />
            <span className="zpu-activity-cell lv4" />
            <span>{t("zpuActivityMore")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function RandomFact() {
  const { t } = useLang();
  const [fact, setFact] = useState<{ icon: string; labelKey: TranslationKey; value: string } | null>(null);
  useEffect(() => {
    const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
    const pools: { icon: string; labelKey: TranslationKey; get: () => string }[] = [
      { icon: "๐“–", labelKey: "zpuFactReadingBook", get: () => pick(ZPU.favBooks).name },
      { icon: "๐ง", labelKey: "zpuFactListening", get: () => { const a = pick(ZPU.favArtists); return `${pick(a.songs)} ยท ${a.name}`; } },
      { icon: "๐ฎ", labelKey: "zpuFactPlaying", get: () => pick(ZPU.favGames).name },
      { icon: "๐ฌ", labelKey: "zpuFactWatchingMovie", get: () => pick(ZPU.favMovies).name },
      { icon: "๐ฟ", labelKey: "zpuFactWatchingAnime", get: () => pick(ZPU.favAnime).name },
      { icon: "๐“บ", labelKey: "zpuFactWatchingSeries", get: () => pick(ZPU.favSeries).name },
      { icon: "๐“•", labelKey: "zpuFactReadingManga", get: () => pick(ZPU.favManga).name },
    ];
    const p = pick(pools);
    setFact({ icon: p.icon, labelKey: p.labelKey, value: p.get() });
  }, []);
  if (!fact) return null;
  return (
    <div className="zpu-bn-fact">
      <span className="zpu-bn-fact-ico" aria-hidden="true">{fact.icon}</span>
      <span className="zpu-bn-fact-body">
        <span className="zpu-bn-fact-label">{t(fact.labelKey)}</span>
        <span className="zpu-bn-fact-value">{fact.value}</span>
      </span>
    </div>
  );
}

const SI_PLATFORM: Record<string, string> = {
  youtube: si("youtube", "FF0000"),
  tiktok: si("tiktok", "white"),
  discord: si("discord", "5865F2"),
  facebook: si("facebook", "1877F2"),
  instagram: si("instagram", "E4405F"),
  steam: si("steam", "66C0F4"),
  github: si("github", "white"),
};

function PlatformIcon({ platform }: { platform: "spectrum" | "youtube" | "tiktok" | "discord" | "facebook" | "instagram" | "steam" | "github" }) {
  if (SI_PLATFORM[platform]) {
    return (
      <span className="zpu-current-icon">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SI_PLATFORM[platform]} alt={platform} style={{ width: 16, height: 16 }} />
      </span>
    );
  }
  if (platform === "discord") {
    return (
      <span className="zpu-current-icon" style={{ color: "#5865F2" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.25.5a14.6 14.6 0 0 1 4.3 2.2 13.9 13.9 0 0 0-11 0A14.6 14.6 0 0 1 12.85 3.5L12.6 3a19.8 19.8 0 0 0-4.9 1.4C4.6 9 3.8 13.5 4.2 17.9A19.9 19.9 0 0 0 10.2 21l.6-1c-1-.3-1.9-.7-2.7-1.2.2-.2.4-.3.6-.5a14.2 14.2 0 0 0 12.2 0c.2.2.4.3.6.5-.8.5-1.7.9-2.7 1.2l.6 1a19.9 19.9 0 0 0 6-3.1c.5-5-.8-9.5-3.5-13.5zM9.5 15.3c-1 0-1.7-.9-1.7-1.9s.8-1.9 1.7-1.9 1.8.9 1.7 1.9c0 1-.8 1.9-1.7 1.9zm5 0c-1 0-1.7-.9-1.7-1.9s.8-1.9 1.7-1.9 1.8.9 1.7 1.9c0 1-.8 1.9-1.7 1.9z" />
        </svg>
      </span>
    );
  }
  if (platform === "youtube") {
    return (
      <span className="zpu-current-icon" style={{ color: "#ff0033" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6z" />
        </svg>
      </span>
    );
  }
  if (platform === "tiktok") {
    return (
      <span className="zpu-current-icon" style={{ color: "#fff" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      </span>
    );
  }
  return (
    <span className="zpu-current-icon zpu-current-icon--img">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/Spectrum Icon.png" alt="Spectrum" />
    </span>
  );
}

function FactIcon({ k }: { k: string }) {
  const p = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (k) {
    case "zpuTinyNickname":
      return <svg {...p}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>;
    case "zpuTinyStatus":
      return <svg {...p}><path d="M13 2 3 14h9l-1 8 10-12h-9z" /></svg>;
    case "zpuFactsPassions":
      return <svg {...p}><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /></svg>;
    case "zpuFactsChasing":
      return <svg {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></svg>;
    case "zpuFactsLiving":
      return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
    case "zpuFactsTimezone":
      return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /><path d="M2 12h3M19 12h3" /></svg>;
    case "zpuFactsStyle":
      return <svg {...p}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" /></svg>;
    case "zpuFactsKnown":
      return <svg {...p}><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></svg>;
    case "zpuFactsAge":
      return <svg {...p}><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" /><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" /><path d="M2 21h20" /><path d="M7 8v2M12 8v2M17 8v2M7 4h.01M12 4h.01M17 4h.01" /></svg>;
    default:
      return <svg {...p}><circle cx="12" cy="12" r="10" /></svg>;
  }
}

// Facts that get a full-width card (long, listy values).
const FACT_WIDE = new Set(["zpuFactsPassions"]);

// Section header โ€” pulls the trailing emoji off the title to use as a left icon,
// with the title + a short subtitle stacked beside it.
// Horizontal rail that auto-scrolls (looping seamlessly over duplicated
// content) yet can be grabbed and dragged with the mouse. Auto and manual both
// drive scrollLeft, so they blend: dragging/hover pauses the drift, and it
// resumes shortly after you let go. Vertical wheel maps to horizontal too.
function DragScroll({
  children,
  className = "",
  auto = true,
  speed = 0.18,
}: {
  children: React.ReactNode;
  className?: string;
  auto?: boolean;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // `pos` is a float accumulator: scrollLeft rounds to integers, so sub-pixel
  // auto-scroll speeds would otherwise stall. We drive scrollLeft from pos.
  const st = useRef({ down: false, moved: false, startX: 0, startLeft: 0, resumeAt: 0, hover: false, pos: 0 });

  // Keep the position within one content-set so the loop is seamless.
  const wrap = (el: HTMLElement, target: number) => {
    const h = el.scrollWidth / 2;
    return h > 0 ? ((target % h) + h) % h : target;
  };
  const apply = (el: HTMLElement, target: number) => {
    const p = wrap(el, target);
    st.current.pos = p;
    el.scrollLeft = p;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.button !== 0) return;
    st.current.down = true;
    st.current.moved = false;
    st.current.startX = e.clientX;
    st.current.startLeft = el.scrollLeft;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !st.current.down) return;
    const dx = e.clientX - st.current.startX;
    if (!st.current.moved && Math.abs(dx) > 4) {
      st.current.moved = true;
      el.classList.add("dragging");
      try { el.setPointerCapture(e.pointerId); } catch {}
    }
    if (st.current.moved) apply(el, st.current.startLeft - dx);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    st.current.down = false;
    st.current.resumeAt = performance.now() + 1400;
    el.classList.remove("dragging");
    try { el.releasePointerCapture(e.pointerId); } catch {}
  };
  // Swallow the click that ends a drag so cards don't navigate mid-swipe.
  const onClickCapture = (e: React.MouseEvent) => {
    if (st.current.moved) { e.preventDefault(); e.stopPropagation(); st.current.moved = false; }
  };
  const onEnter = () => { st.current.hover = true; };
  const onLeave = () => { st.current.hover = false; };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaX !== 0 || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      apply(el, st.current.pos + e.deltaY);
      st.current.resumeAt = performance.now() + 1400;
    };
    el.addEventListener("wheel", onWheel, { passive: false });

    st.current.pos = el.scrollLeft;
    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (auto && !reduce) {
      const tick = () => {
        const s = st.current;
        if (!s.down && !s.hover && performance.now() >= s.resumeAt) {
          apply(el, s.pos + speed);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [auto, speed]);

  return (
    <div
      ref={ref}
      className={`zpu-hscroll ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}

function TechChip({ name, icon }: { name: string; icon?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="zpu-stack-chip">
      {icon && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={icon} alt="" className="zpu-stack-ico" loading="lazy" onError={() => setFailed(true)} />
      )}
      {name}
    </span>
  );
}

function AgeCountdown({ target }: { target: string }) {
  const { t } = useLang();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return null;
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return <span className="zpu-age-badge">{t("zpuCdTurned")}</span>;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000) % 24;
  const m = Math.floor(diff / 60000) % 60;
  const s = Math.floor(diff / 1000) % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <span className="zpu-age-badge">
      {d} {t("zpuCdDay")} {pad(h)}:{pad(m)}:{pad(s)} โ’ 18
    </span>
  );
}

// Animated, self-ticking live number (livecounts.io style).
// - Counts up smoothly to `target` whenever it increases (e.g. after a poll).
// - Between polls, drifts up by +1 every 5โ€“17s so it always feels alive,
//   but never runs more than LEAD ahead of the real value (self-correcting).
function LiveTicker({ target, fallback }: { target: number | null; fallback: string }) {
  const [display, setDisplay] = useState<number | null>(null);
  const [stalled, setStalled] = useState(false);
  const displayRef = useRef(0);
  const targetRef = useRef<number | null>(target);
  const rafRef = useRef<number | null>(null);
  const LEAD = 30;

  // If no real value has arrived after a while, show the text fallback
  // instead of leaving the loading shimmer forever.
  useEffect(() => {
    const id = setTimeout(() => setStalled(true), 8000);
    return () => clearTimeout(id);
  }, []);

  const animateTo = (to: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const from = displayRef.current;
    if (from === to) {
      displayRef.current = to;
      setDisplay(to);
      return;
    }
    const dur = 1000;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (to - from) * eased);
      displayRef.current = v;
      setDisplay(v);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  // React to new real values from polling.
  useEffect(() => {
    targetRef.current = target;
    if (target != null && target > displayRef.current) animateTo(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  // Gentle upward drift so the number feels live between polls.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const t = targetRef.current;
      if (t != null && displayRef.current < t + LEAD) {
        const v = displayRef.current + 1;
        displayRef.current = v;
        setDisplay(v);
      }
      timer = setTimeout(tick, 5000 + Math.random() * 12000);
    };
    timer = setTimeout(tick, 5000 + Math.random() * 12000);
    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (display == null) {
    return stalled ? <>{fallback}</> : <span className="zpu-stat-skeleton" aria-label="loading" />;
  }
  return <>{display.toLocaleString("en-US")}</>;
}

const YT_CHANNEL = "UCgMktyw9e816q0GzhBL2dnQ";

// Fetch YouTube subs straight from the browser โ€” both sources allow CORS (*),
// and the browser's network reaches them reliably even when the host can't.
async function fetchYouTubeSubsClient(): Promise<number | null> {
  // socialcounts โ€” finer "estimation" value.
  try {
    const r = await fetch(
      `https://api.socialcounts.org/youtube-live-subscriber-count/${YT_CHANNEL}`,
      { cache: "no-store" }
    );
    if (r.ok) {
      const d = await r.json();
      const v = d?.counters?.estimation?.subscriberCount ?? d?.counters?.api?.subscriberCount;
      if (typeof v === "number") return v;
    }
  } catch {
    /* try next */
  }
  // mixerno โ€” fallback.
  try {
    const r = await fetch(
      `https://mixerno.space/api/youtube-channel-counter/user/${YT_CHANNEL}`,
      { cache: "no-store" }
    );
    if (r.ok) {
      const d = await r.json();
      const raw = d?.counts?.find((x: { value: string; count: number | string }) => x.value === "subscribers")?.count;
      const n = typeof raw === "string" ? parseInt(raw, 10) : raw;
      if (typeof n === "number" && !Number.isNaN(n)) return n;
    }
  } catch {
    /* give up */
  }
  return null;
}

// Live stat cards โ€” seeded by the server, then polled every 30s for realtime updates.
function LiveStats({ ytSubs, discordMembers }: { ytSubs?: number | null; discordMembers?: number | null }) {
  const { t } = useLang();
  const [yt, setYt] = useState<number | null>(ytSubs ?? null);
  const [dc, setDc] = useState<number | null>(discordMembers ?? null);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      // Discord (and a YT seed) via our server route.
      try {
        const r = await fetch("/api/zpu-stats", { cache: "no-store" });
        if (r.ok) {
          const d = await r.json();
          if (alive) {
            if (typeof d.ytSubs === "number") setYt(d.ytSubs);
            if (typeof d.discordMembers === "number") setDc(d.discordMembers);
          }
        }
      } catch {
        /* keep last known value */
      }
      // YouTube straight from the browser (most reliable).
      const ytClient = await fetchYouTubeSubsClient();
      if (alive && ytClient != null) setYt(ytClient);
    };
    poll();
    const id = setInterval(poll, 30000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <>
      <div className="zpu-bn-cell zpu-bn-stat zpu-bn-s1">
        <span className="zpu-bn-stat-ico">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M23 12s0-3.9-.5-5.8a3 3 0 0 0-2.1-2.1C18.5 3.5 12 3.5 12 3.5s-6.5 0-8.4.6A3 3 0 0 0 1.5 6.2C1 8.1 1 12 1 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 8.4.6 8.4.6s6.5 0 8.4-.6a3 3 0 0 0 2.1-2.1C23 15.9 23 12 23 12ZM9.8 15.5v-7l6 3.5-6 3.5Z" />
          </svg>
        </span>
        <strong><LiveTicker target={yt} fallback="75K+" /></strong>
        <span className="zpu-bn-stat-label">{t("zpuStatSubs")}</span>
      </div>
      <div className="zpu-bn-cell zpu-bn-stat zpu-bn-s2">
        <span className="zpu-bn-stat-ico">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </span>
        <strong><LiveTicker target={dc} fallback="110K+" /></strong>
        <span className="zpu-bn-stat-label">{t("zpuStatCommunity")}</span>
      </div>
      <div className="zpu-bn-cell zpu-bn-stat zpu-bn-s3">
        <span className="zpu-bn-stat-ico">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" /><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" /><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
          </svg>
        </span>
        <strong>9+</strong>
        <span className="zpu-bn-stat-label">{t("zpuStatYears")}</span>
      </div>
    </>
  );
}

// Collapses the EDC grid to its first visual row (however many cards that
// is at the current viewport width) instead of an arbitrary item count โ€”
// the auto-fill grid's column count changes with container width, so the
// row height is measured from the DOM rather than assumed.
function EdcRowGrid({
  items, status, expanded, lang,
}: {
  items: typeof ZPU.everyday; status: "current" | "previous"; expanded: boolean; lang: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const cards = Array.from(el.children) as HTMLElement[];
      if (!cards.length) return;
      const firstTop = cards[0].offsetTop;
      let bottom = 0;
      for (const card of cards) {
        if (card.offsetTop !== firstTop) break;
        bottom = Math.max(bottom, card.offsetTop + card.offsetHeight);
      }
      setRowHeight(bottom - firstTop);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  return (
    <div
      ref={ref}
      className="zpu-edc-grid"
      style={!expanded && rowHeight ? { maxHeight: rowHeight, overflow: "hidden" } : undefined}
    >
      {items.map((e) => (
        <div key={e.name} className={`zpu-edc-card zpu-edc-card-${status}`}>
          <div className="zpu-edc-img">
            {e.icon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={e.icon} alt={e.name} loading="lazy" />
            )}
          </div>
          <span className="zpu-edc-cat">{e.cat}</span>
          <span className="zpu-edc-name">{e.name}</span>
          <span className="zpu-edc-detail">{e.detail}</span>
          <span className="zpu-edc-price">{fmtPrice(e.priceThb, lang)}</span>
        </div>
      ))}
    </div>
  );
}

// Short "what's on its mind" lines for the thought bubble above the brain โ€”
// same rotating-quote structure as QUOTES above.
const THOUGHTS: Record<"en" | "th" | "zh" | "vi" | "pt", string>[] = [
  { th: "เธเธณเธฅเธฑเธเธเธดเธ”เนเธญเน€เธ”เธตเธขเนเธซเธกเน...", en: "Thinking of a new idea...", zh: "ๆญฃๅจๆๆ€ๆ–ฐ็นๅญโ€ฆ", vi: "ฤang nghฤฉ รฝ tฦฐแปng mแปi...", pt: "Pensando em uma nova ideia..." },
  { th: "เนเธเนเธเธฑเนเธเธ•เธฑเธงเธฃเนเธฒเธขเธญเธขเธนเน...", en: "Hunting down a stubborn bug...", zh: "ๆญฃๅจ่ฟฝๆฅไธ€ไธช้กฝๅบ็ๆผๆดโ€ฆ", vi: "ฤang sฤn lรนng mแปt con bug cแปฉng ฤ‘แบงu...", pt: "Caรงando um bug teimoso..." },
  { th: "เนเธเธฅเธเธเธฒเนเธเน€เธเนเธเนเธเนเธ”...", en: "Turning coffee into code...", zh: "ๆญฃๅจๆๅ’–ๅ•กๅๆไปฃ็ โ€ฆ", vi: "ฤang biแบฟn cร  phรช thร nh code...", pt: "Transformando cafรฉ em cรณdigo..." },
  { th: "เธงเธฒเธเนเธเธเนเธเธฃเน€เธเธเธ•เนเธญเนเธ...", en: "Sketching the next project...", zh: "ๆญฃๅจๆๆ€ไธไธ€ไธช้กน็ฎโ€ฆ", vi: "ฤang phรกc thแบฃo dแปฑ รกn tiแบฟp theo...", pt: "Esboรงando o prรณximo projeto..." },
  { th: "เธขเธฑเธเนเธกเนเธซเธขเธธเธ”เน€เธฃเธตเธขเธเธฃเธนเน...", en: "Still learning, always...", zh: "ไปๅจไธๆ–ญๅญฆไน โ€ฆ", vi: "Vแบซn luรดn hแปc hแปi...", pt: "Sempre aprendendo..." },
  { th: "เธเธญเธกเนเธเธฅเนเธเธงเธฒเธกเธเธฑเธเธญเธขเธนเน...", en: "Compiling dreams into reality...", zh: "ๆญฃๅจๆๆขฆๆณ็ผ–่ฏ‘ๆ็ฐๅฎโ€ฆ", vi: "ฤang biรชn dแปch ฦฐแปc mฦก thร nh hiแปn thแปฑc...", pt: "Compilando sonhos em realidade..." },
  { th: "เน€เธเธทเนเธญเธกเธเธธเธ”เธ•เนเธฒเธ เน เน€เธเนเธฒเธ”เนเธงเธขเธเธฑเธ...", en: "Connecting the dots...", zh: "ๆญฃๅจๆ็ข็ๆผๆฅ่ตทๆฅโ€ฆ", vi: "ฤang kแบฟt nแป‘i cรกc mแบฃnh ghรฉp...", pt: "Conectando os pontos..." },
  { th: "เนเธฅเนเธ•เธฒเธกเธเธณเธ–เธฒเธก 'เธ–เนเธฒ...เธเธฐเน€เธเนเธเธขเธฑเธเนเธ'...", en: "Chasing a 'what if'...", zh: "ๆญฃๅจ่ฟฝ้€ไธ€ไธชโ€ๅฆๆโ€ฆโ€ฆไผๆ€ๆ ทโ€โ€ฆ", vi: "ฤang theo ฤ‘uแป•i mแปt cรขu hแปi 'nแบฟu nhฦฐ'...", pt: "Perseguindo um 'e se'..." },
  { th: "เธเธณเธฅเธฑเธเธเธดเธ”เน€เธฃเธทเนเธญเธเธเธญเธกเธกเธนเธเธดเธ•เธตเน...", en: "Thinking about the community...", zh: "ๆญฃๅจๆณๅฟต็คพๅบ็ๅคงๅฎถโ€ฆ", vi: "ฤang nghฤฉ vแป cแปng ฤ‘แป“ng...", pt: "Pensando na comunidade..." },
  { th: "เธฃเธตเธเธฒเธฃเนเธเธเธงเธฒเธกเธเธดเธ”เธชเธฃเนเธฒเธเธชเธฃเธฃเธเน...", en: "Recharging creativity...", zh: "ๆญฃๅจ็ปๅ้€ ๅๅ……็”ตโ€ฆ", vi: "ฤang nแบกp lแบกi nฤng lฦฐแปฃng sรกng tแบกo...", pt: "Recarregando a criatividade..." },
  { th: "เน€เธเธตเธขเธเธเธเนเธซเธกเนเนเธซเนเธ•เธฑเธงเน€เธญเธ...", en: "Rewriting my own rules...", zh: "ๆญฃๅจไธบ่ชๅทฑๆ”นๅ่งๅโ€ฆ", vi: "ฤang viแบฟt lแบกi luแบญt chฦกi cแปงa riรชng mรฌnh...", pt: "Reescrevendo minhas prรณprias regras..." },
  { th: "เธเธฑเธเน€เธเนเธเธ เธฒเธฉเธฒเนเธเธเธฒเธฃเธต...", en: "Dreaming in binary...", zh: "ๆญฃๅจ็”จไบ่ฟๅถๅๆขฆโ€ฆ", vi: "ฤang mฦก bแบฑng ngรดn ngแปฏ nhแป phรขn...", pt: "Sonhando em binรกrio..." },
  { th: "เธชเธณเธซเธฃเธฑเธเธเธก เธ—เธธเธเธญเธขเนเธฒเธเธเธทเธญเนเธเธเธฒเธฃเธต เธจเธนเธเธขเนเธเธฑเธเธซเธเธถเนเธ", en: "To me, everything is binary. Zeros and ones.", zh: "ๅฏนๆ‘ๆฅ่ฏด๏ผไธ€ๅ้ฝๆฏไบ่ฟๅถใ€้ถๅ’ไธ€ใ€", vi: "Vแปi tรดi, mแปi thแปฉ ฤ‘แปu lร  nhแป phรขn. Sแป‘ khรดng vร  sแป‘ mแปt.", pt: "Para mim, tudo รฉ binรกrio. Zeros e uns." },
  { th: "เธเธณเธฅเธฑเธเธ•เนเธญเนเธญเน€เธ”เธตเธขเน€เธเนเธฒเธ”เนเธงเธขเธเธฑเธ...", en: "Piecing ideas together...", zh: "ๆญฃๅจๆๆณๆณ•ๆผๅ‘่ตทๆฅโ€ฆ", vi: "ฤang ghรฉp cรกc รฝ tฦฐแปng lแบกi vแปi nhau...", pt: "Juntando as peรงas das ideias..." },
  { th: "เธเธณเธฅเธฑเธเธชเธฃเนเธฒเธเธเธญเธเน€เธเนเธ เน...", en: "Building something cool...", zh: "ๆญฃๅจๆ“้€ ไธ€ไธชๅพ้…ท็ไธ่ฅฟโ€ฆ", vi: "ฤang tแบกo ra thแปฉ gรฌ ฤ‘รณ thแบญt ngแบงu...", pt: "Construindo algo incrรญvel..." },
  { th: "เธเธณเธฅเธฑเธเธกเธญเธเธซเธฒเนเธฃเธเธเธฑเธเธ”เธฒเธฅเนเธ...", en: "Looking for inspiration...", zh: "ๆญฃๅจๅฏปๆพ็ตๆโ€ฆ", vi: "ฤang tรฌm kiแบฟm cแบฃm hแปฉng...", pt: "Buscando inspiraรงรฃo..." },
  { th: "เธเธฅเนเธญเธขเนเธซเนเนเธญเน€เธ”เธตเธขเธเนเธญเธข เน เน€เธ•เธดเธเนเธ•...", en: "Letting ideas grow...", zh: "่ฎฉๆณๆณ•ๆ…ขๆ…ขๆ้•ฟโ€ฆ", vi: "ฤang ฤ‘แป รฝ tฦฐแปng lแปn dแบงn...", pt: "Deixando as ideias crescerem..." },
  { th: "เธฃเนเธฒเธเธญเธเธฒเธเธ•เธ—เธตเธฅเธฐเธเธฃเธฃเธ—เธฑเธ”...", en: "Sketching the future line by line...", zh: "ไธ€่กไธ€่กๅฐๆ็ปๆชๆฅโ€ฆ", vi: "ฤang phรกc hแปa tฦฐฦกng lai tแปซng dรฒng mแปt...", pt: "Esboรงando o futuro linha por linha..." },
  { th: "เธเธณเธฅเธฑเธเธเธถเธเธ เธฒเธเธงเนเธฒเธญเธฐเนเธฃเธเธฐเน€เธเธดเธ”เธเธถเนเธเธ•เนเธญเนเธ...", en: "Imagining what comes next...", zh: "ๆญฃๅจๆณ่ฑกๆฅไธๆฅไผๅ‘็”ไป€ไนโ€ฆ", vi: "ฤang hรฌnh dung ฤ‘iแปu gรฌ sแบฝ ฤ‘แบฟn tiแบฟp theo...", pt: "Imaginando o que vem a seguir..." },
  { th: "เธเธณเธฅเธฑเธเธ—เธ”เธฅเธญเธเนเธญเน€เธ”เธตเธขเนเธซเธกเน เน...", en: "Experimenting with new ideas...", zh: "ๆญฃๅจๅฐ่ฏ•ๆ–ฐๆณๆณ•โ€ฆ", vi: "ฤang thแปญ nghiแปm nhแปฏng รฝ tฦฐแปng mแปi...", pt: "Experimentando novas ideias..." },
  { th: "เน€เธเธฅเธตเนเธขเธเธเธงเธฒเธกเธเธดเธ”เนเธซเนเธเธฅเธฒเธขเน€เธเนเธเธเธงเธฒเธกเธเธฃเธดเธ...", en: "Turning thoughts into reality...", zh: "ๆญฃๅจๆๆณๆณ•ๅๆ็ฐๅฎโ€ฆ", vi: "ฤang biแบฟn suy nghฤฉ thร nh hiแปn thแปฑc...", pt: "Transformando pensamentos em realidade..." },
  { th: "เธเธณเธฅเธฑเธเธชเธฃเนเธฒเธเธเธฒเธเธจเธนเธเธขเน...", en: "Building from scratch...", zh: "ๆญฃๅจไป้ถๅผ€ๅงๆญๅปบโ€ฆ", vi: "ฤang xรขy dแปฑng tแปซ con sแป‘ khรดng...", pt: "Construindo do zero..." },
  { th: "เนเธญเน€เธ”เธตเธขเนเธซเธกเนเธเธณเธฅเธฑเธเธเธนเธ•เธเธถเนเธเธกเธฒ...", en: "Booting up new ideas...", zh: "ๆ–ฐ็นๅญๆญฃๅจๅฏๅจโ€ฆ", vi: "ร tฦฐแปng mแปi ฤ‘ang khแปi ฤ‘แปng...", pt: "Inicializando novas ideias..." },
  { th: "เธเธณเธฅเธฑเธเธ”เธตเธเธฑเธเธเธตเธงเธดเธ•...", en: "Debugging life...", zh: "ๆญฃๅจ่ฐ่ฏ•ไบบ็”โ€ฆ", vi: "ฤang gแปก lแป—i cuแปc sแป‘ng...", pt: "Depurando a vida..." },
  { th: "เธเธณเธฅเธฑเธเน€เธเธตเธขเธเนเธเนเธ”เธญเธขเธนเนเนเธเธเธงเธฒเธกเน€เธเธตเธขเธ...", en: "Coding in silence...", zh: "ๆญฃๅจๅฎ้ๅฐๅไปฃ็ โ€ฆ", vi: "ฤang lแบทng lแบฝ viแบฟt mรฃ...", pt: "Programando em silรชncio..." },
  { th: "เธเธณเธฅเธฑเธเธเธฑเธ”เน€เธเธฅเธฒเธเธฃเธฃเธ—เธฑเธ”เธชเธธเธ”เธ—เนเธฒเธข...", en: "Polishing the final lines...", zh: "ๆญฃๅจๆ“็ฃจๆ€ๅๅ ่กโ€ฆ", vi: "ฤang trau chuแป‘t nhแปฏng dรฒng cuแป‘i...", pt: "Lapidando as รบltimas linhas..." },
  { th: "เธเธณเธฅเธฑเธเธฃเธตเนเธเธเน€เธ•เธญเธฃเนเธ—เธธเธเธญเธขเนเธฒเธ...", en: "Refactoring everything...", zh: "ๆญฃๅจ้ๆไธ€ๅโ€ฆ", vi: "ฤang tรกi cแบฅu trรบc mแปi thแปฉ...", pt: "Refatorando tudo..." },
  { th: "เธเธณเธฅเธฑเธเธเธญเธกเนเธเธฅเน...", en: "Compiling...", zh: "ๆญฃๅจ็ผ–่ฏ‘โ€ฆ", vi: "ฤang biรชn dแปch...", pt: "Compilando..." },
  { th: "เธเธณเธฅเธฑเธเธฃเธฑเธเธ—เธธเธเธเธงเธฒเธกเน€เธเนเธเนเธเนเธ”เน...", en: "Running every possibility...", zh: "ๆญฃๅจ่ท‘้ๆฏไธ€็งๅฏ่ฝโ€ฆ", vi: "ฤang chแบกy mแปi khแบฃ nฤng...", pt: "Executando todas as possibilidades..." },
  { th: "เธเธณเธฅเธฑเธเธเธธเธเน€เธงเธญเธฃเนเธเธฑเธเนเธซเธกเน...", en: "Pushing a new version...", zh: "ๆญฃๅจๆจ้€ๆ–ฐ็ๆฌโ€ฆ", vi: "ฤang ฤ‘แบฉy mแปt phiรชn bแบฃn mแปi...", pt: "Enviando uma nova versรฃo..." },
  { th: "เธเธณเธฅเธฑเธเน€เธเธฅเธตเธขเธฃเนเธฃเธฒเธขเธเธฒเธฃเธชเธดเนเธเธ—เธตเนเธ•เนเธญเธเธ—เธณ...", en: "Clearing the to-do list...", zh: "ๆญฃๅจๆธ…็ฉบๅพ…ๅๆธ…ๅ•โ€ฆ", vi: "ฤang dแปn danh sรกch viแปc cแบงn lร m...", pt: "Limpando a lista de tarefas..." },
  { th: "เธเธณเธฅเธฑเธเธเธฑเธ”เธฃเธฐเน€เธเธตเธขเธเธเธงเธฒเธกเธเธดเธ”...", en: "Organizing thoughts...", zh: "ๆญฃๅจๆ•ด็ๆ€็ปชโ€ฆ", vi: "ฤang sแบฏp xแบฟp lแบกi suy nghฤฉ...", pt: "Organizando os pensamentos..." },
  { th: "เธเธณเธฅเธฑเธเธฃเธญเนเธซเนเธเธดเธฅเธ”เนเน€เธชเธฃเนเธ...", en: "Waiting for the build...", zh: "ๆญฃๅจ็ญๅพ…ๆๅปบๅฎๆโ€ฆ", vi: "ฤang chแป bแบฃn dแปฑng hoร n tแบฅt...", pt: "Esperando a build terminar..." },
  { th: "เธเธณเธฅเธฑเธเธชเธฃเนเธฒเธเธญเธเธฒเธเธ•...", en: "Building the future...", zh: "ๆญฃๅจๆ“้€ ๆชๆฅโ€ฆ", vi: "ฤang xรขy dแปฑng tฦฐฦกng lai...", pt: "Construindo o futuro..." },
  { th: "เธ—เธตเธฅเธฐเธเนเธฒเธง เธ—เธตเธฅเธฐเนเธเธฃเน€เธเธเธ•เน...", en: "One step, one project at a time...", zh: "ไธ€ๆญฅไธ€ๆญฅ๏ผไธ€ไธช้กน็ฎๆฅ็€ไธ€ไธช้กน็ฎโ€ฆ", vi: "Tแปซng bฦฐแปc mแปt, tแปซng dแปฑ รกn mแปt...", pt: "Um passo e um projeto de cada vez..." },
  { th: "เธเธณเธฅเธฑเธเธ—เธณเนเธซเนเธกเธฑเธเน€เธเธดเธ”เธเธถเนเธ...", en: "Making it happen...", zh: "ๆญฃๅจ่ฎฉๅฎๆ็โ€ฆ", vi: "ฤang biแบฟn nรณ thร nh hiแปn thแปฑc...", pt: "Fazendo acontecer..." },
  { th: "เธเธดเธ”เนเธซเนเธเนเธญเธขเธฅเธ เธชเธฃเนเธฒเธเนเธซเนเธกเธฒเธเธเธถเนเธ...", en: "Thinking less, building more...", zh: "ๅฐ‘ๆณไธ€็น๏ผๅคๅไธ€็นโ€ฆ", vi: "Nghฤฉ รญt hฦกn, xรขy dแปฑng nhiแปu hฦกn...", pt: "Pensando menos, construindo mais..." },
  { th: "เธเธณเธฅเธฑเธเธงเธฒเธเธญเธดเธเธเนเธญเธเธ•เนเธญเนเธ...", en: "Laying the next brick...", zh: "ๆญฃๅจๆ”พไธไธ€ๅ—็ –โ€ฆ", vi: "ฤang ฤ‘แบทt viรชn gแบกch tiแบฟp theo...", pt: "Assentando o prรณximo tijolo..." },
  { th: "เธ—เธณเธชเธดเนเธเน€เธฅเนเธ เน เนเธซเนเธกเธตเธเธงเธฒเธกเธซเธกเธฒเธข...", en: "Making small things matter...", zh: "่ฎฉๅฐไบไนๅๅพ—ๆๆไนโ€ฆ", vi: "ฤang khiแบฟn nhแปฏng ฤ‘iแปu nhแป bรฉ trแป nรชn รฝ nghฤฉa...", pt: "Fazendo as pequenas coisas importarem..." },
  { th: "เธเธณเธฅเธฑเธเธชเธฃเนเธฒเธเธชเธดเนเธเธ—เธตเนเธกเธตเธเธงเธฒเธกเธซเธกเธฒเธข...", en: "Building something meaningful...", zh: "ๆญฃๅจๆ“้€ ๆๆไน็ไธ่ฅฟโ€ฆ", vi: "ฤang xรขy dแปฑng ฤ‘iแปu gรฌ ฤ‘รณ cรณ รฝ nghฤฉa...", pt: "Construindo algo significativo..." },
  { th: "เธเธณเธฅเธฑเธเธชเนเธเน€เธงเธญเธฃเนเธเธฑเธเนเธซเธกเนเธญเธญเธเนเธ...", en: "Shipping another version...", zh: "ๆญฃๅจๅ‘ๅธๅฆไธ€ไธช็ๆฌโ€ฆ", vi: "ฤang phรกt hร nh mแปt phiรชn bแบฃn mแปi...", pt: "Lanรงando mais uma versรฃo..." },
  { th: "เธเธงเธฒเธกเธเนเธฒเธงเธซเธเนเธฒเธชเธณเธเธฑเธเธเธงเนเธฒเธเธงเธฒเธกเธชเธกเธเธนเธฃเธ“เนเนเธเธ...", en: "Progress over perfection...", zh: "่ฟๆญฅ่่ฟๅฎ็พโ€ฆ", vi: "Tiแบฟn bแป quan trแปng hฦกn hoร n hแบฃo...", pt: "Progresso acima da perfeiรงรฃo..." },
  { th: "เน€เธฃเธดเนเธกเนเธซเธกเนเนเธซเนเธ”เธตเธเธงเนเธฒเน€เธ”เธดเธก...", en: "Starting over, better...", zh: "้ๆ–ฐๅผ€ๅง๏ผๅๅพ—ๆดๅฅฝโ€ฆ", vi: "Bแบฏt ฤ‘แบงu lแบกi theo cรกch tแป‘t hฦกn...", pt: "Recomeรงando, ainda melhor..." },
  { th: "เธเธณเธฅเธฑเธเธเธฃเธฐเธกเธงเธฅเธเธฅ...", en: "Processing...", zh: "ๆญฃๅจๅค็โ€ฆ", vi: "ฤang xแปญ lรฝ...", pt: "Processando..." },
  { th: "เธเธณเธฅเธฑเธเธเธฃเธฐเธกเธงเธฅเธเธฅเธเธงเธฒเธกเธเธดเธ”...", en: "Processing thoughts...", zh: "ๆญฃๅจๅค็ๆ€็ปชโ€ฆ", vi: "ฤang xแปญ lรฝ suy nghฤฉ...", pt: "Processando pensamentos..." },
  { th: "เธเธณเธฅเธฑเธเน€เธฃเธตเธขเธเธฃเธนเนเนเธเธ—เน€เธ—เธดเธฃเนเธเนเธซเธกเน...", en: "Learning new patterns...", zh: "ๆญฃๅจๅญฆไน ๆ–ฐ็ๆจกๅผโ€ฆ", vi: "ฤang hแปc nhแปฏng mแบซu mแปi...", pt: "Aprendendo novos padrรตes..." },
  { th: "เธเธณเธฅเธฑเธเธเธดเธเธเนเนเธญเน€เธ”เธตเธข...", en: "Syncing ideas...", zh: "ๆญฃๅจๅๆญฅๆณๆณ•โ€ฆ", vi: "ฤang ฤ‘แป“ng bแป รฝ tฦฐแปng...", pt: "Sincronizando ideias..." },
  { th: "เธเธณเธฅเธฑเธเธเธขเธฒเธขเธเธญเธเน€เธเธ•เธเธงเธฒเธกเน€เธเนเธเนเธเนเธ”เน...", en: "Expanding possibilities...", zh: "ๆญฃๅจๆฉๅฑ•ๅ็งๅฏ่ฝโ€ฆ", vi: "ฤang mแป rแปng nhแปฏng khแบฃ nฤng...", pt: "Expandindo possibilidades..." },
  { th: "เธเธณเธฅเธฑเธเธเธถเธเธกเธธเธกเธกเธญเธเธเธงเธฒเธกเธเธดเธ”เนเธซเธกเน...", en: "Training a new way of thinking...", zh: "ๆญฃๅจ่ฎญ็ปไธ€็งๆ–ฐ็ๆ€็ปดๆ–นๅผโ€ฆ", vi: "ฤang rรจn luyแปn mแปt cรกch tฦฐ duy mแปi...", pt: "Treinando uma nova forma de pensar..." },
  { th: "เธเธณเธฅเธฑเธเน€เธเธทเนเธญเธกเนเธขเธเนเธญเน€เธ”เธตเธข...", en: "Linking ideas...", zh: "ๆญฃๅจ่ฟ็ป“ๅ็งๆณๆณ•โ€ฆ", vi: "ฤang liรชn kแบฟt cรกc รฝ tฦฐแปng...", pt: "Ligando ideias..." },
  { th: "เธเธณเธฅเธฑเธเธเธณเธฅเธญเธเธงเธฑเธเธเธฃเธธเนเธเธเธตเน...", en: "Simulating tomorrow...", zh: "ๆญฃๅจๆจกๆๆๅคฉโ€ฆ", vi: "ฤang mรด phแปng ngร y mai...", pt: "Simulando o amanhรฃ..." },
  { th: "เธเธณเธฅเธฑเธเธชเธณเธฃเธงเธเน€เธชเนเธเธ—เธฒเธเนเธซเธกเน...", en: "Exploring new paths...", zh: "ๆญฃๅจๆข็ดขๆ–ฐ็่ทฏๅพโ€ฆ", vi: "ฤang khรกm phรก nhแปฏng con ฤ‘ฦฐแปng mแปi...", pt: "Explorando novos caminhos..." },
  { th: "เธเธณเธฅเธฑเธเธเธฃเธฐเธกเธงเธฅเธเธฅเนเธฃเธเธเธฑเธเธ”เธฒเธฅเนเธ...", en: "Processing inspiration...", zh: "ๆญฃๅจๅค็็ตๆโ€ฆ", vi: "ฤang xแปญ lรฝ nguแป“n cแบฃm hแปฉng...", pt: "Processando inspiraรงรฃo..." },
  { th: "เธญเธขเธนเนเนเธเนเธซเธกเธ”เธชเธฃเนเธฒเธเธชเธฃเธฃเธเน...", en: "In creative mode...", zh: "ๅทฒ่ฟๅ…ฅๅๆๆจกๅผโ€ฆ", vi: "ฤang แป chแบฟ ฤ‘แป sรกng tแบกo...", pt: "No modo criativo..." },
  { th: "เธเธณเธฅเธฑเธเนเธเธเธฑเธชเธชเธธเธ”เธ•เธฑเธง...", en: "Locked in...", zh: "ๆญฃๅจๅ…จ็ฅ่ดฏๆณจโ€ฆ", vi: "ฤang tแบญp trung hแบฟt mแปฉc...", pt: "Totalmente focado..." },
  { th: "เธขเธฑเธเธญเธขเธนเนเธฃเธฐเธซเธงเนเธฒเธเธ”เธณเน€เธเธดเธเธเธฒเธฃ...", en: "Work in progress...", zh: "ไปๅจ่ฟ่กไธญโ€ฆ", vi: "Vแบซn ฤ‘ang trong quรก trรฌnh hoร n thiแปn...", pt: "Trabalho em andamento..." },
  { th: "เธ—เธธเธเนเธญเน€เธ”เธตเธขเน€เธฃเธดเนเธกเธ•เนเธเธ—เธตเนเธเธตเน...", en: "Every idea starts here...", zh: "ๆฏไธชๆณๆณ•้ฝไป่ฟ้ๅผ€ๅงโ€ฆ", vi: "Mแปi รฝ tฦฐแปng ฤ‘แปu bแบฏt ฤ‘แบงu tแปซ ฤ‘รขy...", pt: "Toda ideia comeรงa aqui..." },
  { th: "เธเธณเธฅเธฑเธเธเธดเธ”เธญเธขเนเธฒเธเน€เธเธตเธขเธ เน...", en: "Thinking quietly...", zh: "ๆญฃๅจๅฎ้ๅฐๆ€่€โ€ฆ", vi: "ฤang lแบทng lแบฝ suy nghฤฉ...", pt: "Pensando em silรชncio..." },
  { th: "เธขเธฑเธเธชเธฃเนเธฒเธเธ•เนเธญเนเธ...", en: "Still building...", zh: "ไปๅจๆ็ปญๆญๅปบโ€ฆ", vi: "Vแบซn ฤ‘ang tiแบฟp tแปฅc xรขy dแปฑng...", pt: "Ainda construindo..." },
  { th: "เธเธณเธฅเธฑเธเธเนเธญเธฃเนเธฒเธเน€เธเนเธเธฃเธนเธเน€เธเนเธเธฃเนเธฒเธ...", en: "In the making...", zh: "ๆญฃๅจ้€ๆธๆๅฝขโ€ฆ", vi: "ฤang dแบงn thร nh hรฌnh...", pt: "Em construรงรฃo..." },
  { th: "เธชเธกเธญเธเธเธณเธฅเธฑเธเธ—เธณเธเธฒเธ...", en: "Mind at work...", zh: "ๅคง่‘ๆญฃๅจ่ฟไฝโ€ฆ", vi: "Bแป nรฃo ฤ‘ang hoแบกt ฤ‘แปng...", pt: "Mente trabalhando..." },
  { th: "เนเธเธฅเนเน€เธชเธฃเนเธเนเธฅเนเธง...", en: "Almost there...", zh: "ๅฟซๅฎๆไบโ€ฆ", vi: "Sแบฏp xong rแป“i...", pt: "Quase lรก..." },
  { th: "เธเธณเธฅเธฑเธเน€เธ•เธดเธเนเธ•เธ—เธธเธเธงเธฑเธ...", en: "Growing every day...", zh: "ๆฏๅคฉ้ฝๅจๆ้•ฟโ€ฆ", vi: "ฤang trฦฐแปng thร nh mแป—i ngร y...", pt: "Crescendo a cada dia..." },
  { th: "เธเธณเธฅเธฑเธเธญเธฑเธเน€เธเธฃเธ”เธ•เธฑเธงเน€เธญเธ...", en: "Upgrading myself...", zh: "ๆญฃๅจๅ็บง่ชๅทฑโ€ฆ", vi: "ฤang nรขng cแบฅp bแบฃn thรขn...", pt: "Atualizando a mim mesmo..." },
  { th: "เธเธณเธฅเธฑเธเธเธดเธ”เธเธญเธเธเธฃเธญเธ...", en: "Thinking outside the box...", zh: "ๆญฃๅจ่ทณ่ฑๆกๆถๆ€่€โ€ฆ", vi: "ฤang suy nghฤฉ vฦฐแปฃt khแปi khuรดn khแป•...", pt: "Pensando fora da caixa..." },
  { th: "เธเธณเธฅเธฑเธเน€เธเธฅเธตเนเธขเธเธเธงเธฒเธกเธชเธเธชเธฑเธขเนเธซเนเธเธฅเธฒเธขเน€เธเนเธเธเธณเธ•เธญเธ...", en: "Turning curiosity into answers...", zh: "ๆญฃๅจๆๅฅฝๅฅๅฟๅๆ็ญ”ๆกโ€ฆ", vi: "ฤang biแบฟn sแปฑ tรฒ mรฒ thร nh cรขu trแบฃ lแปi...", pt: "Transformando curiosidade em respostas..." },
  { th: "เธเธณเธฅเธฑเธเธ—เธณเนเธซเนเธเธงเธฒเธกเธขเธธเนเธเธขเธฒเธเธ”เธนเน€เธฃเธตเธขเธเธเนเธฒเธข...", en: "Making complexity feel simple...", zh: "ๆญฃๅจ่ฎฉๅคๆๅๅพ—็ฎ€ๅ•โ€ฆ", vi: "ฤang khiแบฟn ฤ‘iแปu phแปฉc tแบกp trแป nรชn ฤ‘ฦกn giแบฃn...", pt: "Fazendo o complexo parecer simples..." },
  { th: "เธเธณเธฅเธฑเธเนเธเนเธเธฑเธเธซเธฒเธ—เธตเธฅเธฐเธเธดเธเน€เธเธฅ...", en: "Solving problems pixel by pixel...", zh: "ๆญฃๅจไธ€ไธชๅ็ด ไธ€ไธชๅ็ด ๅฐ่งฃๅณ้—ฎ้ขโ€ฆ", vi: "ฤang giแบฃi quyแบฟt vแบฅn ฤ‘แป tแปซng pixel mแปt...", pt: "Resolvendo problemas pixel por pixel..." },
  { th: "เธเธณเธฅเธฑเธเธซเธฒเน€เธงเธญเธฃเนเธเธฑเธเธ—เธตเนเธ”เธตเธเธงเนเธฒ...", en: "Searching for a better version...", zh: "ๆญฃๅจๅฏปๆพๆดๅฅฝ็็ๆฌโ€ฆ", vi: "ฤang tรฌm kiแบฟm mแปt phiรชn bแบฃn tแป‘t hฦกn...", pt: "Buscando uma versรฃo melhor..." },
  { th: "เธเธณเธฅเธฑเธเน€เธเธฅเธตเนเธขเธเธเธญเธเน€เธเธ•เนเธซเนเธเธฅเธฒเธขเน€เธเนเธเนเธญเธเธฒเธช...", en: "Turning limits into possibilities...", zh: "ๆญฃๅจๆ้ๅถๅๆๅฏ่ฝโ€ฆ", vi: "ฤang biแบฟn giแปi hแบกn thร nh khแบฃ nฤng...", pt: "Transformando limites em possibilidades..." },
  { th: "เธเธณเธฅเธฑเธเธญเธญเธเนเธเธเธเธฃเธฐเธชเธเธเธฒเธฃเธ“เนเนเธซเธกเน...", en: "Designing a new experience...", zh: "ๆญฃๅจ่ฎพ่ฎกๅ…จๆ–ฐ็ไฝ“้ชโ€ฆ", vi: "ฤang thiแบฟt kแบฟ mแปt trแบฃi nghiแปm mแปi...", pt: "Criando uma nova experiรชncia..." },
  { th: "เธเธณเธฅเธฑเธเธชเธฃเนเธฒเธเธชเธดเนเธเธ—เธตเนเธญเธขเธฒเธเนเธซเนเนเธฅเธเธเธตเนเธกเธต...", en: "Building what I want to see in the world...", zh: "ๆญฃๅจๆ“้€ ๆ‘ๆณๅจไธ–็•ไธ็่ง็ไบ็ฉโ€ฆ", vi: "ฤang xรขy dแปฑng ฤ‘iแปu tรดi muแป‘n thแบฅy trรชn thแบฟ giแปi...", pt: "Construindo o que quero ver no mundo..." },
  { th: "เธเธณเธฅเธฑเธเน€เธเธดเธ”เนเธ—เนเธเนเธซเธกเนเนเธเธซเธฑเธง...", en: "Opening a new tab in my mind...", zh: "ๆญฃๅจ่‘ไธญๅผ€ๅฏๆ–ฐๅ้กตโ€ฆ", vi: "ฤang mแป mแปt tab mแปi trong ฤ‘แบงu...", pt: "Abrindo uma nova aba na mente..." },
  { th: "เธเธณเธฅเธฑเธเนเธซเธฅเธ”เธกเธธเธกเธกเธญเธเนเธซเธกเน...", en: "Loading a new perspective...", zh: "ๆญฃๅจ่ฝฝๅ…ฅๆ–ฐ็่ง็นโ€ฆ", vi: "ฤang tแบฃi mแปt gรณc nhรฌn mแปi...", pt: "Carregando uma nova perspectiva..." },
  { th: "เธเธณเธฅเธฑเธเธฃเธตเน€เธเนเธ•เน€เธเธทเนเธญเธเนเธฒเธงเธ•เนเธญ...", en: "Resetting to move forward...", zh: "ๆญฃๅจ้็ฝฎ๏ผๅๅค็ปง็ปญๅ่ฟโ€ฆ", vi: "ฤang ฤ‘แบทt lแบกi ฤ‘แป tiแบฟp tแปฅc tiแบฟn lรชn...", pt: "Reiniciando para seguir em frente..." },
  { th: "เธเธณเธฅเธฑเธเธ—เธ”เธชเธญเธเธเธญเธเน€เธเธ•เธเธญเธเธ•เธฑเธงเน€เธญเธ...", en: "Testing my limits...", zh: "ๆญฃๅจๆต่ฏ•่ชๅทฑ็ๆ้โ€ฆ", vi: "ฤang thแปญ thรกch giแปi hแบกn cแปงa bแบฃn thรขn...", pt: "Testando meus limites..." },
  { th: "เธเธณเธฅเธฑเธเน€เธเธตเธขเธเธเธ—เธ•เนเธญเนเธ...", en: "Writing the next chapter...", zh: "ๆญฃๅจไนฆๅไธไธ€ไธช็ซ ่โ€ฆ", vi: "ฤang viแบฟt chฦฐฦกng tiแบฟp theo...", pt: "Escrevendo o prรณximo capรญtulo..." },
  { th: "เธเธณเธฅเธฑเธเธชเธฃเนเธฒเธเธเธฒเธเธเธงเธฒเธกเธญเธขเธฒเธเธฃเธนเน...", en: "Building from curiosity...", zh: "ๆญฃๅจไปฅๅฅฝๅฅๅฟไธบ่ตท็นๆญๅปบโ€ฆ", vi: "ฤang xรขy dแปฑng tแปซ sแปฑ tรฒ mรฒ...", pt: "Construindo a partir da curiosidade..." },
  { th: "เธเธณเธฅเธฑเธเน€เธเธฅเธตเนเธขเธเน€เธชเธตเธขเธเธฃเธเธเธงเธเนเธซเนเธเธฅเธฒเธขเน€เธเนเธเธชเธฑเธเธเธฒเธ“...", en: "Turning noise into signal...", zh: "ๆญฃๅจๆๅช้ณๅๆ่ฎฏๅทโ€ฆ", vi: "ฤang biแบฟn nhiแป…u thร nh tรญn hiแปu...", pt: "Transformando ruรญdo em sinal..." },
  { th: "เธเธณเธฅเธฑเธเธซเธฒเธเธงเธฒเธกเน€เธฃเธตเธขเธเธเนเธฒเธขเนเธเธเธงเธฒเธกเธเธฑเธเธเนเธญเธ...", en: "Finding simplicity in complexity...", zh: "ๆญฃๅจๅคๆไธญๅฏปๆพ็ฎ€ๅ•โ€ฆ", vi: "ฤang tรฌm sแปฑ ฤ‘ฦกn giแบฃn trong phแปฉc tแบกp...", pt: "Encontrando simplicidade na complexidade..." },
  { th: "เธเธณเธฅเธฑเธเธชเธฃเนเธฒเธเธชเธฐเธเธฒเธเธฃเธฐเธซเธงเนเธฒเธเนเธญเน€เธ”เธตเธข...", en: "Building bridges between ideas...", zh: "ๆญฃๅจไธบๆณๆณ•ไน้—ดๆญ่ตทๆกฅๆขโ€ฆ", vi: "ฤang xรขy cแบงu nแป‘i giแปฏa cรกc รฝ tฦฐแปng...", pt: "Construindo pontes entre ideias..." },
  { th: "เธเธณเธฅเธฑเธเธเธฃเธฑเธเธเธนเธเธงเธดเธชเธฑเธขเธ—เธฑเธจเธเน...", en: "Fine-tuning the vision...", zh: "ๆญฃๅจๅพฎ่ฐๆฟๆฏโ€ฆ", vi: "ฤang tinh chแปnh tแบงm nhรฌn...", pt: "Ajustando a visรฃo..." },
  { th: "เธเธณเธฅเธฑเธเธญเธฑเธเน€เธ”เธ•เธฃเธฐเธเธเธเธงเธฒเธกเธเธดเธ”...", en: "Updating the thought system...", zh: "ๆญฃๅจๆดๆ–ฐๆ€็ปด็ณป็ปโ€ฆ", vi: "ฤang cแบญp nhแบญt hแป thแป‘ng tฦฐ duy...", pt: "Atualizando o sistema de pensamento..." },
  { th: "เธเธณเธฅเธฑเธเน€เธฃเธเน€เธ”เธญเธฃเนเธญเธเธฒเธเธ•...", en: "Rendering the future...", zh: "ๆญฃๅจๆธฒๆ“ๆชๆฅโ€ฆ", vi: "ฤang kแบฟt xuแบฅt tฦฐฦกng lai...", pt: "Renderizando o futuro..." },
  { th: "เธเธณเธฅเธฑเธเธชเธฃเนเธฒเธเธ•เนเธเนเธเธเธเธญเธเธชเธดเนเธเธ—เธตเนเธเธฐเน€เธเธดเธ”เธ•เนเธญเนเธ...", en: "Prototyping what comes next...", zh: "ๆญฃๅจๅถไฝไธไธ€ๆญฅ็ๅๅโ€ฆ", vi: "ฤang tแบกo nguyรชn mแบซu cho ฤ‘iแปu tiแบฟp theo...", pt: "Prototipando o que vem a seguir..." },
  { th: "เธเธณเธฅเธฑเธเน€เธฃเธตเธขเธเธฃเธนเนเธเธฒเธเธ—เธธเธเธเธงเธฒเธกเธเธดเธ”เธเธฅเธฒเธ”...", en: "Learning from every mistake...", zh: "ๆญฃๅจไปๆฏไธช้”่ฏฏไธญๅญฆไน โ€ฆ", vi: "ฤang hแปc hแปi tแปซ mแปi sai lแบงm...", pt: "Aprendendo com cada erro..." },
  { th: "เธเธณเธฅเธฑเธเธ—เธ”เธชเธญเธเธชเธกเธกเธ•เธดเธเธฒเธเนเธซเธกเน...", en: "Testing a new hypothesis...", zh: "ๆญฃๅจๆต่ฏ•ๆ–ฐ็ๅ่ฎพโ€ฆ", vi: "ฤang kiแปm thแปญ mแปt giแบฃ thuyแบฟt mแปi...", pt: "Testando uma nova hipรณtese..." },
  { th: "เธเธณเธฅเธฑเธเธเนเธเธซเธฒเธเธงเธฒเธกเน€เธเนเธเนเธเนเธ”เนเธ—เธตเนเธเนเธญเธเธญเธขเธนเน...", en: "Searching for hidden possibilities...", zh: "ๆญฃๅจๅฏปๆพ้่—็ๅฏ่ฝๆ€งโ€ฆ", vi: "ฤang tรฌm kiแบฟm nhแปฏng khแบฃ nฤng แบฉn giแบฅu...", pt: "Buscando possibilidades escondidas..." },
  { th: "เธเธณเธฅเธฑเธเธเธฑเธเธ—เธถเธเนเธญเน€เธ”เธตเธขเธเนเธญเธเธกเธฑเธเธซเธฒเธขเนเธ...", en: "Saving an idea before it disappears...", zh: "ๆญฃๅจ่ถๆณๆณ•ๆถๅคฑๅๆๅฎ่ฎฐไธๆฅโ€ฆ", vi: "ฤang lฦฐu mแปt รฝ tฦฐแปng trฦฐแปc khi nรณ biแบฟn mแบฅt...", pt: "Salvando uma ideia antes que desapareรงa..." },
  { th: "เธเธณเธฅเธฑเธเน€เธเธฅเธตเนเธขเธเนเธฃเธเธเธฑเธเธ”เธฒเธฅเนเธเนเธซเนเธเธฅเธฒเธขเน€เธเนเธเธเธฒเธฃเธฅเธเธกเธทเธญเธ—เธณ...", en: "Turning inspiration into action...", zh: "ๆญฃๅจๆ็ตๆๅ–ไธบ่กๅจโ€ฆ", vi: "ฤang biแบฟn cแบฃm hแปฉng thร nh hร nh ฤ‘แปng...", pt: "Transformando inspiraรงรฃo em aรงรฃo..." },
  { th: "เธเธณเธฅเธฑเธเธ—เธณเนเธซเนเธชเธดเนเธเธ—เธตเนเน€เธเนเธเนเธเนเธกเนเนเธ”เนเธ”เธนเนเธเธฅเนเน€เธเนเธฒเธกเธฒ...", en: "Making the impossible feel closer...", zh: "ๆญฃๅจ่ฎฉไธๅฏ่ฝๅๅพ—ๆดๆฅ่ฟ‘โ€ฆ", vi: "ฤang khiแบฟn ฤ‘iแปu khรดng thแป trแป nรชn gแบงn hฦกn...", pt: "Fazendo o impossรญvel parecer mais prรณximo..." },
  { th: "เธเธณเธฅเธฑเธเธซเธฒเน€เธชเนเธเธ—เธฒเธเธ—เธตเนเธขเธฑเธเนเธกเนเธกเธตเนเธเธฃเธชเธฃเนเธฒเธ...", en: "Finding a path no one has built yet...", zh: "ๆญฃๅจๅฏปๆพๅฐๆชๆไบบๅผ€่พ็้“่ทฏโ€ฆ", vi: "ฤang tรฌm mแปt con ฤ‘ฦฐแปng chฦฐa ai tแบกo ra...", pt: "Encontrando um caminho que ninguรฉm construiu ainda..." },
  { th: "เธเธณเธฅเธฑเธเน€เธฃเธตเธขเธเธฃเธนเนเธฃเธฐเธซเธงเนเธฒเธเธฅเธเธกเธทเธญเธ—เธณ...", en: "Learning by building...", zh: "ๆญฃๅจๅฎไฝไธญๅญฆไน โ€ฆ", vi: "ฤang hแปc bแบฑng cรกch xรขy dแปฑng...", pt: "Aprendendo ao construir..." },
  { th: "เธเธฅเนเธญเธขเนเธซเนเธเธงเธฒเธกเธญเธขเธฒเธเธฃเธนเนเธเธณเธ—เธฒเธ...", en: "Letting curiosity lead the way...", zh: "่ฎฉๅฅฝๅฅๅฟๅธฆ่ทฏโ€ฆ", vi: "ฤang ฤ‘แป sแปฑ tรฒ mรฒ dแบซn ฤ‘ฦฐแปng...", pt: "Deixando a curiosidade guiar o caminho..." },
  { th: "เธเธณเธฅเธฑเธเธชเธฃเนเธฒเธเธชเธดเนเธเนเธซเธกเนเธเธฒเธเน€เธจเธฉเนเธญเน€เธ”เธตเธข...", en: "Building something new from fragments...", zh: "ๆญฃๅจไป้ถ็ข็ๆณๆณ•ไธญๅ้€ ๆ–ฐไบ็ฉโ€ฆ", vi: "ฤang tแบกo ฤ‘iแปu mแปi tแปซ nhแปฏng mแบฃnh รฝ tฦฐแปng...", pt: "Construindo algo novo a partir de fragmentos..." },
  { th: "เธเธณเธฅเธฑเธเน€เธเธดเนเธกเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธ—เธตเนเนเธกเนเธกเธตเนเธเธฃเธชเธฑเธเน€เธเธ•...", en: "Adding details no one notices...", zh: "ๆญฃๅจๅ ๅ…ฅๆฒกไบบๆณจๆๅฐ็็ป่โ€ฆ", vi: "ฤang thรชm nhแปฏng chi tiแบฟt khรดng ai ฤ‘แป รฝ...", pt: "Adicionando detalhes que ninguรฉm percebe..." },
  { th: "เธเธณเธฅเธฑเธเธฅเธ”เธเธงเธฒเธกเธเธฑเธเธเนเธญเธเธ—เธตเธฅเธฐเธเธฑเนเธ...", en: "Removing complexity layer by layer...", zh: "ๆญฃๅจไธ€ๅฑไธ€ๅฑ็งป้คๅคๆๆ€งโ€ฆ", vi: "ฤang loแบกi bแป sแปฑ phแปฉc tแบกp tแปซng lแปp mแปt...", pt: "Removendo a complexidade camada por camada..." },
  { th: "เธเธณเธฅเธฑเธเธซเธฒเธเธฑเธเธซเธงเธฐเธ—เธตเนเธฅเธเธ•เธฑเธง...", en: "Finding the right rhythm...", zh: "ๆญฃๅจๅฏปๆพๆฐๅฐๅฅฝๅค็่ๅฅโ€ฆ", vi: "ฤang tรฌm nhแปp ฤ‘iแปu phรน hแปฃp...", pt: "Encontrando o ritmo certo..." },
  { th: "เธเธณเธฅเธฑเธเธชเธฃเนเธฒเธเธเธทเนเธเธ—เธตเนเนเธซเนเนเธญเน€เธ”เธตเธขเนเธซเธกเน...", en: "Making room for new ideas...", zh: "ๆญฃๅจไธบๆ–ฐๆณๆณ•่…พๅบ็ฉบ้—ดโ€ฆ", vi: "ฤang tแบกo chแป— cho nhแปฏng รฝ tฦฐแปng mแปi...", pt: "Abrindo espaรงo para novas ideias..." },
  { th: "เธเธณเธฅเธฑเธเธเธฃเธฑเธเน€เธเนเธกเธ—เธดเธจเธ เธฒเธขเนเธเนเธซเธกเน...", en: "Recalibrating the inner compass...", zh: "ๆญฃๅจ้ๆ–ฐๆ กๅๅ…ๅจ็็ฝ—็โ€ฆ", vi: "ฤang hiแปu chแปnh lแบกi la bร n bรชn trong...", pt: "Recalibrando a bรบssola interior..." },
];

// Alternate hero visual โ€” a traced circuit-board brain (public/images/ai-brain-circuit.svg,
// adapted from Bryan C Guner's "Neural Network Visualization" CodePen, MIT) with a rotating
// thought bubble, drifting data particles, and binary digits, meant to read as "always
// thinking" rather than a static project shot.
function AiBrainVisual() {
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const assetRef = useRef<HTMLDivElement>(null);
  const assetHostRef = useRef<HTMLDivElement>(null);
  const thoughtRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<{ left: number; delay: number; dur: number; size: number }[] | null>(null);
  const [digits, setDigits] = useState<{ left: number; top: number; text: string; opacity: number; delay: number }[] | null>(null);
  const [thoughtIdx, setThoughtIdx] = useState<number | null>(null);
  const [connector, setConnector] = useState<{ path: string; nodes: [number, number][]; w: number; h: number } | null>(null);

  useEffect(() => {
    setThoughtIdx(Math.floor(Math.random() * THOUGHTS.length));
    const id = setInterval(() => {
      setThoughtIdx((prev) => {
        if (THOUGHTS.length <= 1 || prev === null) return prev;
        let next = Math.floor(Math.random() * THOUGHTS.length);
        while (next === prev) next = Math.floor(Math.random() * THOUGHTS.length);
        return next;
      });
    }, 4500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setParticles(
      Array.from({ length: 22 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 8,
        dur: 6 + Math.random() * 6,
        size: 1 + Math.random() * 2,
      }))
    );
    setDigits(
      Array.from({ length: 7 }, (_, i) => ({
        left: 2 + i * 6 + Math.random() * 3,
        top: 28 + Math.random() * 58,
        text: Array.from({ length: 4 }, () => (Math.random() < 0.5 ? "0" : "1")).join(""),
        opacity: 0.15 + Math.random() * 0.5,
        delay: Math.random() * 4,
      }))
    );
  }, []);

  // Fetch the traced brain SVG and inject it, then set up the same
  // "draw the lines in" technique as the source pen: measure each path's
  // real length so stroke-dashoffset has something to animate from.
  useEffect(() => {
    let cancelled = false;
    fetch("/images/ai-brain-circuit.svg")
      .then((r) => r.text())
      .then((svgText) => {
        const el = assetHostRef.current;
        if (cancelled || !el) return;
        el.innerHTML = svgText;
        const svg = el.querySelector("svg");
        if (!svg) return;
        // Only a fraction of the traced elements actually animate โ€” the SVG has
        // ~440 paths/rects/circles, and animating stroke-dashoffset/opacity on all
        // of them at once (each a non-composited, per-frame repaint) is what made
        // this visual janky. The rest render as static fully-drawn lines/dots,
        // which reads the same at a glance but costs nothing per frame.
        svg.querySelectorAll("path").forEach((p, i) => {
          if (i % 3 !== 0) return;
          const len = p.getTotalLength();
          p.style.strokeDasharray = `${len}`;
          p.style.strokeDashoffset = `${len}`;
          p.style.animationDelay = `${(Math.random() * 10 - 5).toFixed(2)}s`;
          p.classList.add("zpu-brain-drawline");
        });
        svg.querySelectorAll("rect").forEach((r, i) => {
          if (i % 2 !== 0) return;
          (r as SVGElement).style.animationDelay = `${(Math.random() * 10 - 5).toFixed(2)}s`;
          r.classList.add("zpu-brain-fade-rect");
        });
        svg.querySelectorAll("circle, ellipse").forEach((c, i) => {
          if (i % 2 !== 0) return;
          (c as SVGElement).style.animationDelay = `${(Math.random() * 10 - 5).toFixed(2)}s`;
          c.classList.add("zpu-brain-pulse-dot");
        });
      })
      .catch(() => { /* decorative โ€” fine to no-op if it fails to load */ });
    return () => { cancelled = true; };
  }, []);

  // Measure the bubble's and brain's actual on-screen boxes so the connector's
  // endpoints touch both exactly โ€” the bubble's width changes with every
  // thought/language, so guessed percentages drift out of alignment.
  useEffect(() => {
    if (thoughtIdx === null) return;
    const recompute = () => {
      const root = rootRef.current, bubble = thoughtRef.current, brain = assetRef.current;
      if (!root || !bubble || !brain) return;
      const r = root.getBoundingClientRect();
      const b = bubble.getBoundingClientRect();
      const a = brain.getBoundingClientRect();
      const start = { x: b.left - r.left + b.width * 0.22, y: b.bottom - r.top };
      const end = { x: a.left - r.left + a.width * 0.5, y: a.top - r.top };
      const midY = start.y + (end.y - start.y) * 0.45;
      const bend1: [number, number] = [start.x, midY];
      const bend2: [number, number] = [end.x, midY];
      const path = `M${start.x.toFixed(1)},${start.y.toFixed(1)} L${bend1[0].toFixed(1)},${bend1[1].toFixed(1)} L${bend2[0].toFixed(1)},${bend2[1].toFixed(1)} L${end.x.toFixed(1)},${end.y.toFixed(1)}`;
      setConnector({
        path,
        nodes: [[start.x, start.y], bend1, bend2, [end.x, end.y]],
        w: r.width,
        h: r.height,
      });
    };
    // Run after layout settles (bubble width depends on the just-rendered text).
    const raf = requestAnimationFrame(recompute);
    window.addEventListener("resize", recompute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recompute);
    };
  }, [thoughtIdx, lang]);

  return (
    <div className="zpu-brain" ref={rootRef}>
      <div className="zpu-brain-glow-wrap">
        <div className="zpu-brain-glow" />
      </div>
      <div className="zpu-brain-particles">
        {particles?.map((p, i) => (
          <span
            key={i}
            className="zpu-brain-particle"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}
      </div>
      <div className="zpu-brain-digits">
        {digits?.map((d, i) => (
          <span
            key={i}
            className="zpu-brain-digit"
            style={{ left: `${d.left}%`, top: `${d.top}%`, opacity: d.opacity, animationDelay: `${d.delay}s` }}
          >
            {d.text}
          </span>
        ))}
      </div>
      <div ref={assetRef} className="zpu-brain-asset">
        <div ref={assetHostRef} className="zpu-brain-asset-inner" />
      </div>
      {thoughtIdx !== null && (
        <>
          {/* A jagged, right-angle circuit trace from the brain up to the
              bubble โ€” same visual language as the brain's own traces. The
              endpoints come from measured DOM positions (see the effect
              above), not guessed percentages, so they actually touch both
              elements regardless of bubble width or screen size. */}
          {connector && (
            <svg className="zpu-brain-connector" viewBox={`0 0 ${connector.w} ${connector.h}`}>
              <path d={connector.path} className="zpu-brain-connector-path" />
              {connector.nodes.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={2.2} className="zpu-brain-connector-node" />
              ))}
              <circle r={2} className="zpu-brain-connector-spark">
                <animateMotion dur="2.2s" repeatCount="indefinite" path={connector.path} />
              </circle>
            </svg>
          )}
          <div className="zpu-brain-thought" ref={thoughtRef}>
            <span className="zpu-brain-thought-corner zpu-brain-thought-corner-tl" />
            <span className="zpu-brain-thought-corner zpu-brain-thought-corner-br" />
            <span key={thoughtIdx} className="zpu-brain-thought-text">
              {THOUGHTS[thoughtIdx][lang] || THOUGHTS[thoughtIdx].en}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export function AboutZpu({ ytSubs, discordMembers }: { ytSubs?: number | null; discordMembers?: number | null }) {
  const { t, lang } = useLang();
  const [showAllWorks, setShowAllWorks] = useState(false);
  const [showAllEdc, setShowAllEdc] = useState(false);
  const [heroView, setHeroView] = useState<"brain" | "showcase">("brain");
  // Picked once per page load so the "Living in" fact card and the location
  // pill always agree โ€” two independent random picks would show two cities.
  const [livingCity, setLivingCity] = useState<string | null>(null);
  useEffect(() => {
    setLivingCity(TH_PROVINCES[Math.floor(Math.random() * TH_PROVINCES.length)]);
  }, []);

  const [theme, setTheme] = useZpuTheme();
  useScrollReveal();
  const activeSection = useScrollSpy(NAV_IDS, "zpu-top");

  const navItems = NAV_IDS.map((id, i) => ({ id, href: `#${id}`, label: t(NAV_LABEL_KEYS[i]) }));


  const currently = [
    { labelKey: "zpuRoleFounder" as const, strong: "Spectrum Cheat", href: "https://spectrumcheat.com", sinceKey: "zpuSinceFounder" as const, platform: "spectrum" as const },
    { labelKey: "zpuRoleOwner" as const, strong: "ZPU Community", href: "https://discord.gg/C3MpUNwsDU", sinceKey: "zpuSinceOwner" as const, platform: "discord" as const },
    { labelKey: "zpuRoleYoutube" as const, strong: "@xZPUHigh", href: "https://www.youtube.com/channel/UCgMktyw9e816q0GzhBL2dnQ", sinceKey: "zpuSinceYoutube" as const, platform: "youtube" as const },
    { labelKey: "zpuRoleTiktok" as const, strong: "@xZPUHigh", href: "https://www.tiktok.com/@xzpuhigh", sinceKey: "zpuSinceTiktok" as const, platform: "tiktok" as const },
  ];

  const facts = [
    { labelKey: "zpuFactsPassions" as const, value: t("zpuFactsPassionsV"), color: "#8b5cf6" },
    { labelKey: "zpuFactsLiving" as const, value: livingCity, color: "#3b82f6" },
    { labelKey: "zpuFactsTimezone" as const, value: (
      <span className="zpu-fact-tz">
        <span>ICT (Indochina Time)</span>
        <span>Asia/Bangkok</span>
        <span>UTC+7</span>
      </span>
    ), color: "#6366f1" },
    { labelKey: "zpuFactsChasing" as const, value: (<><span className="zpu-only-desktop">{t("zpuFactsChasingV")}</span><span className="zpu-only-mobile">{t("zpuFactsChasingV").replace(/\n/g, "\n\n")}</span></>), color: "#f43f5e" },
    { labelKey: "zpuFactsKnown" as const, value: (<><span className="zpu-only-desktop">ZPU / xZPUHigh<br />Non / Chanon</span><span className="zpu-only-mobile">ZPU<br />xZPUHigh<br />&<br />Non<br />Chanon</span></>), color: "#14b8a6" },
    { labelKey: "zpuFactsAge" as const, value: t("zpuFactsAgeV"), color: "#a855f7" },
    { labelKey: "zpuFactsStyle" as const, value: t("zpuFactsStyleV"), color: "#94a3b8" },
  ];

  const tinyFacts = [
    { labelKey: "zpuTinyNickname" as const, value: "ZPU / NON ๐ด", color: "#22c55e" },
    { labelKey: "zpuTinyStatus" as const, value: "WORK HARD ๐”ฅ", color: "#ff6f00" },
  ];

  return (
    <main className="zpu-page" data-theme={theme}>
      <div className="zpu-dots" />
      <ZpuTopbar
        navItems={navItems}
        activeSection={activeSection}
        theme={theme}
        setTheme={setTheme}
        heroView={heroView}
        setHeroView={setHeroView}
      />

      {/* Music player โ€” mounted outside .zpu-wrap so its popup can layer above the header */}
      <MusicPlayer />

      <div className="zpu-wrap">
        {/* Home / hero */}
        <section className="zpu-home" id="zpu-top">
          <div className="zpu-home-left">
            <p className="zpu-home-eyebrow">{t("zpuHello")}</p>
            <h1 className="zpu-home-name">{ZPU.brand}</h1>
            <p className="zpu-home-tag">
              {t("zpuHomeTag1")}
              <br />
              <span className="zpu-home-tag-accent">{t("zpuHomeTag2")}</span>
            </p>
            <p className="zpu-home-desc" lang={lang}>{t("zpuHomeDesc")}</p>
            <div className="zpu-home-cta">
              <a href="#zpu-facts" className="zpu-home-btn zpu-home-btn--primary">
                {t("zpuHomeCtaWork")}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a href="#zpu-connect" className="zpu-home-btn">{t("zpuHomeCtaConnect")}</a>
            </div>
            <div className="zpu-home-stats">
              <div className="zpu-home-stat">
                <strong>9+</strong>
                <span>{t("zpuHomeStatProjects")}</span>
              </div>
              <div className="zpu-home-stat">
                <strong>80K+</strong>
                <span>{t("zpuStatSubs")}</span>
              </div>
              <div className="zpu-home-stat">
                <strong>100K+</strong>
                <span>{t("zpuStatCommunity")}</span>
              </div>
            </div>
          </div>

          <div className="zpu-home-visual">
            <span className="zpu-home-accent" />
            {/* key={heroView} forces a remount on switch, replaying the fade/scale-in
                keyframe below โ€” otherwise the two views just instantly swap. */}
            <div key={heroView} className="zpu-hero-swap">
              {heroView === "brain" ? (
                <AiBrainVisual />
              ) : (
                <>
                  <a
                    href={ZPU.works[0].href}
                    className="zpu-home-shot"
                    target={ZPU.works[0].href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ZPU.works[0].image} alt={ZPU.works[0].name} loading="lazy" />
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="zpu-home-line" aria-hidden="true">
            <span className="zpu-home-chev">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </div>
        </section>

        {/* About โ€” bold bento grid */}
        <section className="zpu-about-bento">
          <div className="zpu-bn-cell zpu-bn-bio">
            <p className="zpu-current-label">{t("zpuBioLabel")}</p>
            <p className="zpu-bio" lang={lang} dangerouslySetInnerHTML={{ __html: t("zpuBio") }} />
          </div>

          <div className="zpu-bn-cell zpu-bn-photo">
            <div className="zpu-bn-status">
              <span className="zpu-bn-status-dot" aria-hidden="true" />
              {t("zpuOnline")}
            </div>
            <div className="zpu-photo-frame">
              <div className="zpu-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ZPU.photo} alt={ZPU.brand} />
              </div>
            </div>

            <RandomFact />

            <div className="zpu-pills">
              <span className="zpu-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {livingCity}
              </span>
              <span className="zpu-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                GMT+7
              </span>
              <span className="zpu-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <LiveDate timezone={ZPU.timezone} />
              </span>
              <span className="zpu-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <LiveClock timezone={ZPU.timezone} />
              </span>
            </div>

            <div className="zpu-bn-socials">
              {ZPU.socials
                .filter((s) => ["youtube", "discord", "instagram", "tiktok", "github"].includes(s.platform))
                .map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="zpu-bn-social"
                    aria-label={s.label}
                  >
                    <PlatformIcon platform={s.platform} />
                  </a>
                ))}
            </div>
          </div>

          <div className="zpu-bn-cell zpu-bn-roles">
            <p className="zpu-current-label">{t("zpuCurrent")}</p>
            <div className="zpu-current-list">
              {currently.map((c) => (
                <div key={c.labelKey} className="zpu-current-item">
                  <PlatformIcon platform={c.platform} />
                  <span>
                    {t(c.labelKey)}{" "}
                    <a href={c.href} target="_blank" rel="noreferrer" className="zpu-current-link">{c.strong}</a>
                  </span>
                  <span className="zpu-current-since">{t(c.sinceKey)}</span>
                </div>
              ))}
            </div>
          </div>

          <LiveStats ytSubs={ytSubs} discordMembers={discordMembers} />
        </section>

        {/* Facts About Me */}
        <section className="zpu-facts-sec" id="zpu-facts">
          <h2 className="zpu-works-title zpu-facts-bigtitle">{t("zpuFactsTitle")}</h2>

          <div className="zpu-facts-grid">
            {tinyFacts.map((f) => (
              <div key={f.labelKey} className="zpu-fact zpu-fact--half" style={{ ["--c" as string]: f.color }}>
                <span className="zpu-fact-ico"><FactIcon k={f.labelKey} /></span>
                <div className="zpu-fact-body">
                  <span className="zpu-fact-value">{f.value}</span>
                  <span className="zpu-fact-label">{t(f.labelKey)}</span>
                </div>
              </div>
            ))}
            {facts.map((f) => (
              <div
                key={f.labelKey}
                className={`zpu-fact${FACT_WIDE.has(f.labelKey) ? " zpu-fact--wide" : ""}`}
                style={{ ["--c" as string]: f.color }}
              >
                <span className="zpu-fact-ico"><FactIcon k={f.labelKey} /></span>
                <div className="zpu-fact-body">
                  {f.labelKey === "zpuFactsPassions" ? (
                    <div className="zpu-fact-chips">
                      {t("zpuFactsPassionsV").split(/\s*[,ใ€]\s*/).map((x) => x.trim()).filter(Boolean).map((x) => (
                        <span key={x} className="zpu-fact-chip">{x}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="zpu-fact-value">{f.value}</span>
                  )}
                  <span className="zpu-fact-label">{t(f.labelKey)}</span>
                  {f.labelKey === "zpuFactsLiving" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="zpu-fact-flag" src="https://flagcdn.com/w320/th.png" alt={t("zpuThailandFlagAlt")} loading="lazy" />
                  )}
                  {f.labelKey === "zpuFactsAge" && <AgeCountdown target={BIRTHDAY_18} />}
                </div>
              </div>
            ))}
          </div>
        </section>

        <QuoteCard />

        {/* Favorites โ€” a shelf of collections. Each card fans out real covers
            from its topic and deep-links into /favorites, so this one
            section replaces the ten full lists that used to live here. */}
        <section className="zpu-collections" id="zpu-interests">
          <SectionHead title={t("zpuCollectionsTitle")} sub={t("zpuCollectionsSub")} />
          <div className="zpu-coll-grid">
            {FAV_TOPICS.filter((topic) => topic.id !== "animals").map((topic) => (
              <a
                key={topic.id}
                className="zpu-coll"
                href={`/favorites#fav-${topic.id}`}
                style={{ "--coll-accent": topic.accent } as React.CSSProperties}
              >
                <span className="zpu-coll-fan" aria-hidden="true">
                  {topic.covers.map((src, j) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={src}
                      className="zpu-coll-cover"
                      src={src}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      style={{ "--i": j } as React.CSSProperties}
                    />
                  ))}
                </span>
                <span className="zpu-coll-body">
                  <span className="zpu-coll-name">{t(topic.labelKey)}</span>
                  {/* Count and arrow share one slot on the right edge and
                      cross-fade, so nothing shifts when the card is hovered. */}
                  <span className="zpu-coll-end">
                    <span className="zpu-coll-count">{topic.count}</span>
                    <span className="zpu-coll-go" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </span>
                </span>
              </a>
            ))}
          </div>

          <a className="zpu-coll-cta" href="/favorites">
            <span>{t("zpuViewCollections")}</span>
            <span className="zpu-coll-cta-count">{FAV_TOTAL}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </section>

        {/* Tech stack */}
        <section className="zpu-stack-sec" id="zpu-skills">
          <SectionHead title={t("zpuStackTitle")} sub={t("zpuStackSub")} />
          <div className="zpu-stack-grid">
            {ZPU.stack.map((row) => (
              <div key={row.catKey} className="zpu-stack-panel">
                <span className="zpu-stack-cat">{t(row.catKey)}</span>
                <div className="zpu-stack-items">
                  {row.items.map((it) => (
                    <TechChip key={it.name} name={it.name} icon={it.icon} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <ActivityOverview />

        {/* Everyday items */}
        {ZPU.everyday.length > 0 && (
          <section className="zpu-stack-sec" id="zpu-items">
            <SectionHead title={t("zpuEdcTitle")} sub={t("zpuEdcSub")} />
            {(["current", "previous"] as const).map((st) => {
              const items = ZPU.everyday.filter((e) => e.status === st);
              if (!items.length) return null;
              return (
                <div key={st} className="zpu-edc-group">
                  <span className={`zpu-edc-gl zpu-edc-gl-${st}`}>
                    {t(st === "current" ? "zpuEdcCurrent" : "zpuEdcPrevious")}
                  </span>
                  <EdcRowGrid items={items} status={st} expanded={showAllEdc} lang={lang} />
                </div>
              );
            })}
            {(["current", "previous"] as const).some(
              (st) => ZPU.everyday.filter((e) => e.status === st).length > 1
            ) && (
              <button className="zpu-works-more" onClick={() => setShowAllEdc((v) => !v)}>
                {t(showAllEdc ? "zpuShowLess" : "zpuExploreAll")}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: showAllEdc ? "rotate(180deg)" : undefined, transition: "transform .2s" }}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            )}
          </section>
        )}

        {/* PC setup */}
        {ZPU.setup.length > 0 && (
          <section className="zpu-stack-sec">
            <SectionHead title={t("zpuSetupTitle")} sub={t("zpuSetupSub")} />
            <DragScroll className="zpu-setup-marquee">
              <div className="zpu-setup-track">
                {[...ZPU.setup, ...ZPU.setup].map((c, i) => (
                  <div key={`${c.name}-${i}`} className="zpu-setup-card" aria-hidden={i >= ZPU.setup.length}>
                    <div className="zpu-setup-img">
                      {c.icon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.icon} alt={c.name} loading="lazy" />
                      )}
                    </div>
                    <span className="zpu-setup-cat">{c.part}</span>
                    <span className="zpu-setup-model">{c.name}</span>
                    <div className="zpu-setup-prices">
                      <span className="zpu-price-thb">{fmtPrice(c.priceThb, lang)}</span>
                      {c.url && (
                        <a className="zpu-price-view" href={c.url} target="_blank" rel="noreferrer">
                          {t("zpuSetupView")}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DragScroll>
            <div className="zpu-setup-total">
              <span className="zpu-setup-total-label">{t("zpuSetupTotal")}</span>
              <span className="zpu-setup-total-value">
                {fmtPrice(ZPU.setup.reduce((s, c) => s + c.priceThb, 0), lang)}
              </span>
            </div>
          </section>
        )}

        {/* Gaming gear / peripherals */}
        {ZPU.gear.length > 0 && (
          <section className="zpu-stack-sec">
            <SectionHead title={t("zpuGearTitle")} sub={t("zpuGearSub")} />
            <DragScroll className="zpu-setup-marquee">
              <div className="zpu-setup-track">
                {[...ZPU.gear, ...ZPU.gear].map((c, i) => (
                  <div key={`${c.name}-${i}`} className="zpu-setup-card" aria-hidden={i >= ZPU.gear.length}>
                    <div className="zpu-setup-img">
                      {c.icon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.icon} alt={c.name} loading="lazy" />
                      )}
                    </div>
                    <span className="zpu-setup-cat">{c.part}</span>
                    <span className="zpu-setup-model">{c.name}</span>
                    <div className="zpu-setup-prices">
                      <span className="zpu-price-thb">{fmtPrice(c.priceThb, lang)}</span>
                      {c.url && (
                        <a className="zpu-price-view" href={c.url} target="_blank" rel="noreferrer">
                          {t("zpuSetupView")}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DragScroll>
            <div className="zpu-setup-total">
              <span className="zpu-setup-total-label">{t("zpuSetupTotal")}</span>
              <span className="zpu-setup-total-value">
                {fmtPrice(ZPU.gear.reduce((s, c) => s + c.priceThb, 0), lang)}
              </span>
            </div>
          </section>
        )}

        {/* Works */}
        <section className="zpu-works" id="zpu-works">
          <SectionHead title={t("zpuWorksTitle")} sub={t("zpuWorksSub")} />
          <div className="zpu-works-grid">
            {(showAllWorks ? ZPU.works : ZPU.works.slice(0, 6)).map((w) => (
              <a key={w.image} href={w.href} className="zpu-work-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="zpu-work-img" src={w.image} alt={w.name} />
                <span className="zpu-work-tag zpu-work-year">{w.year}</span>
                <span className="zpu-work-tag zpu-work-cat">{w.tag}</span>
                <div className="zpu-work-overlay">
                  <span className="zpu-work-name">{w.name}</span>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17 17 7M7 7h10v10" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
          {ZPU.works.length > 6 && !showAllWorks && (
            <button className="zpu-works-more" onClick={() => setShowAllWorks(true)}>
              {t("zpuExploreAll")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          )}
        </section>

        {/* Connect */}
        <section className="zpu-connect" id="zpu-connect">
          <SectionHead title={t("zpuConnectTitle")} sub={t("zpuConnectSub")} />
          <div className="zpu-socials">
            {ZPU.socials.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noreferrer" : undefined}
                className="zpu-social"
                style={{ ["--c" as string]: s.color }}
              >
                <span className="zpu-social-ico"><PlatformIcon platform={s.platform} /></span>
                <span className="zpu-social-body">
                  <span className="zpu-social-label">{s.label}</span>
                  <span className="zpu-social-handle">{s.handle}</span>
                </span>
                <svg className="zpu-social-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              </a>
            ))}
          </div>
        </section>

      </div>
      <ZpuFooter />
    </main>
  );
}

