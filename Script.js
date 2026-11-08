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
  if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    navToggle.focus();
  }
});
 
/* 2. "Open now" badge + highlight today's row in the schedule.
   We use Cape Town time, so the badge is right even if a visitor
   is in another time zone. */
 
// Gets today's weekday (0 = Sunday ... 6 = Saturday) and the minutes since
// midnight, as they are in Cape Town right now.
function getCapeTownNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Johannesburg',
    weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    day: dayNames.indexOf(get('weekday')),
    minutes: Number(get('hour')) * 60 + Number(get('minute'))
  };
}
 
// Turns "11:30" into minutes since midnight (11 * 60 + 30 = 690)
function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
 
const now = getCapeTownNow();
const todayRow = document.querySelector('#scheduleTable tr[data-day="' + now.day + '"]');
const badge = document.getElementById('openStatus');
 
if (todayRow) {
  todayRow.classList.add('today');
  todayRow.setAttribute('aria-current', 'date'); // tells screen readers this is today
 
  const openTime = todayRow.dataset.open;   // e.g. "11:00" (empty if closed all day)
  const closeTime = todayRow.dataset.close; // e.g. "15:00"
  const nowMinutes = now.minutes;
 
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
      // A card can belong to several categories, e.g. "sides veg"
      const match = chosen === 'all' || card.dataset.category.split(' ').includes(chosen);
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
 
