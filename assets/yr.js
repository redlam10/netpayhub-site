/* Sets the current year in the footer. External file so the page CSP can use script-src 'self'. */
document.getElementById('yr').textContent = new Date().getFullYear();
