"use client";

import { FormEvent, useMemo, useState } from "react";

type FortuneResult = {
  summary: string;
  love: string;
  money: string;
  workStudy: string;
  luckyItem: string;
  avoid: string;
  closingJoke: string;
};

const initialResult: FortuneResult = {
  summary: "",
  love: "",
  money: "",
  workStudy: "",
  luckyItem: "",
  avoid: "",
  closingJoke: "",
};

type FortuneCardKey = "summary" | "love" | "money" | "workStudy" | "luckyItem" | "avoid";

const fortuneCards: Array<{ key: FortuneCardKey; title: string; emoji: string }> = [
  { key: "summary", title: "오늘 총운", emoji: "🌤️" },
  { key: "love", title: "연애운", emoji: "💘" },
  { key: "money", title: "금전운", emoji: "💸" },
  { key: "workStudy", title: "직장·학업운", emoji: "🧠" },
  { key: "luckyItem", title: "행운 아이템", emoji: "🍀" },
  { key: "avoid", title: "피해야 할 것", emoji: "🚧" },
];

export default function Home() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [mbti, setMbti] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<FortuneResult>(initialResult);

  const canSubmit = useMemo(() => name.trim().length > 0 && birthDate.length > 0 && !loading, [name, birthDate, loading]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          birthDate,
          mbti: mbti.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "운세 생성 중 오류가 발생했습니다.");
      }

      setResult(data.fortune as FortuneResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell min-h-screen px-4 pb-10 pt-6 text-slate-900 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">
      <div className="mx-auto w-full max-w-6xl">
        <section className="glass-panel hero-sheen reveal-fade rounded-[2rem] p-5 sm:p-8 lg:p-10">
          <h1 className="font-display text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">오늘의 운세 🔮</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
            밈 감성으로 보는 오늘의 흐름. 이름 + 생년월일만 넣으면 AI가 오늘의 총운을 재밌게 정리해줘요.
          </p>

          <form onSubmit={onSubmit} className="mt-7 grid gap-4 lg:grid-cols-12" aria-busy={loading}>
            <label htmlFor="fortune-name" className="lg:col-span-4">
              <span className="mb-2 block text-sm font-semibold text-slate-800">이름 (필수)</span>
              <input
                id="fortune-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 배실장"
                autoComplete="name"
                required
                className="input-glass px-4 py-3 text-[15px] outline-none"
              />
            </label>

            <label htmlFor="fortune-birth-date" className="lg:col-span-4">
              <span className="mb-2 block text-sm font-semibold text-slate-800">생년월일 (필수)</span>
              <input
                id="fortune-birth-date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
                className="input-glass px-4 py-3 text-[15px] outline-none"
              />
            </label>

            <label htmlFor="fortune-mbti" className="lg:col-span-4">
              <span className="mb-2 block text-sm font-semibold text-slate-800">MBTI (선택)</span>
              <input
                id="fortune-mbti"
                value={mbti}
                maxLength={4}
                onChange={(e) => setMbti(e.target.value.toUpperCase())}
                placeholder="예: ENTP"
                autoCapitalize="characters"
                className="input-glass px-4 py-3 text-[15px] uppercase outline-none"
              />
            </label>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center lg:col-span-12">
              <button
                type="submit"
                disabled={!canSubmit}
                aria-disabled={!canSubmit}
                className="action-button inline-flex min-h-12 items-center justify-center px-5 py-3 text-base font-bold tracking-tight text-white"
              >
                {loading ? "운세 뽑는 중..." : "오늘 운세 보기"}
              </button>
              <p
                className={`min-h-5 text-sm ${error ? "font-medium text-rose-700" : "text-transparent"}`}
                role={error ? "alert" : "status"}
                aria-live="polite"
              >
                {error || "\u00A0"}
              </p>
            </div>
          </form>
        </section>

        <section className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
          {fortuneCards.map((card, index) => (
            <Card
              key={card.key}
              title={card.title}
              content={result[card.key]}
              emoji={card.emoji}
              animationDelay={index * 70}
            />
          ))}
        </section>

        <section
          className="glass-card reveal-fade mt-4 rounded-3xl p-5 sm:p-6"
          style={{ animationDelay: `${fortuneCards.length * 70}ms` }}
        >
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">마무리 드립 🎤</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 sm:text-base">
            {result.closingJoke || "운세를 먼저 뽑아보면 오늘의 한 줄 드립이 뜹니다."}
          </p>
        </section>
      </div>
    </main>
  );
}

function Card({ title, content, emoji, animationDelay }: { title: string; content: string; emoji: string; animationDelay: number }) {
  return (
    <article className="glass-card reveal-fade rounded-3xl p-5 sm:p-6" style={{ animationDelay: `${animationDelay}ms` }}>
      <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
        <span className="mr-2" aria-hidden="true">
          {emoji}
        </span>
        {title}
      </h2>
      <p className="mt-3 min-h-20 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 sm:text-base">
        {content || "운세 결과가 여기에 표시됩니다."}
      </p>
    </article>
  );
}
