import "./index.css";
import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { AchievementProvider } from "./context/AchievementContext";
import { useCommitData } from "./hooks/useCommitData";
import { useStreakData } from "./hooks/useStreakDataPersisted";
import GitHubAuth from "./components/GitHubAuth";
import CommitChecker from "./components/CommitChecker";
import StatusMessage from "./components/StatusMessage";
import CommitStats from "./components/CommitStats";
import Divider from "./components/Divider";
import Footer from "./components/Footer";
import ActivityFeed from "./components/ActivityFeed";
import MiniCalendar from "./components/MiniCalendar";
import LanguageStats from "./components/LanguageStats";
import StreakDisplay from "./components/StreakDisplay";
import Achievements from "./components/Achievements";
import ThemeToggle from "./components/ThemeToggle";
import CommitChart from "./components/CommitChart";
import { useCommitChart } from "./hooks/useCommitChart";
import {
  LuHouse, LuCalendar, LuChartBar, LuFlame, LuTrophy,
  LuLogOut, LuSettings,
  LuGitCommitHorizontal, LuDatabase, LuCalendarDays,
  LuMoon, LuSun, LuRefreshCw, LuActivity, LuShare2, LuChartColumn,
} from 'react-icons/lu';

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'dashboard',    Icon: LuHouse,   label: 'Dashboard' },
  { id: 'calendar',     Icon: LuCalendar, label: 'Calendar' },
  { id: 'languages',    Icon: LuChartBar, label: 'Languages' },
  { id: 'streak',       Icon: LuFlame,   label: 'Streak' },
  { id: 'achievements', Icon: LuTrophy,  label: 'Achievements' },
];

const AppSidebar = ({ selected, setSelected, user, logout, theme, toggleTheme }) => (
  <nav className="app-sidebar">
    {/* Logo */}
    <div className="rail-logo">
      <div className="rail-logo-icon">
        <LuGitCommitHorizontal size={18} />
      </div>
    </div>

    {/* Primary Nav */}
    <div className="rail-nav">
      {NAV_ITEMS.map(({ id, Icon, label }) => (
        <button
          key={id}
          className={`rail-nav-item${selected === id ? ' active' : ''}`}
          title={label}
          onClick={() => setSelected(id)}
        >
          <Icon size={18} />
        </button>
      ))}
    </div>

    {/* Bottom — theme + logout + avatar */}
    <div className="rail-bottom">
      <button
        className="rail-nav-item"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      >
        {theme === 'dark' ? <LuSun size={18} /> : <LuMoon size={18} />}
      </button>
      <button
        className="rail-nav-item"
        onClick={logout}
        title="Logout"
      >
        <LuLogOut size={18} />
      </button>
      {user?.avatarUrl && (
        <img
          src={user.avatarUrl}
          alt={user.username}
          className="rail-avatar"
          title={user.username}
        />
      )}
    </div>
  </nav>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, iconClass, label, value }) => (
  <div className="stat-card-21">
    <div className={`stat-card-21-icon ${iconClass}`}>
      <Icon size={18} />
    </div>
    <div className="stat-card-21-body">
      <div className="stat-card-21-value">{value ?? '—'}</div>
      <div className="stat-card-21-label">{label}</div>
    </div>
  </div>
);

// ─── Dashboard View ───────────────────────────────────────────────────────────

const getMotivation = (streak) => {
  if (!streak || streak === 0) return ['Start your streak today.', ''];
  if (streak < 3)  return ["You're just getting started.", "Keep showing up."];
  if (streak < 7)  return ["You're building momentum.", "Don't break the chain."];
  if (streak < 14) return ["You're on fire this week.", "Don't break the chain."];
  return ["You're unstoppable.", "Don't break the chain."];
};

