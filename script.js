const API_KEY = '123';
const LEAGUE_ID = '4480';
const SEASON = '2025-2026';

document.addEventListener('DOMContentLoaded', function() {
  setupTabs();
  loadUpcoming();
  loadResults();
  loadTable();
});

function setupTabs() {
  var buttons = document.querySelectorAll('.tab-btn');
  var contents = document.querySelectorAll('.tab-content');
  buttons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      buttons.forEach(function(b) { b.classList.remove('active'); });
      contents.forEach(function(c) { c.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

function loadUpcoming() {
  var loader = document.getElementById('loader-proximos');
  var container = document.getElementById('proximos-container');
  var url = 'https://www.thesportsdb.com/api/v1/json/' + API_KEY + '/eventsnextleague.php?id=' + LEAGUE_ID;
  fetch(url)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      loader.style.display = 'none';
      if (!data.events || data.events.length === 0) {
        container.innerHTML = '<p class="empty-msg">No hay partidos proximos programados por ahora. Vuelve pronto.</p>';
        return;
      }
      container.innerHTML = data.events.map(function(ev) { return matchCard(ev, false); }).join('');
    })
    .catch(function(err) {
      loader.textContent = 'No se pudieron cargar los partidos proximos.';
      console.error(err);
    });
}

function loadResults() {
  var loader = document.getElementById('loader-resultados');
  var container = document.getElementById('resultados-container');
  var url = 'https://www.thesportsdb.com/api/v1/json/' + API_KEY + '/eventspastleague.php?id=' + LEAGUE_ID;
  fetch(url)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      loader.style.display = 'none';
      if (!data.events || data.events.length === 0) {
        container.innerHTML = '<p class="empty-msg">No hay resultados disponibles.</p>';
        return;
      }
      var recent = data.events.slice(0, 12);
      container.innerHTML = recent.map(function(ev) { return matchCard(ev, true); }).join('');
    })
    .catch(function(err) {
      loader.textContent = 'No se pudieron cargar los resultados.';
      console.error(err);
    });
}

function matchCard(ev, showScore) {
  var date = ev.dateEvent || '';
  var time = ev.strTime ? ev.strTime.substring(0, 5) : '';
  var home = ev.strHomeTeam || '';
  var away = ev.strAwayTeam || '';
  var homeBadge = ev.strHomeTeamBadge || '';
  var awayBadge = ev.strAwayTeamBadge || '';
  var score = (showScore && ev.intHomeScore !== null && ev.intHomeScore !== undefined) ? (ev.intHomeScore + ' - ' + ev.intAwayScore) : 'vs';
  var homeImg = homeBadge ? ('<img src="' + homeBadge + '" alt="' + home + '" class="badge">') : '';
  var awayImg = awayBadge ? ('<img src="' + awayBadge + '" alt="' + away + '" class="badge">') : '';
  return '<div class="match-card">' +
    '<div class="match-date">' + date + ' ' + time + '</div>' +
    '<div class="match-teams">' +
      '<div class="team">' + homeImg + '<span>' + home + '</span></div>' +
      '<div class="score">' + score + '</div>' +
      '<div class="team">' + awayImg + '<span>' + away + '</span></div>' +
    '</div>' +
    '<div class="match-round">' + (ev.strRound || '') + '</div>' +
  '</div>';
}

function loadTable() {
  var loader = document.getElementById('loader-tabla');
  var container = document.getElementById('tabla-container');
  var url = 'https://www.thesportsdb.com/api/v1/json/' + API_KEY + '/lookuptable.php?l=' + LEAGUE_ID + '&s=' + SEASON;
  fetch(url)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      loader.style.display = 'none';
      if (!data.table || data.table.length === 0) {
        container.innerHTML = '<p class="empty-msg">Tabla no disponible para esta temporada.</p>';
        return;
      }
      var rows = data.table.map(function(t) {
        return '<tr>' +
          '<td>' + t.intRank + '</td>' +
          '<td class="team-cell"><img src="' + t.strBadge + '" class="badge-small" alt=""> ' + t.strTeam + '</td>' +
          '<td>' + t.intPlayed + '</td>' +
          '<td>' + t.intWin + '</td>' +
          '<td>' + t.intDraw + '</td>' +
          '<td>' + t.intLoss + '</td>' +
          '<td>' + t.intGoalDifference + '</td>' +
          '<td class="points">' + t.intPoints + '</td>' +
        '</tr>';
      }).join('');
      container.innerHTML = '<table><thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>DG</th><th>Pts</th></tr></thead><tbody>' + rows + '</tbody></table>';
    })
    .catch(function(err) {
      loader.textContent = 'No se pudo cargar la tabla de posiciones.';
      console.error(err);
    });
}
