import PropTypes from 'prop-types';
import './file-icon.css';
import htmlIcon from '../../assets/png_images/icons8-html-48.png';
import cssIcon from '../../assets/png_images/icons8-css-48.png';
import jsIcon from '../../assets/png_images/icons8-javascript-48.png';

const FileIcon = ({ type, name, size = 32 }) => {
  const ext = name.split('.').pop().toLowerCase();

  if (type === 'dir') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon folder-icon">
        <path d="M10 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6H12L10 4Z" fill="currentColor"/>
      </svg>
    );
  }

  // Local PNG icons for HTML, CSS, JS
  const pngIcons = {
    'html': htmlIcon,
    'css': cssIcon,
    'js': jsIcon,
    'jsx': jsIcon,
  };

  if (pngIcons[ext]) {
    return <img src={pngIcons[ext]} alt={ext} className="file-icon local-icon" width={size} height={size} />;
  }

  const svgIcons = {
    'ts': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon ts-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#3178C6"/>
        <path d="M9 9H15M12 9V17M14 17C14 17 15 16 15 15.5C15 15 14.5 14.5 14 14.5H13.5C13 14.5 12.5 15 12.5 15.5C12.5 16 13 16.5 13.5 16.5H14.5C15 16.5 15.5 17 15.5 17.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    'tsx': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon react-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#61DAFB"/>
        <ellipse cx="12" cy="12" rx="8" ry="3" stroke="#282C34" strokeWidth="1.2" fill="none"/>
        <ellipse cx="12" cy="12" rx="8" ry="3" transform="rotate(60 12 12)" stroke="#282C34" strokeWidth="1.2" fill="none"/>
        <ellipse cx="12" cy="12" rx="8" ry="3" transform="rotate(-60 12 12)" stroke="#282C34" strokeWidth="1.2" fill="none"/>
        <circle cx="12" cy="12" r="1.5" fill="#282C34"/>
      </svg>
    ),
    // Markdown
    'md': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon md-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#083FA1"/>
        <path d="M6 16V8L9 12L12 8V16M14 13L16 10L18 13M16 10V16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    // JSON
    'json': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon json-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#5382A1"/>
        <path d="M8 8H9C10 8 10 9 10 9V11C10 11 10 12 11 12M11 12C10 12 10 13 10 13V15C10 15 10 16 9 16H8M11 12C12 12 12 11 12 11V9C12 9 12 8 13 8H14M8 16H9C10 16 10 17 10 17M14 16H13C12 16 12 17 12 17" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    // Python
    'py': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon py-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#3776AB"/>
        <path d="M12 6C9.5 6 9 7 9 8V10H12V10.5H8.5C7.5 10.5 6 11 6 13.5C6 16 7.5 16.5 8.5 16.5H10V14.5C10 13.5 10.5 13 11.5 13H14.5C15.5 13 16 12.5 16 11.5V8C16 7 15.5 6 12 6Z" fill="#FFD43B"/>
        <circle cx="10.5" cy="8" r="0.8" fill="#3776AB"/>
        <path d="M12 18C14.5 18 15 17 15 16V14H12V13.5H15.5C16.5 13.5 18 13 18 10.5C18 8 16.5 7.5 15.5 7.5H14V9.5C14 10.5 13.5 11 12.5 11H9.5C8.5 11 8 11.5 8 12.5V16C8 17 8.5 18 12 18Z" fill="#3776AB"/>
        <circle cx="13.5" cy="16" r="0.8" fill="#FFD43B"/>
      </svg>
    ),
    // Java
    'java': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon java-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#007396"/>
        <path d="M10 16C10 16 9 16.5 10.5 16.7C12 16.9 13 16.8 14.5 16.5C14.5 16.5 15 16.8 15.5 17C11.5 18.5 7 16.5 10 16ZM9.5 14C9.5 14 8.5 14.7 10 14.9C12 15.1 13.5 15.1 15.5 14.6C15.5 14.6 16 15 16.3 15.2C11 16.5 6 15 9.5 14Z" fill="#fff"/>
        <path d="M13 10.5C14 11.5 12.5 12.5 12.5 12.5C12.5 12.5 15 11 14 9C13 7.5 12 7 15 5C15 5 10 6.5 13 10.5Z" fill="#fff"/>
      </svg>
    ),
    // Images
    'png': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon image-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#9C27B0"/>
        <circle cx="9" cy="9" r="2" fill="#fff"/>
        <path d="M21 15L16 10L11 15M11 15L8 12L3 17" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'jpg': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon image-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#9C27B0"/>
        <circle cx="9" cy="9" r="2" fill="#fff"/>
        <path d="M21 15L16 10L11 15M11 15L8 12L3 17" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'jpeg': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon image-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#9C27B0"/>
        <circle cx="9" cy="9" r="2" fill="#fff"/>
        <path d="M21 15L16 10L11 15M11 15L8 12L3 17" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'gif': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon image-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#9C27B0"/>
        <circle cx="9" cy="9" r="2" fill="#fff"/>
        <path d="M21 15L16 10L11 15M11 15L8 12L3 17" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'svg': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon svg-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#FFB13B"/>
        <path d="M7 12L9 10L11 12L13 10L15 12L17 10" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="1.2" fill="none"/>
      </svg>
    ),
    // Git
    'gitignore': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon git-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#F05032"/>
        <path d="M11.5 7L16.5 12L11.5 17L6.5 12L11.5 7Z" fill="#fff"/>
      </svg>
    ),
    // Other files
    'txt': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon txt-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#6B7280"/>
        <path d="M7 10H17M7 13H15M7 16H13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    'pdf': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon pdf-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#DC2626"/>
        <text x="12" y="15" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">PDF</text>
      </svg>
    ),
    'zip': (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon zip-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="#F59E0B"/>
        <rect x="11" y="6" width="2" height="2" fill="#fff"/>
        <rect x="11" y="9" width="2" height="2" fill="#fff"/>
        <rect x="11" y="12" width="2" height="2" fill="#fff"/>
        <rect x="10" y="15" width="4" height="3" rx="0.5" fill="#fff"/>
      </svg>
    ),
  };

  return svgIcons[ext] || (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="file-icon default-icon">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#64748B"/>
      <path d="M7 10H17M7 13H15M7 16H12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
};

FileIcon.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
};

export default FileIcon;
