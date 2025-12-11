import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchUserRepositories } from '../../services/api';
import Loader from './Loader';
import './repository-list.css';

const RepositoryCard = ({ repository, onClick }) => {
  const getRepoColor = (repoName) => {
    const name = repoName.toLowerCase();

    // Определение цвета репозитория по имени
    if (name.includes('work') || name === 'work' || name.includes('работа')) {
      return '#8A2BE2'; // Фиолетовый для основного репо
    }

    // Серый для всех остальных
    return '#64748B';
  };

  const color = getRepoColor(repository.name);

  return (
    <div
      className="repository-card"
      onClick={onClick}
      style={{ '--repo-color': color }}
    >
      <div className="repository-card-icon" style={{ color: color }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" className="repo-icon">
          <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5">
            <path d="M4 19V5a2 2 0 0 1 2-2h13.4a.6.6 0 0 1 .6.6v13.114"/>
            <path strokeLinejoin="round" d="M15 17v5l2.5-1.6L20 22v-5"/>
            <path d="M6 17h14"/>
            <path strokeLinejoin="round" d="M6 17a2 2 0 1 0 0 4h5.5"/>
          </g>
        </svg>
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
