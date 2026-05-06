import ProblemList from './ProblemList'
import StatCards from './StatCards'
import Leaderboard from './Leaderboard'
import RecentSubmissions from './RecentSubmissions'
import ContestList from './ContestList'
import { StatCardSkeleton, ProblemListSkeleton, LeaderboardSkeleton } from '../common/LoadingSkeleton'

export default function Dashboard({
  problems, selected, onSelect, query, setQuery,
  profile, leaderboard, submissions, contests, loading,
}) {
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
      <section className="ark-panel mb-5 min-h-[360px] overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 bg-[url('/assets/operator-terminal.png')] bg-cover bg-center opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/94 via-black/76 to-black/18 max-sm:from-black/92 max-sm:via-black/72 max-sm:to-black/48" />
        <div className="absolute bottom-0 left-0 h-2 w-full bg-[var(--ark-red)]" />
        <div className="absolute bottom-4 right-5 hidden text-8xl font-black leading-none text-white/10 lg:block">
          01
        </div>
        <div className="relative max-w-xl max-sm:max-w-[310px]">
          <div className="ark-kicker">Operator Control Deck</div>
          <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight max-sm:text-3xl">
            算法作战终端
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-7 text-white/72">
            选择题目、编写代码、提交判题。界面已经切换为战术档案风格，左侧是任务列表，中部是当前作战入口，右侧同步排行榜和提交记录。
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelect(selected)}
              className="ark-button-primary px-5 py-3 text-sm font-black"
            >
              进入当前题目
            </button>
            <span className="ark-tag px-3 py-2">ACTIVE #{selected?.id || '--'}</span>
          </div>
        </div>
      </section>

      <StatCards profile={profile} submissionCount={submissions.length} problemCount={problems.length} />

      <div className="grid grid-cols-[320px_1fr_340px] items-start gap-4 max-xl:grid-cols-[300px_1fr] max-lg:grid-cols-1">
        <div className="max-lg:order-2">
          <ProblemList
            problems={problems}
            selected={selected}
            onSelect={onSelect}
            query={query}
            setQuery={setQuery}
          />
        </div>

        <div className="space-y-4 max-lg:order-1">
          <div className="ark-panel p-5">
            <div className="ark-kicker">Briefing</div>
            <h2 className="mt-2 text-xl font-black leading-tight">当前任务</h2>
            <div className="mt-4 border-l-4 border-[var(--ark-red)] pl-4">
              <div className="text-sm font-black">{selected?.title || '暂无题目'}</div>
              <p className="mt-2 text-sm leading-6 text-white/60">
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

          <ContestList contests={contests} />
        </div>

        <div className="space-y-4 max-xl:col-span-2 max-lg:order-3 max-lg:col-span-1">
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
