"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "./_i18n/context";
import type { TranslationKey } from "./_i18n/translations";

import { ZpuFooter, ZpuTopbar, MusicPlayer, useScrollReveal, useScrollSpy, useZpuTheme } from "./_shared/chrome";
import { SectionHead } from "./_shared/tiles";
import { BIRTHDAY_18, FAV_TOPICS, FAV_TOTAL, ZPU, fmtPrice, si } from "./_shared/data";

// Section order for the top nav, the scroll-spy and the footer's Explore column.
const NAV_IDS = [
  "zpu-top",
  "zpu-facts",
  "zpu-interests",
  "zpu-skills",
  // "zpu-items", // Hidden: My Everyday Carry & Accessories
  "zpu-works",
  "zpu-connect",
];
const NAV_LABEL_KEYS: TranslationKey[] = [
  "zpuNavHome",
  "zpuNavAbout",
  "zpuNavInterests",
  "zpuNavSkills",
  // "zpuNavItems", // Hidden: My Everyday Carry & Accessories
  "zpuNavProjects",
  "zpuNavContact",
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

// A live "status" that picks a random thing ZPU is into — reshuffled every refresh.
// All 77 Thai provinces — "Living in" picks a fresh one on every refresh.
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

// Quote card under "Facts About Me" — shows one quote in the currently
// selected site language, rotating on its own.
const QUOTES: Record<"en" | "th" | "zh" | "vi" | "pt", string>[] = [
  { th: "ความฝันจะไม่มีวันทำงาน ถ้าคุณไม่ลงมือ", en: "Dreams don't work unless you do.", zh: "梦想不会自己实现。", vi: "Ước mơ sẽ không tự thành hiện thực.", pt: "Sonhos não funcionam sem você." },
  { th: "ทำวันนี้ให้ดีกว่าเมื่อวาน", en: "Be better than yesterday.", zh: "今天比昨天更好。", vi: "Hôm nay tốt hơn hôm qua.", pt: "Seja melhor do que ontem." },
  { th: "ความสำเร็จคือผลลัพธ์ของการไม่ยอมแพ้", en: "Success is the reward for not giving up.", zh: "成功是不放弃的回报。", vi: "Thành công là phần thưởng của sự không bỏ cuộc.", pt: "O sucesso é a recompensa por não desistir." },
  { th: "ความเร็วไม่สำคัญ ถ้ายังเดินไปข้างหน้า", en: "It doesn't matter how fast you go, as long as you don't stop.", zh: "走得慢没关系，只要不停下。", vi: "Đi chậm không sao, miễn là đừng dừng lại.", pt: "Não importa a velocidade, desde que você continue." },
  { th: "อย่ารอเวลาที่สมบูรณ์แบบ", en: "Don't wait for perfect timing.", zh: "不要等待完美时机。", vi: "Đừng chờ thời điểm hoàn hảo.", pt: "Não espere o momento perfeito." },
  { th: "ลงมือก่อน แล้วค่อยเก่งขึ้นระหว่างทาง", en: "Learn by doing.", zh: "在实践中成长。", vi: "Học bằng cách bắt đầu làm.", pt: "Aprenda fazendo." },
  { th: "ความพยายามไม่มีวันสูญเปล่า", en: "Effort is never wasted.", zh: "努力永远不会白费。", vi: "Mọi nỗ lực đều có giá trị.", pt: "Nenhum esforço é em vão." },
  { th: "อย่าปล่อยให้ความกลัวกำหนดชีวิตคุณ", en: "Don't let fear decide your future.", zh: "不要让恐惧决定你的未来。", vi: "Đừng để nỗi sợ quyết định tương lai của bạn.", pt: "Não deixe o medo decidir seu futuro." },
  { th: "อย่ากลัวการเริ่มใหม่", en: "Never be afraid to start over.", zh: "永远不要害怕重新开始。", vi: "Đừng bao giờ sợ bắt đầu lại.", pt: "Nunca tenha medo de recomeçar." },
  { th: "ทุกความสำเร็จเคยเป็นแค่ความคิด", en: "Every achievement was once just an idea.", zh: "每个成就都曾只是一个想法。", vi: "Mọi thành tựu từng chỉ là một ý tưởng.", pt: "Toda conquista já foi apenas uma ideia." },
  { th: "ชัยชนะที่แท้จริงคือการไม่หยุด", en: "The real victory is refusing to quit.", zh: "真正的胜利是不放弃。", vi: "Chiến thắng thật sự là không bỏ cuộc.", pt: "A verdadeira vitória é não desistir." },
  { th: "ความเงียบคือที่ที่การเติบโตเกิดขึ้น", en: "Growth happens in silence.", zh: "成长发生在安静之中。", vi: "Sự trưởng thành diễn ra trong im lặng.", pt: "O crescimento acontece em silêncio." },
  { th: 'อย่าปล่อยให้คำว่า "สักวัน" กลายเป็น "ไม่เคย"', en: 'Don\'t let "someday" become "never."', zh: '别让“总有一天”变成“永远不会”。', vi: 'Đừng để "một ngày nào đó" trở thành "không bao giờ".', pt: 'Não deixe o "algum dia" virar "nunca".' },
  { th: "ทุกวันที่ยาก กำลังสร้างคุณให้แข็งแกร่งขึ้น", en: "Hard days build strong people.", zh: "艰难的日子造就坚强的人。", vi: "Những ngày khó khăn tạo nên con người mạnh mẽ.", pt: "Dias difíceis formam pessoas fortes." },
  { th: "อย่าหยุดเรียนรู้", en: "Never stop learning.", zh: "永远不要停止学习。", vi: "Đừng bao giờ ngừng học hỏi.", pt: "Nunca pare de aprender." },
  { th: "ทำสิ่งเล็ก ๆ ให้ดี แล้วสิ่งใหญ่จะตามมา", en: "Master the small things first.", zh: "先做好小事，大事自然会来。", vi: "Hãy làm tốt những điều nhỏ trước.", pt: "Domine as pequenas coisas primeiro." },
  { th: "อย่าเสียเวลาเป็นคนอื่น", en: "Don't waste your life being someone else.", zh: "不要浪费生命去成为别人。", vi: "Đừng lãng phí cuộc đời để trở thành người khác.", pt: "Não desperdice sua vida sendo outra pessoa." },
  { th: "อนาคตสร้างจากสิ่งที่คุณทำวันนี้", en: "Tomorrow is built by what you do today.", zh: "明天由今天的行动决定。", vi: "Ngày mai được tạo nên từ việc bạn làm hôm nay.", pt: "O amanhã é construído pelo que você faz hoje." },
  { th: "อย่าปล่อยให้ข้ออ้างใหญ่กว่าความฝัน", en: "Don't let excuses become bigger than your dreams.", zh: "不要让借口比梦想更大。", vi: "Đừng để lý do lớn hơn ước mơ.", pt: "Não deixe as desculpas serem maiores que seus sonhos." },
  { th: "การลงมือคือจุดเริ่มต้นของทุกอย่าง", en: "Action is where everything begins.", zh: "一切都始于行动。", vi: "Hành động là nơi mọi thứ bắt đầu.", pt: "A ação é onde tudo começa." },
  { th: "ไม่มีทางลัดสู่ความยิ่งใหญ่", en: "There are no shortcuts to greatness.", zh: "通往卓越没有捷径。", vi: "Không có đường tắt đến sự vĩ đại.", pt: "Não há atalhos para a grandeza." },
  { th: "ชนะตัวเองทุกวัน", en: "Win against yourself every day.", zh: "每天战胜昨天的自己。", vi: "Chiến thắng chính mình mỗi ngày.", pt: "Vença a si mesmo todos os dias." },
  { th: "จงทำให้ตัวเองมีค่าจนโอกาสต้องตามหา", en: "Become so valuable that opportunities find you.", zh: "让自己足够优秀，机会自然会来。", vi: "Hãy trở nên giá trị để cơ hội tự tìm đến.", pt: "Torne-se tão valioso que as oportunidades encontrem você." },
  { th: "วินัยจะพาคุณไปไกลกว่าแรงจูงใจ", en: "Discipline will take you further than motivation.", zh: "自律比动力更可靠。", vi: "Kỷ luật sẽ đưa bạn đi xa hơn cảm hứng.", pt: "A disciplina leva você mais longe do que a motivação." },
  { th: "อย่าหยุดเพราะคนอื่นไม่เชื่อ", en: "Don't stop because others don't believe.", zh: "不要因为别人不相信就停下。", vi: "Đừng dừng lại chỉ vì người khác không tin.", pt: "Não pare porque os outros não acreditam." },
  { th: "ความล้มเหลวคือบทเรียน ไม่ใช่จุดจบ", en: "Failure is a lesson, not the end.", zh: "失败是课业，不是终点。", vi: "Thất bại là bài học, không phải kết thúc.", pt: "O fracasso é uma lição, não um fim." },
  { th: "ความฝันต้องการการลงมือ ไม่ใช่แค่ความหวัง", en: "Dreams need action, not wishes.", zh: "梦想需要行动，而不仅是幻想。", vi: "Ước mơ cần hành động, không chỉ hy vọng.", pt: "Sonhos precisam de ação, não apenas de desejos." },
  { th: "ทุกก้าวเล็ก ๆ มีความหมาย", en: "Every small step matters.", zh: "每一步都算数。", vi: "Mỗi bước nhỏ đều có ý nghĩa.", pt: "Cada pequeno passo importa." },
  { th: "อย่ากลัวที่จะเติบโต", en: "Don't be afraid to grow.", zh: "不要害怕成长。", vi: "Đừng sợ trưởng thành.", pt: "Não tenha medo de crescer." },
  { th: "เวลาจะผ่านไปอยู่ดี จงใช้มันให้คุ้ม", en: "Time will pass anyway, use it well.", zh: "时间终会流逝，好好利用它。", vi: "Thời gian vẫn sẽ trôi, hãy tận dụng nó.", pt: "O tempo vai passar de qualquer forma, aproveite-o." },
  { th: "ความพยายามในวันนี้ คือความภูมิใจในวันหน้า", en: "Today's effort becomes tomorrow's pride.", zh: "今天的努力，是明天的骄傲。", vi: "Nỗ lực hôm nay là niềm tự hào ngày mai.", pt: "O esforço de hoje será o orgulho de amanhã." },
  { th: "สิ่งที่ยากที่สุด มักคุ้มค่าที่สุด", en: "The hardest things are often the most rewarding.", zh: "最难的事情往往最值得。", vi: "Điều khó nhất thường đáng giá nhất.", pt: "As coisas mais difíceis costumam valer mais a pena." },
  { th: "อย่าให้เมื่อวานกำหนดพรุ่งนี้", en: "Don't let yesterday define tomorrow.", zh: "不要让昨天决定明天。", vi: "Đừng để hôm qua quyết định ngày mai.", pt: "Não deixe o ontem definir o amanhã." },
  { th: "ชีวิตดีขึ้นเมื่อคุณดีขึ้น", en: "Your life improves when you do.", zh: "当你变得更好，生活也会变好。", vi: "Cuộc sống tốt hơn khi bạn tốt hơn.", pt: "Sua vida melhora quando você melhora." },
  { th: "ความฝันใหญ่ เริ่มจากก้าวเล็ก", en: "Big dreams begin with small steps.", zh: "伟大的梦想始于小小的一步。", vi: "Ước mơ lớn bắt đầu từ những bước nhỏ.", pt: "Grandes sonhos começam com pequenos passos." },
  { th: "ทำให้ตัวเองภูมิใจ ไม่ใช่แค่คนอื่น", en: "Make yourself proud, not just others.", zh: "让自己骄傲，而不仅是别人。", vi: "Hãy khiến chính mình tự hào, không chỉ người khác.", pt: "Orgulhe a si mesmo, não apenas os outros." },
  { th: "ไม่มีใครทำแทนคุณได้", en: "No one can do it for you.", zh: "没有人能替你完成。", vi: "Không ai có thể làm thay bạn.", pt: "Ninguém pode fazer isso por você." },
  { th: "จงเป็นเหตุผลที่ทำให้ตัวเองยิ้มได้", en: "Be your own reason to smile.", zh: "成为让自己微笑的理由。", vi: "Hãy là lý do để chính mình mỉm cười.", pt: "Seja o seu próprio motivo para sorrir." },
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

// The heatmap is decorative — there is no tracker behind it. Each day's count
// is hashed from its own date so the pattern is identical on the server and
// the client (no hydration mismatch) and stays put across reloads, instead of
// reshuffling on every visit the way Math.random() would.
function activityCount(dateKey: string): number {
  // FNV-1a — mixes adjacent dates far better than a plain *31 rolling hash,
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
  if (r < idle) return 0; // day off — left uncoloured
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

// GitHub-style contribution heatmap — 12 months ร— 7 days, "Mon 'YY" labels
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
        // Local date parts — toISOString() would shift to UTC and hand the
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
      // Months land ~4.3 columns apart, too tight for "Month, Year" — use a
      // compact "Mon 'YY". The very first column is often a partial month
      // (grid starts mid-month), which would otherwise get its own label
      // just 1-2 columns before the next real one — enforce a minimum gap.
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
      { icon: "📖", labelKey: "zpuFactReadingBook", get: () => pick(ZPU.favBooks).name },
      { icon: "🎧", labelKey: "zpuFactListening", get: () => { const a = pick(ZPU.favArtists); return `${pick(a.songs)} • ${a.name}`; } },
      { icon: "🎮", labelKey: "zpuFactPlaying", get: () => pick(ZPU.favGames).name },
      { icon: "🎬", labelKey: "zpuFactWatchingMovie", get: () => pick(ZPU.favMovies).name },
      { icon: "🍥", labelKey: "zpuFactWatchingAnime", get: () => pick(ZPU.favAnime).name },
      { icon: "📺", labelKey: "zpuFactWatchingSeries", get: () => pick(ZPU.favSeries).name },
      { icon: "📕", labelKey: "zpuFactReadingManga", get: () => pick(ZPU.favManga).name },
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

// Section header — pulls the trailing emoji off the title to use as a left icon,
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
      {d} {t("zpuCdDay")} {pad(h)}:{pad(m)}:{pad(s)} → 18
    </span>
  );
}

// Animated, self-ticking live number (livecounts.io style).
// - Counts up smoothly to `target` whenever it increases (e.g. after a poll).
// - Between polls, drifts up by +1 every 5–17s so it always feels alive,
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

// Fetch YouTube subs straight from the browser — both sources allow CORS (*),
// and the browser's network reaches them reliably even when the host can't.
async function fetchYouTubeSubsClient(): Promise<number | null> {
  // socialcounts — finer "estimation" value.
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
  // mixerno — fallback.
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

// Live stat cards — seeded by the server, then polled every 30s for realtime updates.
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
// is at the current viewport width) instead of an arbitrary item count —
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

export function AboutZpu({ ytSubs, discordMembers }: { ytSubs?: number | null; discordMembers?: number | null }) {
  const { t, lang } = useLang();
  const [showAllWorks, setShowAllWorks] = useState(false);
  const [showAllEdc, setShowAllEdc] = useState(false);

  // Picked once per page load so the "Living in" fact card and the location
  // pill always agree — two independent random picks would show two cities.
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
    { labelKey: "zpuTinyNickname" as const, value: "ZPU / NON 🙂", color: "#22c55e" },
    { labelKey: "zpuTinyStatus" as const, value: "WORK HARD 🔥", color: "#ff6f00" },
  ];

  return (
    <main className="zpu-page" data-theme={theme}>
      <div className="zpu-dots" />
      <ZpuTopbar
        navItems={navItems}
        activeSection={activeSection}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Music player — mounted outside .zpu-wrap so its popup can layer above the header */}
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
            <a
              href={ZPU.works[0].href}
              className="zpu-home-shot"
              target={ZPU.works[0].href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ZPU.works[0].image} alt={ZPU.works[0].name} loading="lazy" />
            </a>
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

        {/* About — bold bento grid */}
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

        {/* Favorites — a shelf of collections. Each card fans out real covers
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

        {/* Everyday items (Hidden) */}
        {/* {ZPU.everyday.length > 0 && (
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
        )} */}

        {/* PC setup / PC Specs (Hidden) */}
        {/* {ZPU.setup.length > 0 && (
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
        )} */}

        {/* Gaming gear / peripherals / PC Setup (Hidden) */}
        {/* {ZPU.gear.length > 0 && (
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
        )} */}

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

