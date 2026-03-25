import { LuActivity, LuGitCommitHorizontal, LuGitPullRequest, LuGitBranch, LuMessageSquare, LuStar } from 'react-icons/lu';

const formatTimeAgo = (dateString) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const parseEvent = (event) => {
  switch (event.type) {
    case 'PushEvent': {
      const count = event.payload?.size ?? event.payload?.distinct_size ?? event.payload?.commits?.length ?? 0;
      const repo = event.repo?.name?.split('/')[1] || event.repo?.name;
      const countText = count > 0 ? `${count} commit${count !== 1 ? 's' : ''} ` : '';
      return {
        type: 'PushEvent',
        repo,
        count,
        icon: LuGitCommitHorizontal,
        text: `Pushed ${countText}to ${repo}`,
        color: 'green',
      };
    }
    case 'PullRequestEvent': {
      const action = event.payload?.action;
      const pr = event.payload?.pull_request?.title;
      const repo = event.repo?.name?.split('/')[1] || event.repo?.name;
      const verb = action === 'opened' ? 'Opened' : (action === 'closed' && event.payload?.pull_request?.merged) ? 'Merged' : 'Closed';
      return {
        type: 'PullRequestEvent',
        repo,
        icon: LuGitPullRequest,
        text: `${verb} PR "${pr}" in ${repo}`,
        color: 'blue',
      };
    }
    case 'CreateEvent': {
      const refType = event.payload?.ref_type;
      const ref = event.payload?.ref;
      const repo = event.repo?.name?.split('/')[1] || event.repo?.name;
      return {
        type: 'CreateEvent',
        repo,
        icon: LuGitBranch,
        text: refType === 'branch' ? `Created branch ${ref} in ${repo}` : `Created ${refType} ${repo}`,
        color: 'purple',
      };
    }
    case 'IssueCommentEvent': {
      const repo = event.repo?.name?.split('/')[1] || event.repo?.name;
      return {
        type: 'IssueCommentEvent',
        repo,
        icon: LuMessageSquare,
        text: `Commented on an issue in ${repo}`,
        color: 'yellow',
      };
    }
    case 'WatchEvent': {
      const repo = event.repo?.name?.split('/')[1] || event.repo?.name;
      return {
        type: 'WatchEvent',
        repo,
        icon: LuStar,
        text: `Starred ${repo}`,
        color: 'yellow',
      };
    }
    default:
      return null;
  }
};

// Merge consecutive PushEvents to the same repo into one item
const groupEvents = (items) => {
  const grouped = [];
  for (const item of items) {
    const prev = grouped[grouped.length - 1];
    if (item.type === 'PushEvent' && prev?.type === 'PushEvent' && prev.repo === item.repo) {
      prev.count += item.count;
      const countText = prev.count > 0 ? `${prev.count} commit${prev.count !== 1 ? 's' : ''} ` : '';
      prev.text = `Pushed ${countText}to ${prev.repo}`;
    } else {
      grouped.push({ ...item });
    }
  }
  return grouped;
};

const ActivityFeed = ({ events }) => {
  if (!events || events.length === 0) return null;

const parsed = groupEvents(
    events
      .map(e => ({ ...parseEvent(e), time: e.created_at }))
      .filter(Boolean)
  ).slice(0, 8);

  if (parsed.length === 0) return null;

  return (
    <div className="activity-feed">
      <h3 className="activity-feed-title">
        <LuActivity size={13} /> Recent Activity
      </h3>
      <ul className="activity-list">
        {parsed.map((item, i) => (
          <li key={i} className="activity-item">
            <span className={`activity-icon activity-icon-${item.color}`}>
              <item.icon size={13} />
            </span>
            <span className="activity-text">{item.text}</span>
            <span className="activity-time">{formatTimeAgo(item.time)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;
