import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Loader from './Loader';
import './student-card.css';

const StudentCard = ({ user, onClick }) => {
  const hasPhoto = Boolean(user.avatar_path && user.avatar_path.trim());
  const isGold = user.id === 'i24s0024' || user.id === 'i24s0291' || user.id === 'i24s0002';
  const [loading, setLoading] = useState(hasPhoto);

  useEffect(() => { if (!hasPhoto) setLoading(false); }, [hasPhoto]);

  const handleLoad = () => setLoading(false);
  const handleError = (e) => { e.target.style.display = 'none'; setLoading(false); };

  const handleClick = () => {
    if (onClick) {
      onClick(user);
    }
  };

  return (
    <div className={`student-card cardEnter ${isGold ? 'gold' : ''}`} onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="media-wrapper">
        {loading && <div className="image-loader"><Loader type="spinner" className="inner" /></div>}
        {hasPhoto ? (
          <img src={user.avatar_path} alt={`${user.last_name} ${user.first_name}`} onLoad={handleLoad} onError={handleError} />
        ) : (
          <div className="no-photo">Нет фото</div>
        )}
        <div className="overlay-info">
          <div className="id">{user.id}</div>
          <div className="fio">{user.last_name} {user.first_name}</div>
        </div>
      </div>
    </div>
  );
};

StudentCard.propTypes = {
  user: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};

export default StudentCard;