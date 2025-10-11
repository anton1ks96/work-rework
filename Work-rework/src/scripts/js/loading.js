const style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
  #preloader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    color: white;
    font-family: 'Involve', sans-serif;
    text-align: center;
  }
  .spinner {
    width: 80px;
    height: 80px;
    position: relative;
    margin-bottom: 30px;
  }
  .spinner::before,
  .spinner::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 4px solid transparent;
    border-top-color: var(--primary-color);
    animation: spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
  }
  .spinner::before {
    border-top-color: var(--primary-color);
    animation-delay: 0.3s;
  }
  .spinner::after {
    border-left-color: var(--primary-color);
    animation-delay: 0.6s;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .preloader-text {
    font-size: 1.4em;
    min-height: 1.5em;
    transition: all 0.5s ease;
    opacity: 0;
    transform: translateY(10px);
  }
  .preloader-text.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .progress-bar {
    width: 200px;
    height: 3px;
    background: rgba(144, 76, 255, 0.2);
    border-radius: 3px;
    margin-top: 20px;
    overflow: hidden;
  }
  .progress {
    width: 0%;
    height: 100%;
    background: var(--primary-color);
    transition: width 0.3s ease;
  }
`;
document.head.appendChild(style);

const preloader = document.createElement('div');
preloader.id = 'preloader';

const spinner = document.createElement('div');
spinner.className = 'spinner';

const preloaderText = document.createElement('div');
preloaderText.className = 'preloader-text';

const progressBarContainer = document.createElement('div');
progressBarContainer.className = 'progress-bar';

const progressBar = document.createElement('div');
progressBar.className = 'progress';

progressBarContainer.appendChild(progressBar);
preloader.appendChild(spinner);
preloader.appendChild(preloaderText);
preloader.appendChild(progressBarContainer);
document.body.appendChild(preloader);

const messages = [
  "Проверка данных...",
  "Готовимся к употреблению скриптов...",
  "Жарим студентов...",
  "Проверяем кофе...",
  "Форматирование мозгов студентов...",
  "Страница всё ещё не загружается. Почему?...",
  "Я стараюсь изо всех сил загрузить страницу...",
  "Ломаю четвёртую стену...",
  "Перезагрузка матрицы...",
];

let messageIndex = 0;
let progress = 0;

function updatePreloaderText() {
  preloaderText.classList.remove('visible');
  setTimeout(() => {
    preloaderText.textContent = messages[messageIndex];
    preloaderText.classList.add('visible');
    messageIndex = (messageIndex + 1) % messages.length;

    progress += Math.random() * 20;
    if (progress > 100) progress = 100;
    progressBar.style.width = `${progress}%`;
  }, 300);
}

updatePreloaderText();
const textInterval = setInterval(updatePreloaderText, 1500);

window.addEventListener('load', () => {
  setTimeout(() => {
    clearInterval(textInterval);
    progress = 100;
    progressBar.style.width = '100%';

    setTimeout(() => {
      preloader.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      preloader.style.opacity = '0';
      preloader.style.transform = 'scale(1.1)';
      setTimeout(() => {
        preloader.remove();
      }, 800);
    }, 500);
  }, 10);
});
