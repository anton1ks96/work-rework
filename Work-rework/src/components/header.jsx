import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import logoLight from "../assets/png_images/logo_light.png";
import logoDark from "../assets/png_images/logo_dark.png";
import ThemeToggle from './theme/ThemeToggle';
import { useTheme } from './theme/useTheme';

// Added clearTrigger (number) to allow external clearing (e.g., clicking overlay)
// Optional onOpenSidebar preserved for potential future mobile sidebar button.
const Header = ({ onSearch, onSearchFocus, onSearchBlur, clearTrigger }) => {
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounced search (slightly faster than before for more responsive feel)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchInput.length >= 2 ? searchInput : "");
    }, 180);
    return () => clearTimeout(timer);
  }, [searchInput, onSearch]);

  // Respond to external clear command
  useEffect(() => {
    if (clearTrigger > 0) {
      setSearchInput("");
    }
  }, [clearTrigger]);

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-content">
        <div className="logo">
          <img src={theme === 'dark' ? logoDark : logoLight} alt="logo" />
        </div>
        {!isMobile && (
          <div className="top-bar">
            <div className="search-box">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                type="text"
                placeholder="Поиск по студентам..."
                value={searchInput}
                onFocus={onSearchFocus}
                onBlur={onSearchBlur}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

Header.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onSearchFocus: PropTypes.func,
  onSearchBlur: PropTypes.func,
  clearTrigger: PropTypes.number,
  onOpenSidebar: PropTypes.func,
};

Header.defaultProps = {
  onSearchFocus: () => {},
  onSearchBlur: () => {},
  clearTrigger: 0,
};