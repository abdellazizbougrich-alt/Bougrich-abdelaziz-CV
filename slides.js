/* ============================================================
   Slide effects — CV (index.html) & cover letter (lettera.html)
   1. Slide-in reveal on load / scroll (sidebar from the left,
      content from the right, from the bottom on phones)
   2. Soft Skills slider (swipe, arrows, dots, keyboard, auto-play)
   ============================================================ */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var phoneMQ = window.matchMedia('(max-width: 850px)');

    /* ---------------------------------------------------------
       1. Reveal effect
       --------------------------------------------------------- */
    function setupReveal() {
        var groups = document.querySelectorAll('.cv-driving-block, .soft-slider');
        var items = [];
        var isPhone = phoneMQ.matches;

        [['.sidebar', 'from-left'], ['.main-content', 'from-right']].forEach(function (pair) {
            var parent = document.querySelector(pair[0]);
            if (!parent) return;
            Array.prototype.forEach.call(parent.children, function (el, i) {
                el.classList.add('reveal', isPhone ? 'from-bottom' : pair[1]);
                el.style.setProperty('--rd', (i < 5 ? i * 90 : 0) + 'ms');
                items.push(el);
            });
        });

        Array.prototype.forEach.call(groups, function (el) {
            el.classList.add('reveal-group');
            items.push(el);
        });

        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

        items.forEach(function (el) { io.observe(el); });
    }

    /* ---------------------------------------------------------
       2. Soft Skills slider
       --------------------------------------------------------- */
    function setupSlider() {
        var slider = document.getElementById('softSlider');
        if (!slider) return;

        var track = document.getElementById('softTrack');
        var slides = Array.prototype.slice.call(track.querySelectorAll('.soft-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.soft-dot'));
        var prevBtn = document.getElementById('softPrev');
        var nextBtn = document.getElementById('softNext');
        var bar = document.getElementById('softProgress');
        var count = slides.length;
        var index = 0;
        var lockUntil = 0;
        var rafId = 0;

        function offsetOf(i) {
            return slides[i].offsetLeft - track.offsetLeft;
        }

        function restartProgress() {
            if (reduceMotion || !bar) return;
            bar.classList.remove('run');
            void bar.offsetWidth; // restart the CSS animation
            bar.classList.add('run');
        }

        function setActive(i) {
            index = i;
            slides.forEach(function (s, n) { s.classList.toggle('is-active', n === i); });
            dots.forEach(function (d, n) {
                d.classList.toggle('is-active', n === i);
                d.setAttribute('aria-selected', n === i ? 'true' : 'false');
            });
            restartProgress();
        }

        function goTo(i) {
            i = (i + count) % count;
            lockUntil = Date.now() + 750;
            track.scrollTo({ left: offsetOf(i), behavior: reduceMotion ? 'auto' : 'smooth' });
            if (i !== index) setActive(i);
            else restartProgress();
        }

        // Keep the dots / active slide in sync while the user swipes
        track.addEventListener('scroll', function () {
            if (Date.now() < lockUntil) return;
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(function () {
                var step = count > 1 ? offsetOf(1) - offsetOf(0) : track.clientWidth;
                var i = Math.max(0, Math.min(count - 1, Math.round(track.scrollLeft / step)));
                if (i !== index) setActive(i);
            });
        }, { passive: true });

        prevBtn.addEventListener('click', function () { goTo(index - 1); });
        nextBtn.addEventListener('click', function () { goTo(index + 1); });
        dots.forEach(function (d, n) {
            d.addEventListener('click', function () { goTo(n); });
        });

        slider.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
        });

        window.addEventListener('resize', function () {
            track.scrollTo({ left: offsetOf(index), behavior: 'auto' });
        });

        /* Auto-play: the progress bar animation drives the timing. */
        if (reduceMotion || !bar) return;

        var paused = { hover: false, focus: false, touch: false, hidden: false };
        function syncPause() {
            var p = paused.hover || paused.focus || paused.touch || paused.hidden;
            slider.classList.toggle('is-paused', p);
        }

        bar.addEventListener('animationend', function () { goTo(index + 1); });

        slider.addEventListener('mouseenter', function () { paused.hover = true; syncPause(); });
        slider.addEventListener('mouseleave', function () { paused.hover = false; syncPause(); });
        slider.addEventListener('focusin', function () { paused.focus = true; syncPause(); });
        slider.addEventListener('focusout', function () { paused.focus = false; syncPause(); });
        slider.addEventListener('touchstart', function () { paused.touch = true; syncPause(); }, { passive: true });
        slider.addEventListener('touchend', function () {
            setTimeout(function () { paused.touch = false; syncPause(); }, 1800);
        }, { passive: true });

        if ('IntersectionObserver' in window) {
            // Only run while the slider is actually on screen
            paused.hidden = true;
            syncPause();
            new IntersectionObserver(function (entries) {
                paused.hidden = !entries[0].isIntersecting;
                syncPause();
            }, { threshold: 0.35 }).observe(slider);
        }

        restartProgress();
    }

    setupReveal();
    setupSlider();
})();
