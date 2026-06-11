window.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('[data-action]');
    buttons.forEach(function(button) {
        button.addEventListener('click', function() {
            alert('This page is a placeholder. Replace with your own UI.');
        });
    });
});
