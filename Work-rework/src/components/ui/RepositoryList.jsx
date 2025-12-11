import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchUserRepositories } from '../../services/api';
import Loader from './Loader';
import './repository-list.css';

const RepositoryCard = ({ repository, onClick }) => {
  const getRepoIcon = (repoName) => {
    const name = repoName.toLowerCase();

    // Определение типа репозитория по имени
    if (name.includes('work') || name === 'work' || name.includes('работа')) {
      return {
        icon: (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="repo-icon">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#8A2BE2"/>
            <path d="M8 8H16M8 12H14M8 16H12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
        color: '#8A2BE2'
      };
    }

    if (name.includes('personal') || name.includes('pet') || name.includes('project')) {
      return {
        icon: (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="repo-icon">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#FF6B6B"/>
            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ),
        color: '#FF6B6B'
      };
    }

    if (name.includes('lab') || name.includes('praktika') || name.includes('practice') || name.includes('лаб')) {
      return {
        icon: (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="repo-icon">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="#4ECDC4"/>
            <path d="M9 3V7M15 3V7M9 7H7C5.89543 7 5 7.89543 5 9V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V9C19 7.89543 18.1046 7 17 7H15M9 7H15" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="14" r="2" fill="#fff"/>
          </svg>
        ),
        color: '#4ECDC4'
      };
    }

    // Default Git icon for unknown repositories
    return {
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="repo-icon">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#64748B"/>
          <path d="M11.5 7L16.5 12L11.5 17L6.5 12L11.5 7Z" fill="#fff"/>
        </svg>
      ),
      color: '#64748B'
    };
  };

  const { icon, color } = getRepoIcon(repository.name);

  return (
    <div
      className="repository-card"
      onClick={onClick}
      style={{ '--repo-color': color }}
    >
      <div className="repository-card-icon">
        {icon}
      </div>
      <div className="repository-card-content">
        <h3 className="repository-card-name">{repository.name}</h3>
        {repository.description && (
          <p className="repository-card-description">{repository.description}</p>
        )}
      </div>
      <div className="repository-card-arrow">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

RepositoryCard.propTypes = {
  repository: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

const RepositoryList = ({ studentId, studentName, studentAvatar, onBack, onSelectRepository }) => {
  const [repositories, setRepositories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const loadRepositories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchUserRepositories(studentId);
        setRepositories(data.repositories || []);
        setCount(data.count || 0);
      } catch (err) {
        console.error('Error loading repositories:', err);
        setError('Не удалось загрузить репозитории');
      } finally {
        setIsLoading(false);
      }
    };

    loadRepositories();
  }, [studentId]);

  const handleRepositoryClick = (repository) => {
    if (onSelectRepository) {
      onSelectRepository(repository);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Trigger re-load by updating a dependency (simplest way)
    const loadRepositories = async () => {
      try {
        const data = await fetchUserRepositories(studentId);
        setRepositories(data.repositories || []);
        setCount(data.count || 0);
      } catch (err) {
        console.error('Error loading repositories:', err);
        setError('Не удалось загрузить репозитории');
      } finally {
        setIsLoading(false);
      }
    };
    loadRepositories();
  };

  const hasPhoto = Boolean(studentAvatar && studentAvatar.trim());

  return (
    <div className="repository-list-wrapper">
      {/* Student Photo Sidebar */}
      <div className="repo-student-sidebar">
        {hasPhoto ? (
          <img src={studentAvatar} alt={studentName} className="repo-student-photo" />
        ) : (
          <div className="repo-no-photo">Нет фото</div>
        )}
        <div className="repo-student-info">
          <div className="repo-student-name">{studentName}</div>
          <div className="repo-student-id">{studentId}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="repository-list-container">
        <div className="repository-list-header">
          <div className="repo-content-title-row">
            {onBack && (
              <button className="repo-back-to-students-btn" onClick={onBack} title="К списку студентов">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                  <path fill="currentColor" fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                </svg>
              </button>
            )}
            <div className="repo-content-title">
              <h2>Репозитории</h2>
            </div>
          </div>
        </div>

        <div className="repository-list-body">
          {isLoading ? (
            <div className="repository-list-loader">
              <Loader type="spinner" />
            </div>
          ) : error ? (
            <div className="repository-list-error">
              <div>{error}</div>
              <button className="retry-button" onClick={handleRetry}>
                Попробовать снова
              </button>
            </div>
          ) : repositories.length === 0 ? (
            <div className="repository-list-empty">У студента нет репозиториев</div>
          ) : (
            <div className="repository-cards-grid">
              {repositories.map((repo, index) => (
                <RepositoryCard
                  key={repo.name || index}
                  repository={repo}
                  onClick={() => handleRepositoryClick(repo)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

RepositoryList.propTypes = {
  studentId: PropTypes.string.isRequired,
  studentName: PropTypes.string.isRequired,
  studentAvatar: PropTypes.string,
  onBack: PropTypes.func,
  onSelectRepository: PropTypes.func.isRequired,
};

export default RepositoryList;
