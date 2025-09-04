import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguageStats } from '../hooks/useLanguageStats';

const LanguageStats = () => {
  const { user } = useAuth();
  const { loading, languageData, error, fetchLanguageStats } = useLanguageStats();

  useEffect(() => {
    if (user && user.username) {
      fetchLanguageStats(user.username);
    }
  }, [user, fetchLanguageStats]);

  const languageColors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'C#': '#239120',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'Dart': '#00B4AB',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'SCSS': '#c6538c',
    'Vue': '#2c3e50',
    'React': '#61DAFB',
    'Shell': '#89e051',
    'PowerShell': '#012456',
    'Dockerfile': '#384d54',
    'JSON': '#292929',
    'YAML': '#cb171e',
    'Markdown': '#083fa1',
    'SQL': '#336791',
    'R': '#198CE7',
    'MATLAB': '#e16737',
    'Jupyter Notebook': '#DA5B0B',
    'Objective-C': '#438eff',
    'Perl': '#0298c3',
    'Scala': '#c22d40',
    'Haskell': '#5e5086',
    'Lua': '#000080',
    'Vim script': '#199f4b',
    'Makefile': '#427819',
  };

  const getLanguageColor = (language) => {
    return languageColors[language] || '#8e8e93'; 
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="language-stats">
        <div className="language-stats-header">
          <h3>📊 Language Statistics</h3>
        </div>
        <div className="language-stats-loading">
          <div className="loading-spinner"></div>
          <p>Analyzing your repositories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="language-stats">
        <div className="language-stats-header">
          <h3>📊 Language Statistics</h3>
        </div>
        <div className="language-stats-error">
          <p>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (!languageData || !languageData.languages || languageData.languages.length === 0) {
    return (
      <div className="language-stats">
        <div className="language-stats-header">
          <h3>📊 Language Statistics</h3>
        </div>
        <div className="language-stats-empty">
          <p>No language data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="language-stats">
      <div className="language-stats-header">
        <h3>📊 Language Statistics</h3>
        <div className="stats-summary">
          <span className="total-languages">{languageData.languages.length} languages</span>
          <span className="total-size">{formatBytes(languageData.totalBytes)}</span>
        </div>
      </div>

      <div className="language-list">
        {languageData.languages.map((language, index) => (
          <div key={language.name} className="language-item">
            <div className="language-info">
              <div className="language-name-section">
                <div 
                  className="language-color-dot"
                  style={{ backgroundColor: getLanguageColor(language.name) }}
                ></div>
                <span className="language-name">{language.name}</span>
              </div>
              <div className="language-stats-section">
                <span className="language-percentage">{language.percentage}%</span>
                <span className="language-size">{formatBytes(language.bytes)}</span>
              </div>
            </div>
            <div className="language-bar-container">
              <div 
                className="language-bar"
                style={{ 
                  width: `${language.percentage}%`,
                  backgroundColor: getLanguageColor(language.name)
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="language-stats-footer">
        <small>
          📁 Data from {languageData.reposChecked} repositories
        </small>
        {user && (
          <button 
            className="refresh-languages-btn"
            onClick={() => fetchLanguageStats(user.username)}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        )}
      </div>
    </div>
  );
};

export default LanguageStats;
