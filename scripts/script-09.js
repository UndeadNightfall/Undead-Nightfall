// source: inline block 9
(function(){
  function stop(e){
    if(e){
      try{ e.preventDefault(); e.stopPropagation(); }catch(err){}
    }
  }

  function getPanel(id){
    if(id === "leaderboard") return document.getElementById("leaderboardPanel");
    return document.getElementById(id);
  }

  function isPanelOpen(id){
    const panel = getPanel(id);
    if(!panel) return false;
    const style = window.getComputedStyle(panel);
    return panel.classList.contains("show") ||
           panel.classList.contains("forceOpen") ||
           style.display !== "none";
  }

  function setButtonLabels(){
    const labels = {
      showInstructions: "Instructions",
      showControls: "Controls",
      leaderboardBtn: "Leaderboard",
      usernameBtn: "Username"
    };
    Object.entries(labels).forEach(([id, text]) => {
      const btn = document.getElementById(id);
      if(btn) btn.textContent = text;
    });
  }

  function closeAllOverlayPanels(){
    ["instructions", "controlsPanel", "usernamePanel"].forEach(id => {
      const panel = document.getElementById(id);
      if(panel){
        panel.classList.remove("show");
        panel.classList.remove("forceOpen");
        panel.style.display = "none";
      }
    });

    const leaderboard = document.getElementById("leaderboardPanel");
    if(leaderboard){
      leaderboard.style.display = "none";
      leaderboard.classList.remove("show");
    }

    setButtonLabels();
  }

  async function openOverlayPanel(id){
    closeAllOverlayPanels();

    if(id === "instructions"){
      const panel = document.getElementById("instructions");
      if(panel){ panel.style.display = "block"; panel.classList.add("show"); }
      const btn = document.getElementById("showInstructions");
      if(btn) btn.textContent = "Hide Instructions";
      return;
    }

    if(id === "controlsPanel"){
      const panel = document.getElementById("controlsPanel");
      if(panel){ panel.style.display = "block"; panel.classList.add("show"); }
      const btn = document.getElementById("showControls");
      if(btn) btn.textContent = "Hide Controls";
      try{ if(typeof updateControlButtons === "function") updateControlButtons(); }catch(err){}
      return;
    }

    if(id === "usernamePanel"){
      const panel = document.getElementById("usernamePanel");
      if(panel){
        panel.style.display = "block";
        panel.classList.add("show");
        panel.classList.add("forceOpen");
      }
      const btn = document.getElementById("usernameBtn");
      if(btn) btn.textContent = "Hide Username";
      const display = document.getElementById("usernameDisplay");
      if(display){
        const saved = localStorage.getItem("undead_player_name") || "PLAYER";
        display.textContent = saved.toUpperCase();
      }
      return;
    }

    if(id === "leaderboard"){
      try{ if(typeof showLeaderboard === "function") await showLeaderboard(); }catch(err){}
      const panel = document.getElementById("leaderboardPanel");
      if(panel){
        panel.style.display = "block";
        panel.classList.add("show");
      }
      const btn = document.getElementById("leaderboardBtn");
      if(btn) btn.textContent = "Hide Leaderboard";
    }
  }

  window.toggleOverlayPanel = function(e, id){
    stop(e);

    const map = {
      instructions: "showInstructions",
      controlsPanel: "showControls",
      leaderboard: "leaderboardBtn",
      usernamePanel: "usernameBtn"
    };

    const targetPanel = getPanel(id);
    const wasOpen = isPanelOpen(id);

    // If target was open, close everything.
    if (wasOpen) {
      closeAllOverlayPanels();
      return false;
    }

    // Close everything first.
    closeAllOverlayPanels();

    // Open requested panel.
    if (id === "instructions") {
      const panel = document.getElementById("instructions");
      if (panel) {
        panel.style.display = "block";
        panel.classList.add("show");
      }
    }

    if (id === "controlsPanel") {
      const panel = document.getElementById("controlsPanel");
      if (panel) {
        panel.style.display = "block";
        panel.classList.add("show");
      }
      try {
        if (typeof updateControlButtons === "function") updateControlButtons();
      } catch (err) {}
    }

    if (id === "usernamePanel") {
      const panel = document.getElementById("usernamePanel");
      if (panel) {
        panel.style.display = "block";
        panel.classList.add("show");
        panel.classList.add("forceOpen");
      }
      const display = document.getElementById("usernameDisplay");
      if (display) {
        const saved = localStorage.getItem("undead_player_name") || "PLAYER";
        display.textContent = saved.toUpperCase();
      }
    }

    if (id === "leaderboard") {
      try {
        if (typeof showLeaderboard === "function") showLeaderboard();
      } catch (err) {}
      const panel = document.getElementById("leaderboardPanel");
      if (panel) {
        panel.style.display = "block";
        panel.classList.add("show");
      }
    }

    const btnId = map[id];
    const btn = document.getElementById(btnId);
    if (btn) {
      const labels = {
        instructions: "Hide Instructions",
        controlsPanel: "Hide Controls",
        leaderboard: "Hide Leaderboard",
        usernamePanel: "Hide Username"
      };
      btn.textContent = labels[id];
    }

    return false;
  };

  window.addEventListener("DOMContentLoaded", function(){
    const bindings = [
      ["showInstructions", "instructions"],
      ["showControls", "controlsPanel"],
      ["leaderboardBtn", "leaderboard"],
      ["usernameBtn", "usernamePanel"]
    ];

    bindings.forEach(([buttonId, panelId]) => {
      const btn = document.getElementById(buttonId);
      if(!btn) return;
      btn.onclick = function(e){ return window.toggleOverlayPanel(e, panelId); };
    });
  });
})();
