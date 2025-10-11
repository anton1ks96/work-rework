

  const bg = document.querySelector('.background');
  let position = 0;

  function animateBackground() {
    position += 1;
    bg.style.backgroundPosition = `0 ${position}px`;
    if (position >= bg.clientHeight) {
      position = 0;
    }
    requestAnimationFrame(animateBackground);
  }

  animateBackground();
