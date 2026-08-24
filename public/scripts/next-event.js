/* Fills the "Next event" card on the home page from data/upcoming.json.
   To change what's shown, edit that file — nothing here needs to change.

   Only the soonest event that hasn't happened yet is shown, so a finished
   event drops off the home page on its own. If there's nothing coming up the
   card stays hidden: an empty highlight is worse than no highlight. */

var DATA_URL = 'data/upcoming.json';   // relative to index.html, at the web root

var container = document.getElementById('next-event');

fetch(DATA_URL)
    .then(function (response) {
        if (!response.ok) {
            throw new Error('Could not load ' + DATA_URL + ' (' + response.status + ')');
        }
        return response.json();
    })
    .then(render)
    .catch(function (error) {
        // Quietly leave the card hidden. Unlike the past-events page, where the
        // posts are the whole point, this one is a bonus — a visitor is better
        // off seeing the rest of the page than an apology.
        console.error(error);
    });

function render(events) {
    var event = pickNext(events);

    if (!event) {
        return;
    }

    container.appendChild(makeEyebrow('Next event'));

    var heading = document.createElement('h2');
    heading.textContent = event.title;
    container.appendChild(heading);

    container.appendChild(buildMeta(event));

    if (event.description) {
        var description = document.createElement('p');
        description.className = 'next-event-desc';
        description.textContent = event.description;
        container.appendChild(description);
    }

    container.hidden = false;
}

/* Soonest event still to come. Dates are plain YYYY-MM-DD strings, so a
   string compare is also a date compare — no parsing, no time zones. */
function pickNext(events) {
    var today = todayISO();

    var upcoming = events.filter(function (event) {
        return event.date && event.date >= today;
    });

    // Sort ascending so officers can list events in the JSON in any order.
    upcoming.sort(function (a, b) {
        return a.date.localeCompare(b.date);
    });

    return upcoming[0];
}

function makeEyebrow(text) {
    var eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = text;
    return eyebrow;
}

/* Date · time · room on one line. <time> wraps the date alone — the separators
   and the rest aren't part of the machine-readable value. Missing fields are
   skipped rather than leaving a stray "·" behind. */
function buildMeta(event) {
    var meta = document.createElement('p');
    meta.className = 'next-event-meta';

    var time = document.createElement('time');
    time.setAttribute('datetime', event.date);
    time.textContent = formatDate(event.date);
    meta.appendChild(time);

    [event.time, event.room].forEach(function (part) {
        if (part) {
            meta.appendChild(document.createTextNode(' · ' + part));
        }
    });

    return meta;
}

// Twin of the one in past-events.js; the two scripts never load on the same page.
function formatDate(iso) {
    // Split the parts by hand: new Date('2026-04-15') is parsed as UTC, which
    // renders as April 14 in New York. Passing parts builds a local date.
    var parts = iso.split('-');
    if (parts.length !== 3) {
        return iso;
    }
    var date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/* Today in the visitor's own time zone, as YYYY-MM-DD. Built from the local
   parts rather than toISOString(), which is UTC and would flip to tomorrow
   after 8pm in New York — retiring an event while it's still going on. */
function todayISO() {
    var now = new Date();
    return now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
}

function pad(number) {
    return number < 10 ? '0' + number : String(number);
}
