/* Dark mode theme switch */
function darkmode() {
  var body = document.body;
  body.classList.toggle("dark-mode");

  const intro = document.getElementsByClassName('intro-text');
  intro[0].classList.toggle('dark-mode');

  if (body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'on');
  } else {
    localStorage.removeItem('darkMode');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'on') {
    darkmode();
  }
});

/* Font size adjuster */
function toggleFont() {
  const body = document.body;
  body.classList.toggle('big-font');

  if (body.classList.contains('big-font')) {
    localStorage.setItem('fontSize', 'big');
  } else {
    localStorage.removeItem('fontSize');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('fontSize') === 'big') {
    toggleFont();
  }
});
