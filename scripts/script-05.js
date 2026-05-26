// source: inline block 5
window.addEventListener("load", function(){
  const labels = {
    sword: "Sword",
    fire: "Fireball",
    fireball: "Fireball",
    bolt: "Lightning",
    lightning: "Lightning"
  };
  for (const [id, text] of Object.entries(labels)) {
    const el = document.getElementById(id);
    if (el && /custom/i.test(el.textContent)) el.textContent = text;
  }
});