const DashboardView = ({ commitStats, loading, streakData, checkCommits, user, chartDays, chartLoading }) => {
  const totalCommits = chartDays?.reduce((s, d) => s + d.count, 0) ?? 0;
  const activeDays   = chartDays?.filter(d => d.count > 0).length ?? 0;
  const [line1, line2] = getMotivation(streakData?.currentStreak);

  return (
    <div className="dashboard-page">
      {/* Streak Hero */}
      {!loading && streakData && (
        <div className="streak-hero fadeup">
          <div className="streak-hero-glow" />
          <div className="streak-hero-left">
            <div className="streak-hero-number">{streakData.currentStreak ?? 0}</div>
            <div className="streak-hero-label">Day Streak</div>
          </div>
          <div className="streak-hero-right">
            <p className="streak-hero-headline">
              <span className="streak-hero-hl">{line1}</span>
              {line2 && <><br />{line2}</>}
            </p>
            <div className="streak-hero-meta">
              <div className="streak-hero-stat">
                <span className="streak-hero-stat-label">Longest</span>
                <span className="streak-hero-stat-value">{streakData.longestStreak ?? 0}</span>
              </div>
              <div className="streak-hero-stat">
                <span className="streak-hero-stat-label">This Month</span>
                <span className="streak-hero-stat-value">{totalCommits}</span>
              </div>
              <div className="streak-hero-stat">
                <span className="streak-hero-stat-label">Active Days</span>
                <span className="streak-hero-stat-value">{activeDays}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat Pills */}
      {commitStats && !loading && (
        <div className="stats-grid-21 fadeup fadeup-1">
          <StatCard
            icon={LuGitCommitHorizontal}
            iconClass="icon-lime"
            label="commits today"
            value={commitStats.todayCount}
          />
          <StatCard
            icon={LuDatabase}
            iconClass="icon-coral"
            label="active repos"
            value={commitStats.todayRepos}
          />
          <StatCard
            icon={LuCalendarDays}
            iconClass="icon-blue"
            label="this week"
            value={commitStats.thisWeekCount}
          />
        </div>
      )}

      {loading && (
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>Checking your activity...</p>
        </div>
      )}

      {/* Content Grid */}
      {commitStats && !loading && (
        <div className="content-grid-21 fadeup fadeup-2">

          {/* Commit Chart — 5fr left */}
          <div className="panel-card commit-chart-panel">
            <div className="panel-card-header">
              <span className="panel-card-title">LAST 30 DAYS</span>
              {totalCommits > 0 && (
                <span className="badge-today">{totalCommits} commits</span>
              )}
            </div>
            <CommitChart days={chartDays} loading={chartLoading} />
            {commitStats.lastCommit && (
              <div className="chart-panel-footer">
                <span><strong>{activeDays}</strong> active days</span>
                <span className="chart-footer-dot" />
                <span>Last commit <strong>{commitStats.lastCommit.time}</strong></span>
              </div>
            )}
          </div>

          {/* Activity Feed — 3fr right */}
          <div className="panel-card activity-feed-panel">
            <div className="panel-card-header">
              <span className="panel-card-title">ACTIVITY</span>
            </div>
            <ActivityFeed events={commitStats.events} />
          </div>

        </div>
      )}
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { loading, status, commitStats, checkCommits } = useCommitData();
  const { streakData, calculateStreak } = useStreakData();
  const { days: chartDays, loading: chartLoading } = useCommitChart();
  const [navSelected, setNavSelected] = useState('dashboard');

  useEffect(() => {
    if (user && user.username) {
      checkCommits(user.username);
      calculateStreak(user.username);
    }
  }, [user, checkCommits, calculateStreak]);

  const PAGE_META = {
    dashboard:    { title: 'Dashboard',    subtitle: `Welcome back, ${user?.displayName || user?.username || 'coder'}` },
    calendar:     { title: 'Calendar',     subtitle: 'Your commit activity at a glance' },
    languages:    { title: 'Languages',    subtitle: 'Your most used programming languages' },
    streak:       { title: 'Streak',       subtitle: 'Your coding consistency over time' },
    achievements: { title: 'Achievements', subtitle: 'Badges you\'ve earned' },
  };

  const meta = PAGE_META[navSelected] || PAGE_META.dashboard;

  if (authLoading) {
    return (
      <div className="app-container">
        <div className="main-card">
          <div className="auth-loading">
            <h2>Checking authentication...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <AchievementProvider>
        <div className="app-shell">
          <AppSidebar
            selected={navSelected}
            setSelected={setNavSelected}
            user={user}
            logout={logout}
            theme={theme}
            toggleTheme={toggleTheme}
          />

          <div className="app-main">
            {/* Header */}
            <div className="app-header-bar">
              <p className="app-header-greeting">
                Welcome back, <strong>{user?.displayName || user?.username}</strong>
              </p>
              <div className="app-header-actions">
                <span className="date-chip">
                  <LuCalendar size={12} />
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <button
                  className="header-icon-btn"
                  onClick={() => { checkCommits(user?.username); calculateStreak(user?.username); }}
                  aria-label="Refresh"
                  title="Refresh"
                >
                  <LuRefreshCw size={15} />
                </button>
              </div>
            </div>

            {/* Page Content */}
            {navSelected === 'dashboard' && (
              <DashboardView
                commitStats={commitStats}
                loading={loading}
                streakData={streakData}
                checkCommits={checkCommits}
                user={user}
                chartDays={chartDays}
                chartLoading={chartLoading}
              />
            )}
            {navSelected === 'calendar' && (
              <div className="section-page"><MiniCalendar /></div>
            )}
            {navSelected === 'languages' && (
              <div className="section-page"><LanguageStats /></div>
            )}
            {navSelected === 'streak' && (
              <div className="section-page"><StreakDisplay /></div>
            )}
            {navSelected === 'achievements' && (
              <div className="section-page"><Achievements /></div>
            )}

            <Footer />
          </div>
        </div>
      </AchievementProvider>
    );
  }

  // ── Unauthenticated ──
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="title">Commit Tracker</h1>
        <div className="header-actions">
          <ThemeToggle />
        </div>
      </header>
      <div className="unauth-layout">
        <div className="main-card">
          <p className="subtitle">Track your daily coding activity on GitHub</p>
          <GitHubAuth />
          <Divider text="or check manually" />
          <CommitChecker onCheck={checkCommits} loading={loading} />
          <StatusMessage status={status} loading={loading} />
          <CommitStats commitStats={commitStats} loading={loading} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
