import { useTheme } from './useTheme';
import './theme-toggle.css';
import darkIcon from '../../assets/svg_images/dark-theme-light-btn.svg';
import lightIcon from '../../assets/svg_images/light-theme-black-btn.svg';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${isDark ? 'dark' : 'light'}`}
      aria-label={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
    >
      <span className="icon-wrapper">
        <img src={isDark ? darkIcon : lightIcon} alt={isDark ? 'moon' : 'sun'} className="icon-img" />
      </span>
      <span className="label">{isDark ? 'Тёмная' : 'Светлая'}</span>
    </button>
  );
};

export default ThemeToggle;