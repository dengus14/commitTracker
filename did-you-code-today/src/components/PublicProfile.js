import { useState, useEffect, useRef } from 'react';
import { usePublicProfile } from '../hooks/usePublicProfile';
import {
  LuGitCommitHorizontal, LuStar, LuGitFork, LuUsers,
  LuBookOpen, LuLink, LuCheck, LuExternalLink,
  LuGitBranch, LuGitPullRequest,
} from 'react-icons/lu';

// ── Language colour map ──────────────────────────────────────────────────────
const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python:  '#3572A5',
  Go:         '#00ADD8', Rust:        '#dea584', HTML:    '#e34c26',
  CSS:        '#563d7c', Java:        '#b07219', 'C++':   '#f34b7d',
  'C#':       '#178600', Swift:       '#F05138', Kotlin:  '#A97BFF',
  Ruby:       '#701516', Shell:       '#89e051', Vue:     '#41b883',
  PHP:        '#4F5D95',
};

// ── Animated counter ─────────────────────────────────────────────────────────
const CountUp = ({ target, duration = 1000 }) => {
  const [val, setVal]   = useState(0);
  const rafRef          = useRef(null);

  useEffect(() => {
    if (!target) return;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return <>{val.toLocaleString()}</>;
};

// ── Time ago ─────────────────────────────────────────────────────────────────
const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Event label ───────────────────────────────────────────────────────────────
const eventLabel = (ev) => {
  const repo = ev.repo?.name?.split('/')[1] ?? ev.repo?.name ?? '';
  switch (ev.type) {
    case 'PushEvent':        return { icon: LuGitCommitHorizontal, text: `Pushed to ${repo}` };
    case 'PullRequestEvent': return { icon: LuGitPullRequest,      text: `PR in ${repo}` };
    case 'CreateEvent':      return { icon: LuGitBranch,           text: `Created ${ev.payload?.ref_type ?? 'ref'} in ${repo}` };
    case 'WatchEvent':       return { icon: LuStar,                text: `Starred ${repo}` };
    case 'ForkEvent':        return { icon: LuGitFork,             text: `Forked ${repo}` };
    default:                 return { icon: LuGitCommitHorizontal, text: `Activity in ${repo}` };
  }
};

// ── Copy button ───────────────────────────────────────────────────────────────
const CopyLinkBtn = ({ url }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return (
    <button className="profile-copy-btn" onClick={copy} aria-label="Copy profile link">
      {copied ? <LuCheck size={14} /> : <LuLink size={14} />}
      <span>{copied ? 'Copied!' : 'Share'}</span>
    </button>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const PublicProfile = ({ username }) => {
  const { profile, repos, events, loading, error } = usePublicProfile(username);
  const [visible, setVisible] = useState(false);

  // Trigger entry animation after mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // ── Loading ──
  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-avatar-skeleton" />
          <div className="profile-skeleton-lines">
            <div className="profile-skeleton-line wide" />
            <div className="profile-skeleton-line medium" />
            <div className="profile-skeleton-line narrow" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !profile) {
    return (
      <div className="profile-page">
        <div className="profile-error-card">
          <div className="profile-error-emoji">🔍</div>
          <h2 className="profile-error-title">
            {error || 'Profile not found'}
          </h2>
          <p className="profile-error-sub">
            Check the username and try again.
          </p>
          <a href="/" className="profile-cta-btn">Go home</a>
        </div>
      </div>
    );
  }

  const profileUrl = window.location.href;
  const filteredEvents = events
    .filter(e => ['PushEvent','PullRequestEvent','CreateEvent','WatchEvent','ForkEvent'].includes(e.type))
    .slice(0, 6);

  // Language breakdown from repos
  const langCounts = {};
  repos.forEach(r => { if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1; });
  const topLangs = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="profile-page">
      {/* Decorative blobs */}
      <div className="profile-blob profile-blob-1" aria-hidden="true" />
      <div className="profile-blob profile-blob-2" aria-hidden="true" />

      <div className={`profile-card ${visible ? 'profile-card--visible' : ''}`}>

        {/* ── Hero section ── */}
        <div className="profile-hero profile-section">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar-ring" />
            <img
              src={profile.avatar_url}
              alt={`${profile.login}'s avatar`}
              className="profile-avatar-img"
            />
          </div>

          <div className="profile-identity">
            <div className="profile-name-row">
              <h1 className="profile-name">{profile.name || profile.login}</h1>
              <a
                href={`https://github.com/${profile.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-gh-link"
                aria-label="Open GitHub profile"
              >
                <LuExternalLink size={14} />
              </a>
            </div>
            <p className="profile-login">@{profile.login}</p>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            {profile.location && (
              <p className="profile-location">📍 {profile.location}</p>
            )}
          </div>

          <div className="profile-actions">
            <CopyLinkBtn url={profileUrl} />
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="profile-stats profile-section">
          <div className="profile-stat">
            <div className="profile-stat-icon icon-blue"><LuBookOpen size={15} /></div>
            <div className="profile-stat-value">
              <CountUp target={profile.public_repos} />
            </div>
            <div className="profile-stat-label">Repos</div>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <div className="profile-stat-icon icon-green"><LuUsers size={15} /></div>
            <div className="profile-stat-value">
              <CountUp target={profile.followers} />
            </div>
            <div className="profile-stat-label">Followers</div>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <div className="profile-stat-icon icon-purple"><LuUsers size={15} /></div>
            <div className="profile-stat-value">
              <CountUp target={profile.following} />
            </div>
            <div className="profile-stat-label">Following</div>
          </div>
        </div>

        {/* ── Languages ── */}
        {topLangs.length > 0 && (
          <div className="profile-section">
            <h2 className="profile-section-title">Languages</h2>
            <div className="profile-langs">
              {topLangs.map(([lang]) => (
                <span key={lang} className="profile-lang-tag">
                  <span
                    className="profile-lang-dot"
                    style={{ background: LANG_COLORS[lang] || '#8b949e' }}
                  />
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Top repos ── */}
        {repos.length > 0 && (
          <div className="profile-section">
            <h2 className="profile-section-title">Top Repositories</h2>
            <div className="profile-repos">
              {repos.map((repo, i) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-repo-card"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="profile-repo-name">{repo.name}</div>
                  {repo.description && (
                    <div className="profile-repo-desc">{repo.description}</div>
                  )}
                  <div className="profile-repo-meta">
                    {repo.language && (
                      <span className="profile-repo-lang">
                        <span
                          className="profile-lang-dot"
                          style={{ background: LANG_COLORS[repo.language] || '#8b949e' }}
                        />
                        {repo.language}
                      </span>
                    )}
                    <span className="profile-repo-stat">
                      <LuStar size={11} /> {repo.stargazers_count}
                    </span>
                    <span className="profile-repo-stat">
                      <LuGitFork size={11} /> {repo.forks_count}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent activity ── */}
        {filteredEvents.length > 0 && (
          <div className="profile-section">
            <h2 className="profile-section-title">Recent Activity</h2>
            <div className="profile-activity">
              {filteredEvents.map((ev, i) => {
                const { icon: Icon, text } = eventLabel(ev);
                return (
                  <div
                    key={ev.id}
                    className="profile-activity-item"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="profile-activity-icon">
                      <Icon size={12} />
                    </div>
                    <span className="profile-activity-text">{text}</span>
                    <span className="profile-activity-time">{timeAgo(ev.created_at)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CTA footer ── */}
        <div className="profile-footer">
          <p className="profile-footer-text">
            Track your own coding streak
          </p>
          <a href="/" className="profile-cta-btn">
            <LuGitCommitHorizontal size={14} />
            Start tracking
          </a>
        </div>

      </div>
    </div>
  );
};

export default PublicProfile;
