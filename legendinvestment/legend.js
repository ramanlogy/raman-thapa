(function () {
  'use strict';

  // Project facts from legendsinvestment.com.np (Nov 2026). Ropani figures from ICT Frame, Mar 2025.
  // Coordinates are approximate tole-level pins; gmap links open Legends' own Google My Maps.
  var projects = [
    { id: 'nayagaon', name: 'Naya Gaon', full: 'Naya Gaon Holiday Homes & Resort', place: 'Baluwa, Panchkhal-10, Kavre',
      status: 'On going', ropani: 240, plots: 145, sold: 3, booked: 2, listed: 68,
      features: ['30 ft road and cycle lane', 'Water treatment plant', 'Sealed boundary', '24/7 security', 'Pool and café'],
      near: 'Holiday homes with villa designs, financed with Himalayan Bank.',
      lat: 27.64, lng: 85.625, gmap: '1yrEnysmaYgz47IlcQeUXCw_dNGYYJiA' },
    { id: 'chalnakhel', name: 'Chalnakhel', full: 'Chalnakhel Smart Land Development', place: 'Chalnakhel, Dakshinkali-1, Kathmandu',
      status: 'On going', ropani: 65, plots: 69, sold: 0, booked: 0, listed: 69,
      features: ['8 m road', 'East facing, Vastu slope', 'Electricity', 'Water supply', 'Street lights'],
      near: '1 km to Taudaha Lake, 3 km to Chobhar Dry Port, 7 km to Balkhu.',
      lat: 27.639, lng: 85.2735, gmap: '16rtBt5_8MhQCnULDk_aWJlp9faglDtM' },
    { id: 'kalamasi', name: 'Kalamasi Hills', full: 'Kalamasi Hills Land Development', place: 'Kalamasi, Changunarayan-8, Bhaktapur',
      status: 'Completed', ropani: 70, plots: 31, sold: 15, booked: 0, listed: 31,
      features: ['8 m pitched road', 'Street lights', 'Drainage', 'Water supply', 'Valley views'],
      near: '3 km to Nagarkot View Tower, 18 km to Koteshwor.',
      lat: 27.7005, lng: 85.501, gmap: '1gll4Bv6RJtDP_RT_mX4NbwSLWk2Vxpg' },
    { id: 'rikhetar', name: 'Rikhetar Pakho', full: 'Rikhetar Pakho (Palanse)', place: 'Nangkhel, Suryabinayak-9, Bhaktapur',
      status: 'Completed', ropani: 285, plots: null, sold: 0, booked: 0, listed: 30,
      features: ['20 to 22 ft pitched roads', 'Sidewalks', 'CCTV', 'Wi-Fi zones', 'Open spaces'],
      near: 'Next to Araniko Highway, 2 km to Sanga Mahadev, 12 km to Koteshwor.',
      lat: 27.6505, lng: 85.459, gmap: '1QFOyb62pyKw-PQ1WfOXHbokMB3XwgYQ' },
    { id: 'sipadol', name: 'Sipadol Viral', full: 'Sipadol Viral Land Development', place: 'Sipadol, Suryabinayak-8, Bhaktapur',
      status: 'Completed', ropani: 400, plots: null, sold: 0, booked: 0, listed: 22,
      features: ['8 m pitched road', 'CCTV', 'Open spaces', 'Drainage', 'Street lights'],
      near: '2 km to Araniko Highway, 7 km to Suryabinayak, 11 km to Koteshwor.',
      lat: 27.6655, lng: 85.45, gmap: '1Lz0pexcnnL9KceDOHtHpvFgAhqWLfys' }
  ];

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var listEl = document.getElementById('projectList');
  var detailEl = document.getElementById('projectDetail');
  var map = null;
  var markers = {};

  function media(src, alt, label) {
    return '<div class="media" data-label="' + label + '"><img src="' + src + '" alt="' + alt +
      '" loading="lazy" onerror="this.parentNode.classList.add(\'noimg\');this.remove()"></div>';
  }
  function byId(id) { return projects.filter(function (x) { return x.id === id; })[0]; }

  // Project list
  projects.forEach(function (p) {
    var b = document.createElement('button');
    b.className = 'proj';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', 'false');
    b.dataset.id = p.id;
    b.innerHTML = media('/legendinvestment/img/' + p.id + '-sm.jpg', '', p.name) +
      '<span><span class="proj-name">' + p.name + '</span><span class="proj-meta">' + p.place.split(', ').pop() +
      ', ' + p.status.toLowerCase() + '</span></span>';
    b.addEventListener('click', function () { select(p.id, true); });
    listEl.appendChild(b);
  });

  function renderDetail(p) {
    var taken = p.sold + p.booked;
    var ring = taken > 0
      ? '<div class="detail-ring"><span class="ring" style="--p:' + Math.round(taken / p.listed * 100) + '"></span><span><strong>' +
        taken + ' of ' + p.listed + '</strong> listed plots sold or booked, per your site today</span></div>'
      : '';
    detailEl.innerHTML = media('/legendinvestment/img/' + p.id + '.jpg', p.full, p.full) +
      '<div class="detail-body">' +
      '<div><h3>' + p.full + '</h3><span class="detail-loc">' + p.place + '</span></div>' +
      '<div class="detail-stats">' +
      '<div><strong>' + p.status + '</strong><span>status</span></div>' +
      '<div><strong>' + (p.plots ? p.plots + ' plots' : '~' + p.ropani + ' ropani') + '</strong><span>' + (p.plots ? '~' + p.ropani + ' ropani' : 'reported size') + '</span></div>' +
      '</div>' + ring +
      '<ul class="chips">' + p.features.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul>' +
      '<p>' + p.near + '</p>' +
      '<div class="detail-actions"><a class="pill pill-accent" href="https://www.google.com/maps/d/viewer?mid=' + p.gmap +
      '" target="_blank" rel="noopener">Open in Google Maps</a><a class="pill pill-ghost" href="#progress">Progress</a></div>' +
      '</div>';
  }

  function select(id, fly) {
    var p = byId(id);
    if (!p) return;
    Array.prototype.forEach.call(listEl.children, function (el) {
      el.setAttribute('aria-selected', el.dataset.id === id ? 'true' : 'false');
    });
    renderDetail(p);
    Object.keys(markers).forEach(function (k) {
      var el = markers[k].getElement();
      if (el && el.firstChild) el.firstChild.classList.toggle('is-active', k === id);
    });
    if (map && fly) {
      if (reduceMotion) map.setView([p.lat, p.lng], 14);
      else map.flyTo([p.lat, p.lng], 14, { duration: 1.2 });
    }
    var tl = document.getElementById('tlProject');
    if (tl.value !== id) { tl.value = id; renderTimeline(id); }
  }

  // Map (Leaflet + CARTO tiles, theme-aware)
  function initMap() {
    if (typeof L === 'undefined') {
      document.getElementById('map').innerHTML = '<div class="map-fallback">The map loads when you are online.</div>';
      return;
    }
    map = L.map('map', { scrollWheelZoom: false, zoomControl: false }).setView([27.67, 85.45], 11);
    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics'
    }).addTo(map);
    var streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    });
    L.control.layers({ 'Satellite': satellite, 'Map': streets }, null, { position: 'topleft', collapsed: false }).addTo(map);
    projects.forEach(function (p) {
      var icon = L.divIcon({ className: 'pin-wrap', html: '<div class="pin"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
      markers[p.id] = L.marker([p.lat, p.lng], { icon: icon, title: p.name, keyboard: true })
        .addTo(map)
        .bindTooltip(p.name, { direction: 'top', offset: [0, -10] })
        .on('click', function () { select(p.id, true); });
    });
    var wide = window.innerWidth > 767;
    map.fitBounds(L.latLngBounds(projects.map(function (p) { return [p.lat, p.lng]; })), {
      paddingTopLeft: [40, 40], paddingBottomRight: [wide ? 380 : 40, 40]
    });
  }

  // Timeline (sample milestones)
  var timelines = {
    completed: [['2024', 'Land pooled and surveyed', 'done'], ['2024', 'Plots marked and boundary walls', 'done'], ['2025', 'Pitched roads and drainage', 'done'],
      ['2025', 'Street lights and electricity', 'done'], ['Nov 2026', 'Owners building homes', 'now'], ['2027', 'Community handover', 'next']],
    chalnakhel: [['2024', 'Land pooled and surveyed', 'done'], ['2025', 'Site office built', 'done'], ['2026', 'Plots marked across the site', 'done'],
      ['Nov 2026', 'Bookings open, road work under way', 'now'], ['2027', 'Pitched roads and street lights', 'next']],
    nayagaon: [['2025', 'Masterplan of 145 plots', 'done'], ['2026', 'Financing with Himalayan Bank', 'done'], ['Nov 2026', 'Plots on sale, ground works', 'now'],
      ['2027', 'Gate, roads and cycle lane', 'next'], ['2027', 'Pool, café and mini mart', 'next']]
  };
  function renderTimeline(id) {
    var steps = timelines[id] || timelines.completed;
    document.getElementById('timelineSteps').innerHTML = steps.map(function (s) {
      return '<li class="step ' + s[2] + '"><span class="step-month">' + s[0] + (s[2] === 'now' ? ', this month' : '') +
        '</span><span class="step-title">' + s[1] + '</span></li>';
    }).join('');
    Array.prototype.forEach.call(document.querySelectorAll('#compare img'), function (im) {
      im.src = '/legendinvestment/img/' + id + '.jpg';
    });
  }
  var tl = document.getElementById('tlProject');
  projects.forEach(function (p) {
    var o = document.createElement('option');
    o.value = p.id;
    o.textContent = p.full;
    tl.appendChild(o);
  });
  tl.addEventListener('change', function () { renderTimeline(tl.value); select(tl.value, true); });

  // Before / now slider
  var compare = document.getElementById('compare');
  var range = document.getElementById('compareRange');
  range.addEventListener('input', function () { compare.style.setProperty('--pos', range.value + '%'); });

  // Calculator
  var ids = ['cRopani', 'cAana', 'cPaisa', 'cPrice'];
  var nf = new Intl.NumberFormat('en-IN');
  function calc() {
    var v = ids.map(function (i) { return Math.max(0, parseFloat(document.getElementById(i).value) || 0); });
    var aana = v[0] * 16 + v[1] + v[2] / 4;
    var sqft = aana * 342.25;
    document.getElementById('oSqft').textContent = nf.format(Math.round(sqft));
    document.getElementById('oSqm').textContent = (sqft * 0.092903).toFixed(1);
    document.getElementById('oTotal').textContent = 'Rs. ' + nf.format(Math.round(aana * v[3]));
  }
  ids.forEach(function (i) { document.getElementById(i).addEventListener('input', calc); });
  calc();

  // Videos: hero loop plays only while visible; film plays on demand
  var heroVid = document.querySelector('.site-hero-video');
  if (heroVid && 'IntersectionObserver' in window && !reduceMotion) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { heroVid.preload = 'auto'; var pr = heroVid.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else heroVid.pause();
      });
    }, { threshold: 0.25 }).observe(heroVid);
  }
  var film = document.getElementById('filmVideo');
  var filmBtn = document.getElementById('filmPlay');
  var frame = document.getElementById('film');
  filmBtn.addEventListener('click', function () {
    if (film.paused) {
      film.preload = 'auto';
      var pr = film.play(); if (pr && pr.catch) pr.catch(function () {});
      frame.classList.add('is-playing');
      filmBtn.setAttribute('aria-pressed', 'true');
      filmBtn.setAttribute('aria-label', 'Pause the Kalamasi Hills film');
    } else {
      film.pause();
      frame.classList.remove('is-playing');
      filmBtn.setAttribute('aria-pressed', 'false');
      filmBtn.setAttribute('aria-label', 'Play the Kalamasi Hills film');
    }
  });

  // Reveal on scroll
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var groups = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var parent = e.target.parentElement;
        var n = groups.get(parent) || 0;
        e.target.style.setProperty('--d', Math.min(n, 5) * 70 + 'ms');
        groups.set(parent, n + 1);
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  initMap();
  renderTimeline('nayagaon');
  select('nayagaon', false);
})();
