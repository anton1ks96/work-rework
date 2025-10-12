import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "../styles/MainContent.module.css";
import "../styles/index.css";
import StudentCard from './ui/StudentCard';
import Loader from './ui/Loader';
import { fetchGroups, fetchStudents } from '../services/api';

const MainContent = ({ searchQuery, isMobileSidebarVisible, setIsMobileSidebarVisible, setSearchQuery  }) => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [displayedGroup, setDisplayedGroup] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const groupRefs = useRef({});
  const [searchInput, setSearchInput] = useState("");
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);
  const [isCompactSearchOpen, setIsCompactSearchOpen] = useState(false);


  // Load groups and all students from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load groups
        const groupsData = await fetchGroups();

        // Sort groups by year (descending) and number
        // Format: "ИТ21-11" -> extract "21-11" for sorting
        const sortedGroups = groupsData.sort((a, b) => {
          const aName = a.replace(/^ИТ/, '');
          const bName = b.replace(/^ИТ/, '');
          const [aYear, aNum] = aName.split("-").map(Number);
          const [bYear, bNum] = bName.split("-").map(Number);
          if (bYear !== aYear) return bYear - aYear;
          return aNum - bNum;
        });

        setGroups(sortedGroups);

        // Load students for all groups in parallel
        const studentsPromises = sortedGroups.map(group => fetchStudents(group));
        const studentsArrays = await Promise.all(studentsPromises);

        // Flatten the array of arrays into a single array of all students
        const allStudents = studentsArrays.flat();

        setUsers(allStudents);

        // Auto-select first group if "ИТ24-11" exists
        if (sortedGroups.includes("ИТ24-11")) {
          setSelectedGroup("ИТ24-11");
          setDisplayedGroup("ИТ24-11");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        setIsLoading(false);
      }
    };

    loadData();

    if (window.innerWidth <= 768) {
      setIsMobileSidebarVisible(true);
    }
  }, [setIsMobileSidebarVisible]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const computeIndicatorTop = (group) => {
    const button = !isMobile ? groupRefs.current[group] : null;
    if (button) {
      const rect = button.getBoundingClientRect();
      return rect.top + rect.height / 2 - 13;
    }
    return 0;
  };

  useEffect(() => {
    if (searchQuery && searchQuery.length >= 2) {
      setIsContentLoading(true);
      const timer = setTimeout(() => {
        setIsContentLoading(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isMobileSidebarVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileSidebarVisible]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput.length >= 2) {
                setIsContentLoading(true);
                setSearchQuery(searchInput);
            } else {
                setSearchQuery("");
            }
        }, 250);
        return () => clearTimeout(timer);
  }, [searchInput, setSearchQuery]);

  const handleGroupClick = (group) => {
    if (group === selectedGroup) {
      setSelectedGroup(null);
      setIsTransitioning(true);
      setTimeout(() => {
        setDisplayedGroup(null);
        setIsTransitioning(false);
      }, 100);
    } else {
      setSelectedGroup(group);
      setIsTransitioning(true);
      setTimeout(() => {
        setDisplayedGroup(group);
        setIsTransitioning(false);
      }, 100);
    }
  };
  const handleMobileSidebarClose = () => setIsMobileSidebarVisible(false);
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("mobileSidebarOverlay")) {
      handleMobileSidebarClose();
    }
  };

  const filteredUsers =
    searchQuery && searchQuery.length >= 2
      ? users.filter((user) => {
          const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
          return (
            fullName.includes(searchQuery.toLowerCase()) ||
            user.id.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })
      : displayedGroup
      ? users.filter((user) => user.group === displayedGroup)
      : [];

  const searchMatchedGroups = groups.filter(
    (group) =>
      searchQuery &&
      searchQuery.length >= 2 &&
      users.some(
        (user) =>
          user.group === group &&
          (user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.id.toLowerCase().includes(searchQuery.toLowerCase()))
      )
  );

  const closeCompactSearch = () => setIsCompactSearchOpen(false);

  return (
    <div className={`${styles.container} arbitraryClass`}>
      {!isMobile && (
      <div className={styles.sidebarDesktop}>
        {isLoading ? (
          <Loader type="spinner" />
        ) : (
          <div className={styles.groupList}>
            {groups.map((group, index) => (
              <React.Fragment key={group}>
                <button
                  ref={(el) => (!isMobile ? (groupRefs.current[group] = el) : null)}
                  className={`${styles.groupButton} ${
                    selectedGroup === group ? styles.groupButtonActive : ""
                  }`}
                  onClick={() => handleGroupClick(group)}
                >
                  {group}
                </button>
                {group !== groups[groups.length - 1] &&
                  group.split("-")[0] !== groups[index + 1]?.split("-")[0] && (
                    <div className={styles.buttonSeparator} />
                  )}
              </React.Fragment>
            ))}
          </div>
        )}
        {selectedGroup && (
          <div
            className={styles.dividerIndicator}
            style={{ top: computeIndicatorTop(selectedGroup) }}
          />
        )}
        {searchMatchedGroups
          .filter((group) => group !== selectedGroup)
          .map((group) => (
            <div
              key={group}
              className={`${styles.dividerIndicator} ${styles.searchFloatingIndicator}`}
              style={{ top: computeIndicatorTop(group) }}
            />
          ))}
      </div>
      )}
      <div className={styles.divider} />
      <div className={styles.mainContent}>
        {isContentLoading && (
          <div className={styles.preloader}>
            <Loader type="spinner" />
          </div>
        )}
        {selectedGroup || searchQuery ? (
          filteredUsers.length > 0 ? (
            <div className={`${styles.gridContainer} ${isTransitioning ? styles.fadeOut : ""}`}>
              {filteredUsers.map((user) => (
                <StudentCard
                  key={user.id}
                  user={user}
                />
              ))}
            </div>
          ) : isLoading ? (
            <Loader type="skeleton" count={8} />
          ) : (
            <div className={styles.emptyState}>Нет результатов</div>
          )
        ) : (
          <div className={styles.emptyState}>
            {isLoading ? <Loader type="spinner" /> : "Выберите группу для просмотра студентов"}
          </div>
        )}

        {isMobile && (
        <div
            className="mobileSidebarOverlay"
            onClick={handleOverlayClick}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.6)",
              zIndex: 1999,
              display: isMobileSidebarVisible ? "block" : "none"
            }}
        />
        )}

        {isMobile && (
        <div
            className={`${styles.sidebarMobile} ${
                isMobileSidebarVisible ? styles.sidebarMobileVisible : styles.sidebarMobileHidden
            }`}
        >
          <div className={styles.groupList}>
            {groups.map((group, index) => (
                <React.Fragment key={group}>
                  <button
                      className={`${styles.groupButton} ${
                          selectedGroup === group ? styles.groupButtonActive : ""
                      }`}
                      onClick={() => {
                        handleGroupClick(group);
                        handleMobileSidebarClose();
                      }}
                  >
                    {group}
                  </button>
                  {group !== groups[groups.length - 1] &&
                      group.split("-")[0] !== groups[index + 1]?.split("-")[0] && (
                          <div className={styles.buttonSeparator} />
                      )}
                </React.Fragment>
            ))}
          </div>
        </div>
        )}

          {isMobile && (
            <div className={styles.mobileSearchBar}>
              <div className={styles.searchWrapper}>
                <div className={`${styles.searchAnimated} ${isCompactSearchOpen ? styles.expanded : ""}`}>
                  <div
                    className={styles.searchIconBtn}
                    onClick={() => {
                      if (!isCompactSearchOpen) {
                        setIsCompactSearchOpen(true);
                        // focus after next paint
                        requestAnimationFrame(() => {
                          const inp = document.querySelector(`.${styles.searchAnimated} input`);
                          if (inp) inp.focus();
                        });
                      }
                    }}
                    aria-label="Открыть поиск"
                  >
                    <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-1.49 1.49l.27.28v.79l4.25 4.25a1.06 1.06 0 0 0 1.5-1.5L15.5 14zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z" /></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Поиск..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onFocus={() => !isCompactSearchOpen && setIsCompactSearchOpen(true)}
                  />
                  <button
                    className={styles.closeSearchBtn}
                    onClick={() => {
                      setSearchInput("");
                      closeCompactSearch();
                    }}
                    aria-label="Закрыть поиск"
                  >
                    ×
                  </button>
                </div>
              </div>
              <button
                className={`${styles.mobileBurgerButton} ${isMobileSidebarVisible ? styles.open : ""}`}
                onClick={() => setIsMobileSidebarVisible((v) => !v)}
                aria-label={isMobileSidebarVisible ? "Закрыть меню" : "Открыть меню"}
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          )}


      </div>
    </div>
  );
};

export default MainContent;

MainContent.propTypes = {
    searchQuery: PropTypes.string.isRequired,
    setSearchQuery: PropTypes.func.isRequired,
    isMobileSidebarVisible: PropTypes.bool.isRequired,
    setIsMobileSidebarVisible: PropTypes.func.isRequired,
};