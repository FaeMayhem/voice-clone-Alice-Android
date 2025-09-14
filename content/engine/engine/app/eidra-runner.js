// app/eidra-runner.js
import { eidra } from "../engine/engine.js";

function el(tag, attrs={}, ...kids){
  const n = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) {
    if (k === "style") Object.assign(n.style, v);
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const k of kids) n.append(k);
  return n;
}

export function mountEidraTestOverlay(){
  const sessionId = crypto.randomUUID();

  // floating UI container (top-right)
  const box = el("div", { style:{
    position:"fixed", top:"12px", right:"12px", zIndex:999999,
    width:"360px", maxHeight:"70vh", overflow:"auto",
    background:"#111", color:"#eee", padding:"12px",
    borderRadius:"12px", boxShadow:"0 6px 24px rgba(0,0,0,.4)",
    fontFamily:"system-ui, sans-serif", lineHeight:"1.4"
  }});

  const title = el("div", {style:{fontWeight:"700", marginBottom:"8px"}}, "Eidra • Test Overlay");
  const body  = el("div", {style:{whiteSpace:"pre-wrap", margin:"8px 0"}});
  const choices = el("div", {style:{display:"grid", gap:"6px"}});
  const row = el("div", {style:{display:"flex", gap:"6px", marginTop:"8px"}});
  const startBtn = el("button", {style:btn()}, "Start scene");
  const waitBtn  = el("button", {style:btn(), disabled:true}, "Wait (🜸)");

  row.append(startBtn, waitBtn);
  box.append(title, body, choices, row);
  document.body.append(box);

  function btn(){
    return {
      background:"#222", color:"#fff", border:"1px solid #444",
      padding:"8px 10px", borderRadius:"10px", cursor:"pointer"
    };
  }

  function render(scene){
    body.textContent = scene.text || "(no text)";
    choices.innerHTML = "";
    (scene.choices || []).forEach(c=>{
      const b = el("button", {style:btn(), onclick: async ()=> {
        const { scene: next } = await eidra.choose({ sessionId, choiceId: c.id });
        render(next);
      }}, c.label);
      choices.append(b);
    });
    waitBtn.disabled = !scene.wait;
  }

  startBtn.addEventListener("click", async ()=>{
    const { scene } = await eidra.load_scene({ sessionId, sceneId:"mirrorfields_intro" });
    render(scene);
  });

  waitBtn.addEventListener("click", async ()=>{
    const { scene } = await eidra.wait({ sessionId });
    render(scene);
  });
}

// auto-mount if you open the page with ?eidra=1
try {
  const url = new URL(window.location.href);
  if (url.searchParams.get("eidra") === "1") {
    mountEidraTestOverlay();
  }
} catch {}
