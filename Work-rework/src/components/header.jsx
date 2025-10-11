import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import logo from "../assets/png_images/logo.png";
import axios from "axios";

const Header = ({onSearch}) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchInput, setSearchInput] = useState("");

    // -----РЕГИСТРАЦИЯ/ВХОД-----
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 0);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchInput.length >= 2 ? searchInput : "");
        }, 1000);
        return () => clearTimeout(timer);
    }, [searchInput, onSearch]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            alert("Заполните логин, пароль");
            return;
        }
        try {
            await axios.post("http://localhost:8080/register", {
                username,
                password,
            });
            alert("Регистрация успешна!");
            setUsername("");
            setPassword("");
            setIsRegisterOpen(false);
        } catch (error) {
            console.error("Ошибка регистрации:", error.response?.data || error.message);
            alert("Ошибка: " + (error.response?.data || error.message));
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            alert("Введите логин и пароль");
            return;
        }
        try {
            const resp = await axios.post("http://localhost:8080/login", {
                username,
                password,
            });
            const { token } = resp.data;
            localStorage.setItem("token", token);

            alert("Вход выполнен!");
            setIsLoggedIn(true);
            setUsername("");
            setPassword("");
            setIsLoginOpen(false);
        } catch (error) {
            console.error("Ошибка логина:", error.response?.data || error.message);
            alert("Ошибка логина: " + (error.response?.data || error.message));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        alert("Вы вышли из WORK");
    };

    return (
        <header className={`header ${isScrolled ? "scrolled" : ""}`}>
            <div className="header-content">
                <div className="logo">
                    <img src={logo} alt="logo" />
                </div>

                <div className="top-bar">

                    <div className="search-box">
                        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24">
                            <path d="M15.5 14h-.79l-.28-.27
                       a6.5 6.5 0 0 0 1.48-5.34
                       c-.47-2.78-2.79-5-5.59-5.34
                       a6.505 6.505 0 0 0-7.27 7.27
                       c.34 2.8 2.56 5.12 5.34 5.59
                       a6.5 6.5 0 0 0 5.34-1.48
                       l.27.28v.79l4.25 4.25
                       c.41.41 1.08.41 1.49 0
                       .41-.41.41-1.08 0-1.49
                       L15.5 14zm-6 0C7.01 14 5 11.99
                       5 9.5S7.01 5 9.5 5
                       14 7.01 14 9.5
                       11.99 14 9.5 14z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Поиск по студентам..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>

                    {!isLoggedIn && (
                        <>
                            <button onClick={() => setIsLoginOpen(!isLoginOpen)}>
                                Войти
                            </button>
                            <button onClick={() => setIsRegisterOpen(!isRegisterOpen)}>
                                Регистрация
                            </button>
                        </>
                    )}

                    {isLoggedIn && (
                        <button onClick={handleLogout}>
                            Выйти
                        </button>
                    )}
                </div>
            </div>

            {isLoginOpen && !isRegisterOpen && (
                <div className="dropdown-form">
                    <h2>Вход</h2>
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Логин"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit">Войти</button>
                    </form>
                </div>
            )}

            {isRegisterOpen && !isLoginOpen && (
                <div className="dropdown-form">
                    <h2>Регистрация</h2>
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Логин"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit">Зарегистрироваться</button>
                    </form>
                </div>
            )}
        </header>
    );
};

export default Header;

Header.propTypes = {
    onSearch: PropTypes.func.isRequired,
};