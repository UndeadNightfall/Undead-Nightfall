// source: inline block 8
function openUsernamePanel(event) {
  if (event) {
    try {
      event.preventDefault();
      event.stopPropagation();
    } catch (e) {}
  }

  const instructions = document.getElementById("instructions");
  const controls = document.getElementById("controlsPanel");
  const username = document.getElementById("usernamePanel");

  if (instructions) {
    instructions.classList.remove("show");
    instructions.style.display = "none";
  }

  if (controls) {
    controls.classList.remove("show");
    controls.style.display = "none";
  }

  if (username) {
    username.style.display = "block";
    username.classList.add("show");
    username.classList.add("forceOpen");
  }

  const instructionBtn = document.getElementById("showInstructions");
  const controlsBtn = document.getElementById("showControls");
  const usernameBtn = document.getElementById("usernameBtn");

  if (instructionBtn) instructionBtn.textContent = "Instructions";
  if (controlsBtn) controlsBtn.textContent = "Controls";
  if (usernameBtn) usernameBtn.textContent = "Hide Username";

  const display = document.getElementById("usernameDisplay");
  if (display) {
    const saved = localStorage.getItem("undead_player_name") || "PLAYER";
    display.textContent = saved.toUpperCase();
  }

  return false;
}

// Close Username panel when Instructions or Controls are opened.
window.addEventListener("DOMContentLoaded", function() {
  const usernameBtn = document.getElementById("usernameBtn");
  if (usernameBtn) {
    usernameBtn.onclick = openUsernamePanel;
  }

  ["showInstructions", "showControls"].forEach(function(id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", function() {
      const username = document.getElementById("usernamePanel");
      if (username) {
        username.classList.remove("show");
        username.classList.remove("forceOpen");
        username.style.display = "none";
      }
      const usernameBtn = document.getElementById("usernameBtn");
      if (usernameBtn) usernameBtn.textContent = "Username";
    }, true);
  });
});
