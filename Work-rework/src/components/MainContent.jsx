import React, {useState, useEffect} from "react";
import PropTypes from "prop-types";
import styles from "../styles/MainContent.module.css";
import "../styles/index.css";
import axios from "axios";

const MainContent = ({searchQuery}) => {
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [iframeUrl, setIframeUrl] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);

    useEffect(() => {
        fetch("/datas.json")
            .then((response) => response.json())
            .then((data) => {
                setUsers(data);
                const uniqueGroups = [...new Set(data.map((u) => u.group))].filter(Boolean);
                const sortedGroups = uniqueGroups.sort((a, b) => {
                    const [aYear, aNum] = a.split("-").map(Number);
                    const [bYear, bNum] = b.split("-").map(Number);
                    if (bYear !== aYear) return bYear - aYear;
                    return aNum - bNum;
                });
                setGroups(sortedGroups);
                if (sortedGroups.includes("24-11")) setSelectedGroup("24-11");
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Ошибка при загрузке JSON:", error);
                setIsLoading(false);
            });
    }, []);

    const handleGroupClick = (group) => {
        setSelectedGroup(group === selectedGroup ? null : group);
        setIframeUrl(null);
        setIsFullscreen(false);
    };

    const handleCardClick = (url) => setIframeUrl(url);
    const handleBackClick = () => {
        setIframeUrl(null);
        setIsFullscreen(false);
    };
    const handleFullscreenClick = () => setIsFullscreen(!isFullscreen);

    const formatUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        if (url.startsWith("//")) return "https:" + url;
        return `https://${url}`;
    };

    const baseUsers = selectedGroup ? users.filter((user) => user.group === selectedGroup) : [];
    const filteredUsers =
        searchQuery && searchQuery.length >= 2
            ? baseUsers.filter((user) => {
                const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
                return (
                    fullName.includes(searchQuery.toLowerCase()) ||
                    user.id.toLowerCase().includes(searchQuery.toLowerCase())
                );
            })
            : baseUsers;

    return (
        <div className={`${styles.container} arbitraryClass`}>
            <div className={styles.sidebar}>
                {isLoading ? (
                    <div>Загрузка...</div>
                ) : (
                    <div className={styles.groupList}>
                        {groups.map((group, index) => (
                            <React.Fragment key={group}>
                                <button
                                    className={`${styles.groupButton} ${selectedGroup === group ? styles.groupButtonActive : ""}`}
                                    onClick={() => handleGroupClick(group)}
                                >
                                    ИТ {group}
                                </button>
                                {index < groups.length - 1 &&
                                    group.split("-")[0] !== groups[index + 1].split("-")[0] && (
                                        <div className={styles.buttonSeparator}/>
                                    )}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.divider}/>

            <div className={styles.mainContent}>
                {iframeUrl ? (
                    <div
                        className={`${styles.iframeContainer} ${isFullscreen ? styles.fullscreen : ""} ${styles.fadeIn}`}>
                        <div className={styles.iframeControls}>
                            <button className={styles.backButton} onClick={handleBackClick}>
                                Назад
                            </button>
                            <button className={styles.fullscreenButton} onClick={handleFullscreenClick}>
                                {isFullscreen ? "Свернуть" : "На весь экран"}
                            </button>
                        </div>
                        <iframe
                            src={iframeUrl}
                            className={styles.iframe}
                            title="Содержимое"
                            style={{width: "100%", height: isFullscreen ? "100vh" : "80vh", border: "none"}}
                        />
                    </div>
                ) : selectedGroup ? (
                    filteredUsers.length > 0 ? (
                        <div className={styles.gridContainer}>
                            {filteredUsers.map((user) => {
                                const isGold = user.id === "i24s0024" || user.id === "i24s0291";
                                const hasPhoto = user.avatar_path?.trim();
                                const goldStyles =
                                    isGold && hoveredCard === user.id
                                        ? {border: "1px solid gold", boxShadow: "0 0 10px gold"}
                                        : {};
                                const commonProps = {
                                    onMouseEnter: () => setHoveredCard(user.id),
                                    onMouseLeave: () => setHoveredCard(null),
                                    style: {cursor: "pointer", ...goldStyles},
                                };

                                return (
                                    <div
                                        key={user.id}
                                        className={`${styles.card} ${styles.fadeIn}`}
                                        onClick={user.url ? () => handleCardClick(formatUrl(user.url)) : undefined}
                                        {...commonProps}
                                    >
                                        <div className={styles.imageWrapper}>
                                            {hasPhoto ? (
                                                <img
                                                    src={user.avatar_path}
                                                    alt={`${user.last_name} ${user.first_name}`}
                                                    className={styles.image}
                                                    onError={(e) => {
                                                        e.target.style.display = "none";
                                                    }}
                                                />
                                            ) : (
                                                <div>Нет фото</div>
                                            )}
                                        </div>
                                        <div className={styles.infoOverlay}>
                                            <div className={styles.studentId}>{user.id}</div>
                                            <div>
                                                {user.last_name} {user.first_name}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>Нет результатов</div>
                    )
                ) : (
                    <div className={styles.emptyState}>
                        {isLoading ? "Загрузка данных..." : "Выберите группу для просмотра студентов"}
                    </div>
                )}
            </div>
        </div>
    );
};

MainContent.propTypes = {
    searchQuery: PropTypes.string.isRequired,
};

export default MainContent;
