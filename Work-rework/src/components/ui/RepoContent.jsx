import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { fetchRepoContents, getHtmlUrl, getArchiveUrl, fetchCommits } from '../../services/api';
import Loader from './Loader';
import FileIcon from './FileIcon';
import './repo-content.css';

const DownloadIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1024 1024"
    className={className}
  >
    <path
      fill="currentColor"
      d="M505.7 661a8 8 0 0 0 12.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8"
    />
  </svg>
);

DownloadIcon.propTypes = {
  className: PropTypes.string,
};

const RepoContent = ({ studentId, studentName, studentAvatar, repositoryName, onBack, onBackToStudents }) => {
  const [contents, setContents] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [pathHistory, setPathHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('files'); // 'files' or 'commits'
  const [commits, setCommits] = useState([]);
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [totalCommits, setTotalCommits] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [hasNext, setHasNext] = useState(false);
  const [expandedCommits, setExpandedCommits] = useState(new Set());
  const abortControllerRef = useRef(null);
  const commitsLoadingRef = useRef(false);

  useEffect(() => {
    if (viewMode === 'files') {
      loadContents(currentPath);
    }

    // Cleanup function - only abort on component unmount, not on path change
    return () => {
      // Don't abort here - let loadContents handle it
    };
  }, [currentPath, studentId, viewMode]);

  const loadContents = async (path) => {
    // Cancel previous request only if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    // Set timeout for large repositories (45 seconds)
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 45000);

    try {
      const data = await fetchRepoContents(studentId, repositoryName, path, controller.signal);

      clearTimeout(timeoutId);

      // Check if this specific request was aborted (not just any request)
      if (controller.signal.aborted) {
        console.log('Request was aborted for path:', path);
        return;
      }

      // Check if we're still working with the same controller
      if (abortControllerRef.current !== controller) {
        console.log('Controller changed, ignoring results for path:', path);
        return;
      }

      if (Array.isArray(data)) {
        setContents(data);
      } else if (data && Array.isArray(data.items)) {
        setContents(data.items);
      } else if (data && Array.isArray(data.Items)) {
        setContents(data.Items);
      } else if (data && Array.isArray(data.contents)) {
        setContents(data.contents);
      } else if (data && Array.isArray(data.files)) {
        setContents(data.files);
      } else {
        console.error('Unexpected data format:', data);
        setContents([]);
      }

      setIsLoading(false);
    } catch (err) {
      clearTimeout(timeoutId);

      // Only show error if this controller is still active
      if (abortControllerRef.current !== controller) {
        console.log('Controller changed during error, ignoring error for path:', path);
        return;
      }

      if (err.name === 'AbortError') {
        // Only show timeout error if the request took long time (not cancelled by user navigation)
        setError('Запрос прервался. Попробуйте еще раз.');
        setIsLoading(false);
        return;
      }

      // Handle specific error codes
      if (err.status === 400) {
        setError('Ошибка запроса: неверный формат данных или путь');
      } else if (err.status === 404) {
        setError('Репозиторий или путь не найдены');
      } else if (err.status === 500) {
        setError('Ошибка сервера. Попробуйте позже');
      } else if (err.status === 502 || err.status === 503 || err.status === 504) {
        setError('Сервер временно недоступен');
      } else {
        setError(`Не удалось загрузить содержимое: ${err.message || 'неизвестная ошибка'}`);
      }

      console.error('Error loading repository contents:', err);
      setIsLoading(false);
    }
  };

  const handleItemClick = (item) => {
    if (item.type === 'dir') {
      setPathHistory([...pathHistory, currentPath]);
      setCurrentPath(item.path);
    } else if (item.type === 'file') {
      if (item.name.toLowerCase().endsWith('.html')) {
        const htmlUrl = getHtmlUrl(studentId, repositoryName, item.path);
        window.open(htmlUrl, '_blank');
      } else if (item.download_url) {
        window.open(item.download_url, '_blank');
      }
    }
  };

  const handleBack = () => {
    if (pathHistory.length > 0) {
      const newHistory = [...pathHistory];
      const previousPath = newHistory.pop();
      setPathHistory(newHistory);
      setCurrentPath(previousPath);
    }
  };

  const loadCommits = async (page = 1, itemsPerPage = 15) => {
    if (commitsLoadingRef.current) return; // Prevent duplicate requests

    commitsLoadingRef.current = true;
    setCommitsLoading(true);
    try {
      const data = await fetchCommits(studentId, repositoryName, page, itemsPerPage);
      console.log('API returned commits:', data.commits?.length, 'Page:', data.page);
      setCommits(data.commits || []);
      setTotalCommits(data.count || 0);
      setCurrentPage(data.page || page);
      setPerPage(data.per_page || itemsPerPage);
      setHasNext(data.has_next || false);
    } catch (err) {
      console.error('Failed to load commits:', err);
      setCommits([]);
      setHasNext(false);
    } finally {
      setCommitsLoading(false);
      commitsLoadingRef.current = false;
    }
  };

  const handleHistoryClick = () => {
    setViewMode('commits');
    setCurrentPage(1);
    loadCommits(1);
  };

  const handleBackToFiles = () => {
    setViewMode('files');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1) {
      loadCommits(newPage, perPage);
    }
  };

  const toggleCommit = (index) => {
    const newExpanded = new Set(expandedCommits);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCommits(newExpanded);
  };


  const hasPhoto = Boolean(studentAvatar && studentAvatar.trim());

  return (
    <div className="repo-content-wrapper">
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
      <div className="repo-content-container">
        <div className="repo-content-header">
          <div className="repo-content-title-row">
            <div className="repo-navigation-buttons">
              {onBackToStudents && (
                <button
                  className="repo-back-to-students-btn"
                  onClick={onBackToStudents}
                  title="К списку студентов"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                    <path fill="currentColor" fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                  </svg>
                  <span>Студенты</span>
                </button>
              )}
              {onBack && (
                <button
                  className="repo-back-to-repos-btn"
                  onClick={onBack}
                  title="К репозиториям"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                    <path fill="currentColor" fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                  </svg>
                  <span>Репозитории</span>
                </button>
              )}
            </div>
            <div className="repo-content-title">
              <h2>{repositoryName}</h2>
              <span className="repo-view-mode">
                {viewMode === 'commits' ? ' • История коммитов' : ' • Файлы'}
              </span>
            </div>
            <div className="repo-header-actions">
              {viewMode === 'files' ? (
                <>
                  <a
                    href={getArchiveUrl(studentId, repositoryName, '')}
                    className="repo-history-btn"
                    title="Скачать весь репозиторий как ZIP"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DownloadIcon className="repo-download-icon" />
                    <span>Скачать ZIP</span>
                  </a>
                  <button className="repo-history-btn" onClick={handleHistoryClick} title="История коммитов">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>История</span>
                  </button>
                </>
              ) : (
                <button className="repo-history-btn" onClick={handleBackToFiles} title="Назад к файлам">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <span>К файлам</span>
                </button>
              )}
            </div>
          </div>
          {viewMode === 'files' && (
            <div className="repo-content-navigation">
              {pathHistory.length > 0 && (
                <button className="repo-back-btn" onClick={handleBack}>
                  Назад к папке
                </button>
              )}
              <div className="repo-current-path">
                {currentPath || 'Корневая директория'}
              </div>
            </div>
          )}
        </div>

        <div className="repo-content-body">
          {viewMode === 'files' ? (
            // Files view
            isLoading ? (
              <div className="repo-content-loader">
                <Loader type="spinner" />
              </div>
            ) : error ? (
              <div className="repo-content-error">{error}</div>
            ) : contents.length === 0 ? (
              <div className="repo-content-empty">Папка пуста</div>
            ) : (
            <div className="repo-items-list">
              <div className="repo-list-header">
                <div className="repo-list-header-icon"></div>
                <div className="repo-list-header-name">Название</div>
                <div className="repo-list-header-date">Дата изменения</div>
                <div className="repo-list-header-download"></div>
              </div>
              {contents.map((item, index) => {
                const isClickable = item.type === 'dir' || item.type === 'file';

                // Format date if available
                const formatDate = (dateString) => {
                  if (!dateString) return '—';

                  // Check for default/zero date (Go's zero time)
                  if (dateString === '0001-01-01T00:00:00Z' || dateString.startsWith('0001-01-01')) {
                    return '—';
                  }

                  const date = new Date(dateString);
                  if (isNaN(date.getTime())) return '—';

                  const now = new Date();
                  const diffMs = now - date;
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                  const time = date.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  if (diffDays === 0) {
                    return `Сегодня ${time}`;
                  } else if (diffDays === 1) {
                    return `Вчера в ${time}`;
                  } else if (diffDays < 7) {
                    return `${diffDays} дн. назад ${time}`;
                  } else {
                    const dateStr = date.toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    });
                    return `${dateStr} ${time}`;
                  }
                };

                return (
                  <div
                    key={index}
                    className={`repo-list-item ${isClickable ? 'clickable' : ''}`}
                    onClick={() => isClickable && handleItemClick(item)}
                  >
                    <div className="repo-list-item-icon">
                      <FileIcon type={item.type} name={item.name} size={24} />
                    </div>
                    <div className="repo-list-item-name">
                      {item.name}
                    </div>
                    <div className="repo-list-item-date">
                      {formatDate(item.modified_date || item.last_modified || item.updated_at)}
                    </div>
                    <div className="repo-list-item-download">
                      {item.type === 'dir' && (
                        <a
                          href={getArchiveUrl(studentId, repositoryName, item.path)}
                          className="repo-download-link"
                          onClick={(e) => e.stopPropagation()}
                          title="Скачать папку как ZIP"
                        >
                          <DownloadIcon className="repo-download-icon" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )
          ) : (
            // Commits view
            commitsLoading ? (
              <div className="repo-content-loader">
                <Loader type="spinner" />
              </div>
            ) : commits.length === 0 ? (
              <div className="repo-content-empty">Коммиты не найдены</div>
            ) : (
              <>
                <div className="repo-commits-list">
                  {commits.map((commit, index) => {
                    const isExpanded = expandedCommits.has(index);
                    const formatDate = (dateString) => {
                      if (!dateString) return '—';
                      const date = new Date(dateString);
                      if (isNaN(date.getTime())) return '—';

                      const now = new Date();
                      const diffMs = now - date;
                      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                      const time = date.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      if (diffDays === 0) {
                        return `Сегодня ${time}`;
                      } else if (diffDays === 1) {
                        return `Вчера в ${time}`;
                      } else if (diffDays < 7) {
                        return `${diffDays} дн. назад ${time}`;
                      } else {
                        const dateStr = date.toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        });
                        return `${dateStr} ${time}`;
                      }
                    };

                    return (
                      <div key={index} className="repo-commit-item">
                        <div
                          className="repo-commit-header"
                          onClick={() => toggleCommit(index)}
                        >
                          <div className="repo-commit-info">
                            <div className="repo-commit-message">{commit.message}</div>
                            <div className="repo-commit-meta">
                              <span className="repo-commit-date">{formatDate(commit.date)}</span>
                              <span className="repo-commit-files-count">
                                {commit.files?.length || 0} файл(ов)
                              </span>
                            </div>
                          </div>
                          <div className={`repo-commit-toggle ${isExpanded ? 'expanded' : ''}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 12 15 18 9"/>
                            </svg>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="repo-commit-files">
                            {commit.files && commit.files.length > 0 ? (
                              commit.files.map((file, fileIndex) => (
                                <div key={fileIndex} className="repo-commit-file">
                                  <FileIcon type="file" name={file.filename} size={16} />
                                  <span>{file.filename}</span>
                                </div>
                              ))
                            ) : (
                              <div className="repo-commit-no-files">Нет измененных файлов</div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {(currentPage > 1 || hasNext) && (
                  <div className="repo-commits-pagination">
                    <button
                      className="repo-pagination-btn"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ← Назад
                    </button>
                    <div className="repo-pagination-info">
                      Страница {currentPage} • {totalCommits}
                    </div>
                    <button
                      className="repo-pagination-btn"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNext}
                    >
                      Вперёд →
                    </button>
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

RepoContent.propTypes = {
  studentId: PropTypes.string.isRequired,
  studentName: PropTypes.string.isRequired,
  studentAvatar: PropTypes.string,
  repositoryName: PropTypes.string.isRequired,
  onBack: PropTypes.func,
  onBackToStudents: PropTypes.func,
};

export default RepoContent;
