import { getState, setState } from "./gameState.js";

// --- helper to load a scene JSON by id from /content ---
async function loadSceneDef(id){
  const res = await fetch(`/content/${id}.json`);
  if(!res.ok) throw new Error(`Scene not found: ${id}`);
  return res.json();
}

// --- apply effects to state (pulsewheel, redThread, sigils, flags, loveIndex) ---
function applyEffects(s, fx = {}){
  const next = structuredClone(s);

  if (fx["redThread.inc"]) next.redThread += Number(fx["redThread.inc"]);
  if (fx["pulsewheel.set"]) next.pulsewheel = fx["pulsewheel.set"];
  if (fx["sigils.set"]) Object.assign(next.sigils, fx["sigils.set"]);
  if (fx["flags.set"])  Object.assign(next.flags,  fx["flags.set"]);

  if (fx["loveIndex.inc"]) {
    for (const [k, v] of Object.entries(fx["loveIndex.inc"])) {
      next.loveIndex.max[k] = (next.loveIndex.max[k] || 0) + Number(v);
    }
  }
  return next;
}

// --- public engine actions the app (or model) can call ---
export const eidra = {
  // get the current scene (or a specific one)
  async load_scene({ sessionId, sceneId }){
    const st = getState(sessionId);
    const scene = await loadSceneDef(sceneId || st.scene);
    return { scene, state: st };
  },

  // pick a choice and advance to its target scene
  async choose({ sessionId, choiceId }){
    const st = getState(sessionId);
    const scene = await loadSceneDef(st.scene);
    const c = scene.choices.find(x => x.id === choiceId);
    if(!c) throw new Error(`Choice not found: ${choiceId}`);
    const next = applyEffects(st, c.effects);
    next.scene = c.target;
    setState(sessionId, next);
    const nextScene = await loadSceneDef(next.scene);
    return { scene: nextScene, state: next };
  },

  // use silence to branch
  async wait({ sessionId }){
    const st = getState(sessionId);
    const scene = await loadSceneDef(st.scene);
    if (!scene.wait) return { scene, state: st }; // nothing to do
    const next = applyEffects(st, scene.wait.effects);
    next.scene = scene.wait.target;
    setState(sessionId, next);
    const nextScene = await loadSceneDef(next.scene);
    return { scene: nextScene, state: next };
  }
};
