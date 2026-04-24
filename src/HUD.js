// src/HUD.js
export function createHUD() {
  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = `
    Stardust — String Theory <br>
    by Cris Elias
      `;
  document.body.appendChild(hud);
  return hud;
}