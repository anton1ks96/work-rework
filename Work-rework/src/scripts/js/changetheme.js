const themeToggle = document.querySelector('.theme-toggle');

    // Создание плашки "альфа"
    const sunAlphaBadge = document.createElement('div');
    sunAlphaBadge.textContent = 'альфа';
    sunAlphaBadge.style.display = 'none'; // По умолчанию скрыто
    sunAlphaBadge.style.position = 'absolute';
    sunAlphaBadge.style.top = '-10px';
    sunAlphaBadge.style.right = '-6px';
    sunAlphaBadge.style.background = 'linear-gradient(45deg, blue, violet)';
    sunAlphaBadge.style.color = 'white';
    sunAlphaBadge.style.fontSize = '10px';
    sunAlphaBadge.style.fontWeight = 'bold';
    sunAlphaBadge.style.padding = '3px 6px';
    sunAlphaBadge.style.borderRadius = '5px';
    sunAlphaBadge.style.pointerEvents = 'none';
    sunAlphaBadge.style.textTransform = 'uppercase';
    sunAlphaBadge.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
    sunAlphaBadge.style.opacity = '0'; 
    sunAlphaBadge.style.transition = 'opacity 0.5s ease'; 

    themeToggle.style.position = 'relative';
    themeToggle.appendChild(sunAlphaBadge);


    themeToggle.style.cursor = 'pointer';
    themeToggle.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease'; 

    themeToggle.addEventListener('mouseenter', () => {
        themeToggle.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
    });

    themeToggle.addEventListener('mouseleave', () => {
        themeToggle.style.boxShadow = 'none';
    });

    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Показать/скрыть плашку с анимацией
        if (theme === 'dark') {
            sunAlphaBadge.style.display = 'block';
            setTimeout(() => {
                sunAlphaBadge.style.opacity = '1';
            }, 0); // Даем время для отрисовки элемента перед изменением прозрачности
        } else {
            sunAlphaBadge.style.opacity = '0';
            setTimeout(() => {
                sunAlphaBadge.style.display = 'none';
            }, 500); // Таймер синхронизирован с длительностью анимации
        }
    };

    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    const burgerMenu = document.querySelector('.burger-menu');
    const navLinks = document.querySelector('.nav-links');

    burgerMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !burgerMenu.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });
