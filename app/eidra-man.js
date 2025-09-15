// show that this external file is running
const box = document.getElementById("eidra-out");
if (box) box.textContent = "Eidra test: external script is running";

import { eidra } from "../engine/engine.js";

const sessionId = "demo";

try {
  const out = await eidra.load_scene({ sessionId, sceneId: "mirrorfields_intro" });
  if (box) {
    box.innerHTML = `
      <b>Scene:</b> ${out.scene.id}<br>
      <b>Text:</b> ${out.scene.text}<br>
      <b>Choices:</b> <ul>${out.scene.choices.map(c=>`<li>${c.label}</li>`).join('')}</ul>
    `;
  }
  console.log("SCENE:", out.scene.id, out.scene);
} catch (err) {
  if (box) box.innerHTML = `<b>Error:</b> ${String(err)}`;
  console.error(err);
}
