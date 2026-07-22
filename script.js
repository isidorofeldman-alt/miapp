const API_KEY = '123';
const LEAGUE_ID = '4480';
const SEASON = '2025-2026';
const ROUND_CODES = [16, 125, 150, 200];
const ROUND_NAMES = { 16: 'Octavos de Final', 125: 'Cuartos de Final', 150: 'Semifinal', 200: 'Final' };
const ROUND_LABELS = ['Octavos de Final', 'Cuartos de Final', 'Semifinal', 'Final'];

document.addEventListener('DOMContentLoaded', function() {
  setupTabs();
  loadUpcoming();
  loadResults();
  loadTable();
  loadBracketPasado();
  loadMiBracket();
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

function sleep(ms) {
  return new Promise(function(resolve) { setTimeout(resolve, ms); });
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
      var all = data.events.slice().sort(function(a, b) { return b.dateEvent.localeCompare(a.dateEvent); });
      container.innerHTML = all.map(function(ev) { return matchCard(ev, true); }).join('');
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

function groupTies(events) {
  var map = {};
  var order = [];
  events.forEach(function(e) {
    var key = [e.strHomeTeam, e.strAwayTeam].sort().join('|');
    if (!map[key]) { map[key] = []; order.push(key); }
    map[key].push(e);
  });
  return order.map(function(key) {
    return map[key].slice().sort(function(a, b) { return a.dateEvent.localeCompare(b.dateEvent); });
  });
}

function tieCardHtml(legs) {
  var totals = {};
  legs.forEach(function(e) {
    totals[e.strHomeTeam] = (totals[e.strHomeTeam] || 0) + Number(e.intHomeScore || 0);
    totals[e.strAwayTeam] = (totals[e.strAwayTeam] || 0) + Number(e.intAwayScore || 0);
  });
  var teamNames = Object.keys(totals);
  var legsHtml = legs.map(function(e) {
    return '<div class="leg-score">' + e.dateEvent + ': ' + e.strHomeTeam + ' ' + e.intHomeScore + ' - ' + e.intAwayScore + ' ' + e.strAwayTeam + '</div>';
  }).join('');
  var aggHtml = '';
  if (teamNames.length === 2) {
    aggHtml = '<div class="tie-aggregate">Global: ' + teamNames[0] + ' ' + totals[teamNames[0]] + ' - ' + totals[teamNames[1]] + ' ' + teamNames[1] + '</div>';
  }
  return '<div class="tie-card">' + legsHtml + aggHtml + '</div>';
}

function loadBracketPasado() {
  var loader = document.getElementById('loader-bracket-pasado');
  var container = document.getElementById('bracket-pasado-container');
  var html = '';
  var chain = Promise.resolve();
  ROUND_CODES.forEach(function(round) {
    chain = chain.then(function() {
      var url = 'https://www.thesportsdb.com/api/v1/json/' + API_KEY + '/eventsround.php?id=' + LEAGUE_ID + '&r=' + round + '&s=' + SEASON;
      return fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) {
          var events = data.events || [];
          if (events.length > 0) {
            var ties = groupTies(events);
            var tiesHtml = ties.map(function(legs) { return tieCardHtml(legs); }).join('');
            html += '<div class="round-group"><h3 class="round-title">' + ROUND_NAMES[round] + '</h3><div class="tie-grid">' + tiesHtml + '</div></div>';
          }
          return sleep(200);
        })
        .catch(function(err) { console.error(err); });
    });
  });
  chain.then(function() {
    loader.style.display = 'none';
    if (!html) {
      container.innerHTML = '<p class="empty-msg">No se encontro informacion del bracket de la temporada pasada.</p>';
    } else {
      container.innerHTML = html;
    }
  });
}

var bracketPicks = {};
try {
  bracketPicks = JSON.parse(localStorage.getItem('bracketPicks') || '{}');
} catch (e) {
  bracketPicks = {};
}
var seedTeams = [];

function loadMiBracket() {
  var loader = document.getElementById('loader-mi-bracket');
  var url = 'https://www.thesportsdb.com/api/v1/json/' + API_KEY + '/eventsround.php?id=' + LEAGUE_ID + '&r=16&s=' + SEASON;
  fetch(url)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      loader.style.display = 'none';
      var events = data.events || [];
      if (events.length === 0) {
        document.getElementById('mi-bracket-container').innerHTML = '<p class="empty-msg">No se pudieron cargar los equipos para armar el bracket.</p>';
        return;
      }
      var ties = groupTies(events);
      seedTeams = [];
      ties.forEach(function(legs) {
        var teamsInTie = [];
        legs.forEach(function(e) {
          if (teamsInTie.indexOf(e.strHomeTeam) === -1) teamsInTie.push(e.strHomeTeam);
          if (teamsInTie.indexOf(e.strAwayTeam) === -1) teamsInTie.push(e.strAwayTeam);
        });
        seedTeams.push(teamsInTie[0]);
        seedTeams.push(teamsInTie[1]);
      });
      renderMiBracket();
      var resetBtn = document.getElementById('reset-bracket-btn');
      resetBtn.addEventListener('click', function() {
        bracketPicks = {};
        localStorage.removeItem('bracketPicks');
        renderMiBracket();
      });
    })
    .catch(function(err) {
      loader.textContent = 'No se pudieron cargar los equipos para armar el bracket.';
      console.error(err);
    });
}

