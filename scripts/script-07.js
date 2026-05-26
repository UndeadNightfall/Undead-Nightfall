// source: inline block 7
(function(){
  const MAX_NAME = 20;

  function currentName(){
    return (localStorage.getItem("undead_player_name") || "PLAYER").substring(0, MAX_NAME).toUpperCase();
  }

  function setNameDisplay(value){
    const display = document.getElementById("usernameDisplay");
    if (display) display.textContent = (value || "PLAYER").toUpperCase();
  }

  function saveName(value){
    const clean = (value || "PLAYER").trim().substring(0, MAX_NAME);
    localStorage.setItem("undead_player_name", clean || "Player");
    setNameDisplay(clean || "PLAYER");
    const notice = document.getElementById("usernameNotice");
    if (notice) {
      notice.style.display = "block";
      setTimeout(() => { notice.style.display = "none"; }, 1600);
    }
  }

  function updateButtonText(){
    const btn = document.getElementById("usernameBtn");
    if (btn) btn.textContent = "Username";
  }

  window.addEventListener("DOMContentLoaded", function(){
    let buffer = currentName();
    setNameDisplay(buffer);
    updateButtonText();

    const keyboard = document.getElementById("gothicKeyboard");
    if (!keyboard) return;

    keyboard.addEventListener("pointerdown", function(e){
      const keyBtn = e.target.closest("button[data-key]");
      if (!keyBtn) return;
      e.preventDefault();

      const key = keyBtn.dataset.key;

      if (key === "back") {
        buffer = buffer.slice(0, -1);
      } else if (key === "clear") {
        buffer = "";
      } else if (key === "space") {
        if (buffer.length < MAX_NAME && buffer.length > 0 && !buffer.endsWith(" ")) buffer += " ";
      } else if (key === "save") {
        saveName(buffer);
        return;
      } else if (/^[A-Z]$/.test(key)) {
        if (buffer.length < MAX_NAME) buffer += key;
      }

      setNameDisplay(buffer || "PLAYER");
    });
  });

  // Expand existing title panel toggle so Username behaves like Instructions/Controls.
  const originalToggleTitlePanel = window.toggleTitlePanel;
  window.toggleTitlePanel = function(e, id){
    const username = document.getElementById("usernamePanel");
    const usernameBtn = document.getElementById("usernameBtn");
    const shouldShowUsername = id === "usernamePanel" && username && !username.classList.contains("show");

    if (typeof originalToggleTitlePanel === "function" && id !== "usernamePanel") {
      if (username) username.classList.remove("show");
      if (usernameBtn) usernameBtn.textContent = "Username";
      return originalToggleTitlePanel(e, id);
    }

    if (e) {
      try { e.preventDefault(); e.stopPropagation(); } catch(err) {}
    }

    ["instructions","controlsPanel","usernamePanel"].forEach(panelId => {
      const panel = document.getElementById(panelId);
      if (panel) panel.classList.remove("show");
    });

    const instructionBtn = document.getElementById("showInstructions");
    const controlsBtn = document.getElementById("showControls");
    if (instructionBtn) instructionBtn.textContent = "Instructions";
    if (controlsBtn) controlsBtn.textContent = "Controls";
    if (usernameBtn) usernameBtn.textContent = "Username";

    if (shouldShowUsername) {
      username.classList.add("show");
      if (usernameBtn) usernameBtn.textContent = "Hide Username";
      setNameDisplay(currentName());
    }

    return false;
  };
})();
