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
        <div className="mt-4 grid grid-cols-[300px_1fr_320px] gap-4 items-start max-lg:grid-cols-1">
          <ProblemListSkeleton />
          <div className="min-h-[250px] animate-pulse rounded-2xl border border-white/70 bg-white/60 p-6 dark:border-white/5 dark:bg-white/5" />
          <LeaderboardSkeleton />
        </div>
      </>
    )
  }

  return (
    <>
      <StatCards profile={profile} submissionCount={submissions.length} />

      <div className="grid grid-cols-[300px_1fr_320px] gap-4 items-start max-lg:grid-cols-1">
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
          <div className="group rounded-2xl border border-white/70 bg-gradient-to-br from-white/90 via-white/80 to-purple-50/60 p-6 shadow-sm transition hover:shadow-md dark:border-white/5 dark:from-[#1e1933]/90 dark:via-[#1e1933]/80 dark:to-purple-900/20">
            <h2 className="text-xl font-black leading-tight">开始刷题</h2>
            <p className="mt-2 text-sm leading-relaxed opacity-70 max-w-md">
              选择左侧题目进入答题页面，使用带语法高亮的编辑器编写代码，提交后实时查看判题结果。
            </p>
            <button onClick={() => onSelect(selected)}
              className="mt-4 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5 active:scale-[0.97]">
              进入当前题目 →
            </button>
          </div>

          <ContestList contests={contests} />
        </div>

        <div className="space-y-4 max-lg:order-3">
          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm transition hover:shadow-md dark:border-white/5 dark:bg-[#1e1933]/80">
            <Leaderboard users={leaderboard} />
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm transition hover:shadow-md dark:border-white/5 dark:bg-[#1e1933]/80">
            <RecentSubmissions submissions={submissions} />
          </div>
        </div>
      </div>
    </>
  )
}
