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
import {
  LuHouse, LuCalendar, LuChartBar, LuFlame, LuTrophy,
  LuLogOut, LuChevronsRight, LuChevronDown,
  LuGitCommitHorizontal, LuDatabase, LuCalendarDays,
  LuTrendingUp, LuMoon, LuSun, LuRefreshCw, LuActivity,
} from 'react-icons/lu';

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'dashboard',    Icon: LuHouse,   label: 'Dashboard' },
  { id: 'calendar',     Icon: LuCalendar, label: 'Calendar' },
  { id: 'languages',    Icon: LuChartBar, label: 'Languages' },
  { id: 'streak',       Icon: LuFlame,   label: 'Streak' },
  { id: 'achievements', Icon: LuTrophy,  label: 'Achievements' },
];

const NavItem = ({ Icon, label, isActive, open, onClick }) => (
  <button
    onClick={onClick}
    className={`sidebar-nav-item${isActive ? ' active' : ''}`}
    title={!open ? label : undefined}
  >
    <span className="sidebar-nav-icon"><Icon size={16} /></span>
    {open && <span className="sidebar-nav-label">{label}</span>}
  </button>
);

const AppSidebar = ({ open, setOpen, selected, setSelected, user, logout, theme, toggleTheme }) => (
  <nav className={`app-sidebar${open ? ' open' : ' closed'}`}>
    {/* Logo + User */}
    <div className="sidebar-title-section">
      <div className="sidebar-title-inner">
        <div className="sidebar-logo-wrap">
          <div className="sidebar-logo-icon">
            <LuGitCommitHorizontal size={18} />
          </div>
          {open && user && (
            <div className="sidebar-user-info">
              {user.avatarUrl && (
                <img src={user.avatarUrl} alt={user.username} className="sidebar-avatar" />
              )}
              <div>
                <span className="sidebar-username-text">{user.displayName || user.username}</span>
                <span className="sidebar-github-text">@{user.username}</span>
              </div>
            </div>
          )}
        </div>
        {open && <LuChevronDown size={14} className="sidebar-chevron" />}
      </div>
    </div>

    {/* Primary Nav */}
    <div className="sidebar-nav">
      {NAV_ITEMS.map(({ id, Icon, label }) => (
        <NavItem
          key={id}
          Icon={Icon}
          label={label}
          isActive={selected === id}
          open={open}
          onClick={() => setSelected(id)}
        />
      ))}
    </div>

    {/* Account */}
    <div className="sidebar-account-section">
      {open && <div className="sidebar-section-label">Account</div>}
      <button
        className="sidebar-nav-item"
        onClick={toggleTheme}
        title={!open ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
      >
        <span className="sidebar-nav-icon">
          {theme === 'dark' ? <LuSun size={16} /> : <LuMoon size={16} />}
        </span>
        {open && <span className="sidebar-nav-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
      </button>
      <button
        className="sidebar-nav-item sidebar-nav-item-danger"
        onClick={logout}
        title={!open ? 'Logout' : undefined}
      >
        <span className="sidebar-nav-icon"><LuLogOut size={16} /></span>
        {open && <span className="sidebar-nav-label">Logout</span>}
      </button>
    </div>

    {/* Toggle */}
    <button className="sidebar-toggle-btn" onClick={() => setOpen(!open)}>
      <div className="sidebar-toggle-inner">
        <LuChevronsRight
          size={16}
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 300ms ease', flexShrink: 0 }}
        />
        {open && <span className="sidebar-toggle-label">Hide</span>}
      </div>
    </button>
  </nav>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, iconClass, label, value, trend }) => (
  <div className="stat-card-21">
    <div className="stat-card-21-top">
      <div className={`stat-card-21-icon ${iconClass}`}>
        <Icon size={18} />
      </div>
      {trend && <LuTrendingUp size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />}
    </div>
    <div className="stat-card-21-label">{label}</div>
    <div className="stat-card-21-value">{value ?? '—'}</div>
    {trend && <div className="stat-card-21-trend">{trend}</div>}
  </div>
);

// ─── Dashboard View ───────────────────────────────────────────────────────────

const DashboardView = ({ commitStats, loading, streakData, checkCommits, user }) => {
  const getMessage = () => {
    if (loading) return null;
    if (commitStats?.todayCount > 0)
      return `${commitStats.todayCount} commit${commitStats.todayCount !== 1 ? 's' : ''} today — keep it going!`;
    if (commitStats) return "Looks like someone is taking a break, huh?";
    return null;
  };

  const msg = getMessage();

  return (
    <div className="dashboard-page">
      {msg && <p className="dashboard-custom-message">{msg}</p>}

      {/* Stats Grid */}
      {commitStats && !loading && (
        <div className="stats-grid-21">
          <StatCard
            icon={LuGitCommitHorizontal}
            iconClass="icon-blue"
            label="Commits Today"
            value={commitStats.todayCount}
            trend={commitStats.todayCount > 0 ? 'Active today' : null}
          />
          <StatCard
            icon={LuDatabase}
            iconClass="icon-green"
            label="Active Repos"
            value={commitStats.todayRepos}
            trend={commitStats.todayRepos > 1 ? 'Multiple repos' : null}
          />
          <StatCard
            icon={LuCalendarDays}
            iconClass="icon-purple"
            label="This Week"
            value={commitStats.thisWeekCount}
            trend={null}
          />
          <StatCard
            icon={LuFlame}
            iconClass="icon-orange"
            label="Current Streak"
            value={streakData?.currentStreak ?? '—'}
            trend={
              streakData?.currentStreak > 0
                ? `${streakData.currentStreak} day${streakData.currentStreak !== 1 ? 's' : ''}`
                : null
            }
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
        <div className="content-grid-21">
          {/* Activity Feed */}
          <div className="panel-card">
            <div className="panel-card-header">
              <span className="panel-card-title">
                <LuActivity size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Recent Activity
              </span>
              <button
                className="panel-card-action"
                onClick={() => checkCommits(user?.username)}
                disabled={loading}
              >
                <LuRefreshCw size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Refresh
              </button>
            </div>
            <ActivityFeed events={commitStats.events} />
          </div>

          {/* Right Panel */}
          <div className="right-panel-stack">
            {/* Streak mini */}
            {streakData && (
              <div className="panel-card">
                <div className="panel-card-header">
                  <span className="panel-card-title">
                    <LuFlame size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--warning)' }} />
                    Streak
                  </span>
                </div>
                <div className="streak-mini-grid">
                  <div className="streak-mini-item">
                    <div className="streak-mini-value">{streakData.currentStreak}</div>
                    <div className="streak-mini-label">Current</div>
                  </div>
                  <div className="streak-mini-divider" />
                  <div className="streak-mini-item">
                    <div className="streak-mini-value">{streakData.longestStreak}</div>
                    <div className="streak-mini-label">Longest</div>
                  </div>
                </div>
                {streakData.longestStreak > 0 && streakData.currentStreak < streakData.longestStreak && (
                  <p className="streak-mini-message">
                    Keep going! Your record is {streakData.longestStreak} days.
                  </p>
                )}
                {streakData.currentStreak > 0 && streakData.currentStreak === streakData.longestStreak && (
                  <p className="streak-mini-message" style={{ color: 'var(--success)' }}>
                    You're on your personal best!
                  </p>
                )}
              </div>
            )}

            {/* Last Commit */}
            {commitStats.lastCommit && (
              <div className="panel-card">
                <div className="panel-card-header">
                  <span className="panel-card-title">Last Commit</span>
                  {commitStats.lastCommit.isToday && (
                    <span className="badge-today">Today</span>
                  )}
                </div>
                <div className="last-commit-card">
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {commitStats.lastCommit.repo}
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 11, marginLeft: 6 }}>
                      #{commitStats.lastCommit.sha?.slice(0, 7)}
                    </span>
                  </div>
                  <div style={{ marginTop: 6, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    "{commitStats.lastCommit.message}"
                  </div>
                  <div style={{ marginTop: 6, color: 'var(--text-muted)', fontSize: 11 }}>
                    {commitStats.lastCommit.time}
                  </div>
                </div>
              </div>
            )}

            {/* API info */}
            {commitStats.apiInfo && (
              <p className="api-disclaimer-mini">
                Checking {commitStats.apiInfo.reposChecked} most active repos
              </p>
            )}
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
            open={sidebarOpen}
            setOpen={setSidebarOpen}
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
              <div>
                <h1 className="app-page-title">{meta.title}</h1>
                <p className="app-page-subtitle">{meta.subtitle}</p>
              </div>
              <div className="app-header-actions">
                <button className="header-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
                  {theme === 'dark' ? <LuSun size={16} /> : <LuMoon size={16} />}
                </button>
                {user.avatarUrl && (
                  <img src={user.avatarUrl} alt={user.username} className="header-avatar" title={user.username} />
                )}
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