function getRoundMatches(roundIdx) {
  if (roundIdx === 0) {
    var matches = [];
    for (var i = 0; i < seedTeams.length; i += 2) {
      matches.push([seedTeams[i], seedTeams[i + 1]]);
    }
    return matches;
  }
  var prevRound = roundIdx - 1;
  var prevCount = 8 / Math.pow(2, prevRound);
  var winners = [];
  for (var k = 0; k < prevCount; k++) {
    winners.push(bracketPicks[prevRound + '-' + k] || null);
  }
  var result = [];
  for (var j = 0; j < winners.length; j += 2) {
    result.push([winners[j], winners[j + 1]]);
  }
  return result;
}

function renderMiBracket() {
  var container = document.getElementById('mi-bracket-container');
  var html = '';
  for (var roundIdx = 0; roundIdx < 4; roundIdx++) {
    var matches = getRoundMatches(roundIdx);
    html += '<div class="bracket-column"><div class="bracket-column-title">' + ROUND_LABELS[roundIdx] + '</div>';
    matches.forEach(function(match, matchIdx) {
      var pickKey = roundIdx + '-' + matchIdx;
      var pick = bracketPicks[pickKey];
      html += '<div class="bracket-match">';
      [0, 1].forEach(function(slot) {
        var team = match[slot];
        var isWinner = team && pick === team;
        var disabled = !team;
        html += '<button class="bracket-team' + (isWinner ? ' winner' : '') + '" data-round="' + roundIdx + '" data-match="' + matchIdx + '" data-team="' + (team || '') + '"' + (disabled ? ' disabled' : '') + '>' + (team || 'Por definir') + '</button>';
      });
      html += '</div>';
    });
    html += '</div>';
  }
  container.innerHTML = html;
  var champion = bracketPicks['3-0'];
  if (champion) {
    container.innerHTML += '<div class="champion-banner">Campeon de tu bracket: ' + champion + '</div>';
  }
  container.querySelectorAll('.bracket-team').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var team = btn.dataset.team;
      if (!team) return;
      var roundIdx = Number(btn.dataset.round);
      var matchIdx = Number(btn.dataset.match);
      Object.keys(bracketPicks).forEach(function(key) {
        var keyRound = Number(key.split('-')[0]);
        if (keyRound > roundIdx) delete bracketPicks[key];
      });
      bracketPicks[roundIdx + '-' + matchIdx] = team;
      localStorage.setItem('bracketPicks', JSON.stringify(bracketPicks));
      renderMiBracket();
    });
  });
}
