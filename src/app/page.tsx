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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0%,_#d5e8ff_28%,_#fce7ff_58%,_#fff4c2_100%)] p-5 md:p-10 text-zinc-900">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[2rem] border border-white/50 bg-white/35 p-6 shadow-[0_20px_60px_rgba(58,35,125,0.20)] backdrop-blur-xl md:p-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">오늘의 운세 🔮</h1>
          <p className="mt-3 text-sm md:text-base text-zinc-700">
            밈 감성으로 보는 오늘의 흐름. 이름 + 생년월일만 넣으면 AI가 오늘의 총운을 재밌게 정리해줘요.
          </p>

          <form onSubmit={onSubmit} className="mt-7 grid gap-4 md:grid-cols-3">
            <label className="md:col-span-1">
              <span className="mb-1 block text-sm font-semibold">이름 (필수)</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 배실장"
                className="w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 outline-none ring-0 placeholder:text-zinc-500 focus:border-violet-400"
              />
            </label>

            <label className="md:col-span-1">
              <span className="mb-1 block text-sm font-semibold">생년월일 (필수)</span>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 outline-none focus:border-violet-400"
              />
            </label>

            <label className="md:col-span-1">
              <span className="mb-1 block text-sm font-semibold">MBTI (선택)</span>
              <input
                value={mbti}
                maxLength={4}
                onChange={(e) => setMbti(e.target.value.toUpperCase())}
                placeholder="예: ENTP"
                className="w-full rounded-xl border border-white/70 bg-white/70 px-4 py-3 outline-none placeholder:text-zinc-500 focus:border-violet-400"
              />
            </label>

            <div className="md:col-span-3 mt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-500 px-5 py-3 text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "운세 뽑는 중..." : "오늘 운세 보기"}
              </button>
              {error ? <p className="text-sm text-rose-700">{error}</p> : null}
            </div>
          </form>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <Card title="오늘 총운" content={result.summary} emoji="🌤️" />
          <Card title="연애운" content={result.love} emoji="💘" />
          <Card title="금전운" content={result.money} emoji="💸" />
          <Card title="직장·학업운" content={result.workStudy} emoji="🧠" />
          <Card title="행운 아이템" content={result.luckyItem} emoji="🍀" />
          <Card title="피해야 할 것" content={result.avoid} emoji="🚧" />
        </section>

        <section className="mt-4 rounded-3xl border border-white/60 bg-white/40 p-5 shadow-[0_10px_35px_rgba(48,39,117,.18)] backdrop-blur-xl">
          <h2 className="font-extrabold text-xl">마무리 드립 🎤</h2>
          <p className="mt-2 text-zinc-800 whitespace-pre-wrap">{result.closingJoke || "운세를 먼저 뽑아보면 오늘의 한 줄 드립이 뜹니다."}</p>
        </section>
      </div>
    </main>
  );
}

function Card({ title, content, emoji }: { title: string; content: string; emoji: string }) {
  return (
    <article className="rounded-3xl border border-white/60 bg-white/40 p-5 shadow-[0_10px_35px_rgba(48,39,117,.18)] backdrop-blur-xl">
      <h2 className="font-extrabold text-xl">{emoji} {title}</h2>
      <p className="mt-2 text-zinc-800 whitespace-pre-wrap min-h-16">{content || "운세 결과가 여기에 표시됩니다."}</p>
    </article>
  );
}
