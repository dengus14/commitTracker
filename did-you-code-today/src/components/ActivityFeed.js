const formatTimeAgo = (dateString) => {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const parseEvent = (event) => {
  switch (event.type) {
    case 'PushEvent': {
      const count = event.payload?.size ?? event.payload?.distinct_size ?? event.payload?.commits?.length ?? 0;
      const repo = event.repo?.name?.split('/')[1] || event.repo?.name;
      return { type: 'PushEvent', repo, count, prefix: 'Pushed to', color: 'green' };
    }
    case 'PullRequestEvent': {
      const action = event.payload?.action;
      const repo = event.repo?.name?.split('/')[1] || event.repo?.name;
      const verb = action === 'opened' ? 'Opened PR in' : (action === 'closed' && event.payload?.pull_request?.merged) ? 'Merged PR in' : 'Closed PR in';
      return { type: 'PullRequestEvent', repo, prefix: verb, color: 'blue' };
    }
    case 'CreateEvent': {
      const refType = event.payload?.ref_type;
      const repo = event.repo?.name?.split('/')[1] || event.repo?.name;
      const prefix = refType === 'branch' ? 'Created branch in' : 'Created repo';
      return { type: 'CreateEvent', repo, prefix, color: 'purple' };
    }
    case 'IssueCommentEvent': {
      const repo = event.repo?.name?.split('/')[1] || event.repo?.name;
      return { type: 'IssueCommentEvent', repo, prefix: 'Commented in', color: 'blue' };
    }
    case 'WatchEvent': {
      const repo = event.repo?.name?.split('/')[1] || event.repo?.name;
      return { type: 'WatchEvent', repo, prefix: 'Starred', color: 'purple' };
    }
    default:
      return null;
  }
};

// Merge consecutive PushEvents to the same repo
const groupEvents = (items) => {
  const grouped = [];
  for (const item of items) {
    const prev = grouped[grouped.length - 1];
    if (item.type === 'PushEvent' && prev?.type === 'PushEvent' && prev.repo === item.repo) {
      prev.count += item.count;
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
      <ul className="activity-list">
        {parsed.map((item, i) => (
          <li key={i} className="activity-item">
            <span className={`activity-dot activity-dot-${item.color}`} />
            <span className="activity-text">
              {item.prefix} <strong>{item.repo}</strong>
            </span>
            <span className="activity-time">{formatTimeAgo(item.time)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;
