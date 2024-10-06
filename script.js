const toggleButton = document.getElementById('toggle-dark-mode');
const body = document.body;
const sections = document.querySelectorAll('.section');
const inputs = document.querySelectorAll('form input, form textarea');
const headings = document.querySelectorAll('h2');
const nav = document.getElementById('nav-list');
const menuToggle = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('show');
});

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    sections.forEach(section => section.classList.toggle('dark-mode'));
    inputs.forEach(input => input.classList.toggle('dark-mode'));
    headings.forEach(heading => heading.classList.toggle('dark-mode'));

    toggleButton.textContent = body.classList.contains('dark-mode') ? '☀️' : '🌙';


    localStorage.setItem('dark-mode', body.classList.contains('dark-mode'));
});


window.addEventListener('DOMContentLoaded', () => {
    const darkModePreference = localStorage.getItem('dark-mode') === 'true';
    if (darkModePreference) {
        body.classList.add('dark-mode');
        toggleButton.textContent = '☀️';
        sections.forEach(section => section.classList.add('dark-mode'));
        inputs.forEach(input => input.classList.add('dark-mode'));
        headings.forEach(heading => heading.classList.add('dark-mode'));
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => observer.observe(section));
});
