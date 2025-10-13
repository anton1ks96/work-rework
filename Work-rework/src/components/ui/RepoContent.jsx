import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchRepoContents, getHtmlUrl } from '../../services/api';
import Loader from './Loader';
import FileIcon from './FileIcon';
import './repo-content.css';

const RepoContent = ({ studentId, studentName, onBack }) => {
  const [contents, setContents] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [pathHistory, setPathHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadContents(currentPath);
  }, [currentPath, studentId]);

  const loadContents = async (path) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRepoContents(studentId, path);
      if (Array.isArray(data)) {
        setContents(data);
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
    } catch (err) {
      setError('Не удалось загрузить содержимое репозитория');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item) => {
    if (item.type === 'dir') {
      setPathHistory([...pathHistory, currentPath]);
      setCurrentPath(item.path);
    } else if (item.type === 'file' && item.name.toLowerCase().endsWith('.html')) {
      // Open HTML file in new tab via API endpoint
      const htmlUrl = getHtmlUrl(studentId, item.path);
      window.open(htmlUrl, '_blank');
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


  return (
    <div className="repo-content-container">
      <div className="repo-content-header">
        <div className="repo-content-title-row">
          {onBack && (
            <button className="repo-back-to-students-btn" onClick={onBack}>
              ← К списку студентов
            </button>
          )}
          <div className="repo-content-title">
            <h2>Репозиторий: {studentId}</h2>
            <p>{studentName}</p>
          </div>
        </div>
        <div className="repo-content-navigation">
          {pathHistory.length > 0 && (
            <button className="repo-back-btn" onClick={handleBack}>
              ← Назад к папке
            </button>
          )}
          <div className="repo-current-path">
            {currentPath || 'Корневая директория'}
          </div>
        </div>
      </div>

      <div className="repo-content-body">
        {isLoading ? (
          <div className="repo-content-loader">
            <Loader type="spinner" />
          </div>
        ) : error ? (
          <div className="repo-content-error">{error}</div>
        ) : contents.length === 0 ? (
          <div className="repo-content-empty">Папка пуста</div>
        ) : (
          <div className="repo-items-grid">
            {contents.map((item, index) => {
              const isHtmlFile = item.type === 'file' && item.name.toLowerCase().endsWith('.html');
              const isClickable = item.type === 'dir' || isHtmlFile;

              return (
                <div
                  key={index}
                  className={`repo-item-card ${isClickable ? 'clickable' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="repo-item-icon">
                    <FileIcon type={item.type} name={item.name} size={40} />
                  </div>
                  <div className="repo-item-name">{item.name}</div>
                  {item.type === 'dir' && <div className="repo-item-badge">Папка</div>}
                  {isHtmlFile && <div className="repo-item-badge">Открыть</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

RepoContent.propTypes = {
  studentId: PropTypes.string.isRequired,
  studentName: PropTypes.string.isRequired,
  onBack: PropTypes.func,
};

export default RepoContent;
