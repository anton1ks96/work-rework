import PropTypes from 'prop-types';
import './loader.css';

/**
 * Unified loader component.
 * type: spinner | skeleton
 */
const Loader = ({ type = 'spinner', count = 8, className = '' }) => {
  if (type === 'skeleton') {
    return (
      <div className={`loader-skeleton-wrapper ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-card shimmer" />
        ))}
      </div>
    );
  }
  return (
    <div className={`loader-spinner ${className}`}>
      <div className="spinner-circle" />
    </div>
  );
};

Loader.propTypes = {
  type: PropTypes.oneOf(['spinner', 'skeleton']),
  count: PropTypes.number,
  className: PropTypes.string,
};

export default Loader;