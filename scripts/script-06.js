// source: inline block 6
window.SUPABASE_URL = "https://rslhteikozqqwdigqffv.supabase.co";
window.SUPABASE_ANON_KEY = "sb_publishable_cwly_-vwqB_ZkhWHrqd6og_Uk4YkPTb";

async function submitLeaderboardScore() {
  try {
    if (!game) return;
    const score = Math.max(0, Math.floor((typeof totalScore === "function" ? totalScore() : (game.score || 0))));
    if (score <= 0) return;

    const playerName = (localStorage.getItem("undead_player_name") || "PLAYER").trim().substring(0, 20) || "PLAYER";

    const payload = {
      player_name: playerName,
      score: score,
      level: Math.max(1, Math.floor((game.hero && game.hero.level) || game.level || 1)),
      kills: Math.max(0, Math.floor(game.kills || 0)),
      survival_time: Math.max(0, Math.floor(game.t || 0))
    };

    const base = String(window.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
    const existingResponse = await fetch(
      base + "/rest/v1/leaderboard?select=score&player_name=eq." + encodeURIComponent(playerName) + "&limit=1",
      {
        headers: {
          "apikey": window.SUPABASE_ANON_KEY,
          "Authorization": "Bearer " + window.SUPABASE_ANON_KEY
        }
      }
    );

    if (existingResponse.ok) {
      const rows = await existingResponse.json();
      const existingScore = rows && rows[0] ? Number(rows[0].score || 0) : 0;
      if (existingScore >= score) {
        console.log("Leaderboard score not submitted; existing score is higher or equal", {existingScore, score});
        return;
      }
    }

    const response = await fetch(base + "/rest/v1/leaderboard?on_conflict=player_name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": window.SUPABASE_ANON_KEY,
        "Authorization": "Bearer " + window.SUPABASE_ANON_KEY,
        "Prefer": "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log("Leaderboard high score submitted", payload);
      setTimeout(showLeaderboard, 500);
    } else {
      console.warn("Leaderboard submit failed", response.status, await response.text().catch(()=>""));
    }
  } catch (e) {
    console.warn("Leaderboard submit error", e);
  }
}

async function fetchLeaderboard() {
  try {
    const response = await fetch(
      window.__undeadSupabaseBaseUrl() + "/rest/v1/leaderboard?select=player_name,score&order=score.desc&limit=10",
      {
        headers: {
          "apikey": window.SUPABASE_ANON_KEY,
          "Authorization": "Bearer " + window.SUPABASE_ANON_KEY
        }
      }
    );
    if (!response.ok) return [];
    return await response.json();
  } catch (e) {
    return [];
  }
}

async function showLeaderboard() {
  const rows = await fetchLeaderboard();
  if (!rows.length) rows.push({player_name:'No scores yet', score:0});

  let panel = document.getElementById("leaderboardPanel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "leaderboardPanel";
    panel.style.cssText =
      "position:absolute;top:20px;right:20px;width:min(32vw,320px);" +
      "max-height:70vh;overflow:auto;background:rgba(0,0,0,0.72);" +
      "color:#f0e6c0;border:1px solid rgba(212,175,55,0.5);" +
      "border-radius:12px;padding:12px;font-family:serif;" +
      "z-index:30;font-size:14px;";
    document.body.appendChild(panel);
  }

  let content = "<h3 style='margin:0 0 8px 0;color:#d4af37;'>Global Top 10</h3><table style='width:100%'>";
  rows.forEach((r, i) => {
    const name = (r.player_name || "Player").substring(0, 20);
    content += "<tr><td>" + (i + 1) + ".</td><td>" + name +
               "</td><td style='text-align:right'>" + r.score + "</td></tr>";
  });
  content += "</table>";
  panel.innerHTML = content;

  const start = document.getElementById("start");
  panel.style.display = (!start || getComputedStyle(start).display !== "none") ? "block" : "none";
}

window.addEventListener("DOMContentLoaded", function() {
  setTimeout(function(){ if (document.getElementById("leaderboardPanel")) showLeaderboard(); }, 1000);
  setInterval(function(){ if (document.getElementById("leaderboardPanel")) showLeaderboard(); }, 15000);
});

window.addEventListener("load", function() {
  if (typeof window.endGame === "function" && !window._leaderboardWrapped) {
    const originalEndGame = window.endGame;
    window.endGame = function() {
      const result = originalEndGame.apply(this, arguments);
      setTimeout(submitLeaderboardScore, 500);
      return result;
    };
    window._leaderboardWrapped = true;
  }
});
