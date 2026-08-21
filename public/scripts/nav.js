/* The nav is a <details> disclosure: a hamburger menu on phones, a plain row on
   desktop. CSS can't force a closed <details> back open, so the open state is
   driven from the same 700px breakpoint the stylesheet uses. */

var wide = window.matchMedia('(min-width: 700px)');

function syncNav() {
    document.querySelectorAll('.nav-toggle').forEach(function (menu) {
        menu.open = wide.matches;
    });
}

wide.addEventListener('change', syncNav);
syncNav();
