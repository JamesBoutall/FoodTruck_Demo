/* script.js: the BEHAVIOUR of the page (interactivity).
   Plain JavaScript only, no libraries. */
 
/* 1. Mobile menu: open/close with the hamburger button */
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');
 
function setMenu(open) {
  siteNav.classList.toggle('open', open);
  // Tells screen readers whether the menu is expanded
  navToggle.setAttribute('aria-expanded', String(open));
}
 
navToggle.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  setMenu(!isOpen);
});
 
// Close the menu after choosing a link
siteNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});
 
// Close the menu with the Escape key (keyboard accessibility)
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setMenu(false);
    navToggle.focus();
  }
});
 
/* 2. "Open now" badge + highlight today's row in the schedule.
   We use Cape Town time, so the badge is right even if a visitor
   is in another time zone. */
 
// Gets the current date/time as it is in Cape Town
function getCapeTownNow() {
  const text = new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' });
  return new Date(text);
}
 
// Turns "11:30" into minutes since midnight (11 * 60 + 30 = 690)
function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
 
const now = getCapeTownNow();
const todayRow = document.querySelector('#scheduleTable tr[data-day="' + now.getDay() + '"]');
const badge = document.getElementById('openStatus');
 
if (todayRow) {
  todayRow.classList.add('today');
 
  const openTime = todayRow.dataset.open;   // e.g. "11:00" (empty if closed all day)
  const closeTime = todayRow.dataset.close; // e.g. "15:00"
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
 
  let isOpen = false;
  if (openTime && closeTime) {
    isOpen = nowMinutes >= toMinutes(openTime) && nowMinutes < toMinutes(closeTime);
  }
 
  const spot = todayRow.cells[1].textContent; // the "Spot" column
  badge.classList.add(isOpen ? 'open' : 'closed');
  if (isOpen) {
    badge.textContent = 'Open now at ' + spot + ' until ' + closeTime;
  } else if (openTime) {
    badge.textContent = 'Closed right now. Today: ' + spot + ', ' + openTime + ' – ' + closeTime;
  } else {
    badge.textContent = 'Closed today. See the schedule below.';
  }
}
 
/* 3. Menu filter: show only the chosen category */
const filterButtons = document.querySelectorAll('.filter-btn');
const menuCards = document.querySelectorAll('#menuCards .card');
const filterCount = document.getElementById('filterCount');
 
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const chosen = button.dataset.filter;
 
    // Update which button looks "pressed" (and tell screen readers)
    filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
 
    // Show or hide each card
    let visible = 0;
    menuCards.forEach((card) => {
      const match = chosen === 'all' || card.dataset.category === chosen;
      card.hidden = !match;
      if (match) visible++;
    });
 
    filterCount.textContent = 'Showing ' + visible + ' menu items.';
  });
});
 
/* 4. Keep the footer year up to date automatically */
document.getElementById('year').textContent = new Date().getFullYear();
 
/* 5. Contact form: validate the fields and show a friendly message.
   NOTE: this is a DEMO. A static site cannot send email or store data.
   A real business would need a proper form service or server arranged
   with the client (and an adult's help with privacy rules). */
const form = document.getElementById('contactForm');
const statusMessage = document.getElementById('formStatus');
 
// Shows or clears an error under one field
function setError(input, errorId, message) {
  document.getElementById(errorId).textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}
 
form.addEventListener('submit', (event) => {
  event.preventDefault(); // stop the page from reloading
 
  const name = form.elements['name'];
  const email = form.elements['email'];
  const message = form.elements['message'];
  let firstBadField = null;
 
  if (name.value.trim() === '') {
    setError(name, 'nameError', 'Please enter your name.');
    firstBadField = firstBadField || name;
  } else {
    setError(name, 'nameError', '');
  }
 
  // Simple email pattern: something@something.something
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    setError(email, 'emailError', 'Please enter a valid email address.');
    firstBadField = firstBadField || email;
  } else {
    setError(email, 'emailError', '');
  }
 
  if (message.value.trim().length < 5) {
    setError(message, 'messageError', 'Please write a short message.');
    firstBadField = firstBadField || message;
  } else {
    setError(message, 'messageError', '');
  }
 
  if (firstBadField) {
    statusMessage.textContent = '';
    firstBadField.focus(); // move the keyboard to the first problem
    return;
  }
 
  statusMessage.textContent = 'Thanks! This is a demo form, so nothing was actually sent.';
  form.reset();
});