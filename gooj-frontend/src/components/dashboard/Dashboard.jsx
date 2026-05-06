import { useEffect, useState } from 'react'
import ProblemList from './ProblemList'
import StatCards from './StatCards'
import Leaderboard from './Leaderboard'
import RecentSubmissions from './RecentSubmissions'
import ContestList from './ContestList'
import { StatCardSkeleton, ProblemListSkeleton, LeaderboardSkeleton } from '../common/LoadingSkeleton'
import { api } from '../../api/client'

export default function Dashboard({
  problems, selected, onSelect, query, setQuery,
  profile, leaderboard, submissions, contests, loading, onSearch,
}) {
  const [announcements, setAnnouncements] = useState([])
  const [showAnn, setShowAnn] = useState(true)

  useEffect(() => {
    api.getAnnouncements()
      .then(setAnnouncements)
      .catch(() => {})
  }, [])

  if (loading) {
    return (
      <>
        <StatCardSkeleton />
        <div className="mt-4 grid grid-cols-[320px_1fr_340px] items-start gap-4 max-xl:grid-cols-[300px_1fr] max-lg:grid-cols-1">
          <ProblemListSkeleton />
          <div className="ark-panel min-h-[360px] animate-pulse p-6" />
          <LeaderboardSkeleton />
        </div>
      </>
    )
  }

  return (
    <>
      {announcements.length > 0 && showAnn && (
        <div className="ark-panel-soft mb-4 animate-slide-up overflow-hidden border-l-[3px] border-l-[var(--ark-amber)]">
          {announcements.slice(0, 1).map((a) => (
            <div key={a.id} className="flex items-start gap-3 px-4 py-3">
              <span className="ark-kicker mt-0.5 shrink-0">NOTICE</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black">{a.title}</div>
                {a.content && <p className="mt-1 text-xs text-white/60">{a.content}</p>}
              </div>
              <button onClick={() => setShowAnn(false)} className="text-xs text-white/30 hover:text-white">✕</button>
            </div>
          ))}
        </div>
      )}

      <section className="ark-panel ark-image-grain mb-5 min-h-[440px] overflow-hidden p-6 sm:p-9">
        <div className="absolute inset-0 bg-[url('/assets/arkoj-hero.png')] bg-cover bg-[center_right_16%] opacity-100 max-sm:bg-[center_right_28%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/98 via-black/80 to-black/16 max-sm:from-black/96 max-sm:via-black/80 max-sm:to-black/58" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/80 to-transparent" />
        <div className="ark-alert-tape absolute bottom-0 left-0 h-3 w-full" />
        <div className="absolute right-5 top-5 hidden border border-white/15 bg-black/30 px-3 py-2 text-xs font-black text-white/35 lg:block">
          ARKOJ / 01
        </div>
        <div className="ark-watermark absolute bottom-8 right-8 hidden text-[140px] leading-none lg:block">
          01
        </div>
        <div className="ark-watermark absolute -left-3 top-20 hidden -rotate-90 text-7xl leading-none xl:block">
          ARKOJ
        </div>
        <div className="relative max-w-2xl max-sm:max-w-[315px]">
          <div className="ark-kicker">Operator Control Deck</div>
          <h2 className="mt-3 max-w-xl text-5xl font-black leading-tight tracking-tight max-md:text-4xl max-sm:text-3xl">
            <span className="ark-title-slab">ArkOJ</span>
            <span className="mt-2 block text-3xl text-white/92 max-sm:text-2xl">算法作战终端</span>
          </h2>
          <div className="ark-terminal-rule mt-5 w-56" />
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/74">
            以任务档案、战术看板和代码终端组织判题流程。选择题目，编写代码，提交判定，所有状态都像作战记录一样清晰展开。
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelect(selected)}
              className="ark-corner-label px-5 py-3 text-sm font-black"
            >
              进入当前题目
            </button>
            <span className="ark-tag px-3 py-2">ACTIVE #{selected?.id || '--'}</span>
            <span className="ark-tag border-[var(--ark-red)]/50 px-3 py-2 text-[var(--ark-red)]">TACTICAL MODE</span>
          </div>
        </div>
      </section>

      <StatCards profile={profile} submissionCount={submissions.length} problemCount={problems.length} />

      <div className="grid grid-cols-[320px_minmax(0,1fr)_340px] items-start gap-4 max-xl:grid-cols-[300px_1fr] max-lg:grid-cols-1">
        <div className="max-lg:order-2">
          <ProblemList
            problems={problems}
            selected={selected}
            onSelect={onSelect}
            query={query}
            setQuery={setQuery}
            onSearch={onSearch}
          />
        </div>

        <div className="space-y-4 max-lg:order-1">
          <div className="ark-panel ark-image-grain overflow-hidden p-5">
            <div className="absolute inset-0 bg-[url('/assets/arkoj-ops-card.png')] bg-cover bg-center opacity-42" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#101419]/96 via-[#101419]/82 to-[#101419]/40" />
            <div className="absolute right-3 top-3 border border-white/15 px-2 py-1 text-[10px] font-black text-white/32">BR-01</div>
            <div className="relative">
              <div className="ark-kicker">Briefing</div>
              <h2 className="mt-2 text-xl font-black leading-tight">当前任务</h2>
              <div className="mt-4 border-l-4 border-[var(--ark-red)] pl-4">
                <div className="text-sm font-black">{selected?.title || '暂无题目'}</div>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  {selected?.description || '从题库中选择一道题目开始。'}
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {(selected?.tags || []).map((tag) => (
                  <span key={tag} className="ark-tag px-2.5 py-1">{tag}</span>
                ))}
                <span className="ark-tag px-2.5 py-1">{selected?.difficulty || 'Easy'}</span>
              </div>
            </div>
          </div>

          <ContestList contests={contests} />
        </div>

        <div className="space-y-4 max-xl:col-span-2 max-lg:order-3 max-lg:col-span-1">
          <OperatorCard />
          <div className="ark-panel-soft p-4">
            <Leaderboard users={leaderboard} />
          </div>
          <div className="ark-panel-soft p-4">
            <RecentSubmissions submissions={submissions} />
          </div>
        </div>
      </div>
    </>
  )
}

function OperatorCard() {
  return (
    <div className="ark-image-panel relative min-h-[320px]">
      <img
        src="/assets/arkoj-operator.png"
        alt="ArkOJ tactical operator"
        className="absolute inset-0 h-full w-full object-cover object-[center_18%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/18 to-black/16" />
      <div className="ark-alert-tape absolute left-0 top-0 h-full w-2" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="ark-kicker">Operator File</div>
        <div className="mt-1 text-lg font-black">系统分析员 / ArkOJ</div>
        <p className="mt-2 text-xs leading-5 text-white/62">
          负责题目调度、提交追踪与终端状态监控。
        </p>
      </div>
    </div>
  )
}
