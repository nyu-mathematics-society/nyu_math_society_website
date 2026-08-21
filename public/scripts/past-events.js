/* Renders the past-events posts from data/events.json.
   To add an event, edit that file — nothing in this script needs to change. */

var DATA_URL = '../data/events.json';
var IMAGE_BASE = '../images/';   // event photos live here; JSON lists filenames only

var container = document.getElementById('events');

fetch(DATA_URL)
    .then(function (response) {
        if (!response.ok) {
            throw new Error('Could not load ' + DATA_URL + ' (' + response.status + ')');
        }
        return response.json();
    })
    .then(render)
    .catch(function (error) {
        console.error(error);
        container.textContent = 'Sorry — our past events could not be loaded right now.';
    });

function render(events) {
    // Newest first, so officers can append to the JSON in any order.
    events.sort(function (a, b) {
        return (b.date || '').localeCompare(a.date || '');
    });

    events.forEach(function (event) {
        container.appendChild(buildPost(event));
    });

    wireCarousels();
}

function buildPost(event) {
    var post = document.createElement('article');
    post.className = 'post';

    var heading = document.createElement('h2');
    heading.textContent = event.title;
    post.appendChild(heading);

    if (event.date) {
        var time = document.createElement('time');
        time.className = 'post-date';
        time.setAttribute('datetime', event.date);
        time.textContent = formatDate(event.date);
        post.appendChild(time);
    }

    if (event.images && event.images.length) {
        post.appendChild(buildCarousel(event.images, event.title));
    }

    var description = document.createElement('p');
    description.textContent = event.description || '';
    post.appendChild(description);

    return post;
}

function buildCarousel(images, title) {
    var carousel = document.createElement('div');
    carousel.className = 'carousel';

    var track = document.createElement('div');
    track.className = 'carousel-track';

    images.forEach(function (filename) {
        var img = document.createElement('img');
        img.src = IMAGE_BASE + filename;
        img.alt = 'Photo from ' + title;
        img.loading = 'lazy';
        track.appendChild(img);
    });

    // A single photo has nothing to scroll to, so skip the arrows.
    if (images.length > 1) {
        carousel.appendChild(makeButton('prev', 'Previous image', '‹'));
        carousel.appendChild(track);
        carousel.appendChild(makeButton('next', 'Next image', '›'));
    } else {
        carousel.appendChild(track);
    }

    return carousel;
}

function makeButton(direction, label, symbol) {
    var button = document.createElement('button');
    button.className = 'carousel-btn ' + direction;
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.textContent = symbol;
    return button;
}

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

/* Carousel arrows: scroll the track one image per click.
   Swiping / trackpad scroll works without this, so it's just an enhancement. */
function wireCarousels() {
    document.querySelectorAll('.carousel').forEach(function (carousel) {
        var track = carousel.querySelector('.carousel-track');
        var prev = carousel.querySelector('.prev');
        var next = carousel.querySelector('.next');

        if (!prev || !next) {
            return;
        }

        prev.addEventListener('click', function () {
            track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
        });
        next.addEventListener('click', function () {
            track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
        });
    });
}
