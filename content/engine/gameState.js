export const defaultState = {
  scene: "mirrorfields_intro",
  pulsewheel: "Neutral",
  redThread: 0,
  sigils: { joined:false, spark:false, breath:false, witnessKnot:false, nulls:0 },
  flags: {},
  loveIndex: { max: { tenderness:0, witness:0, endurance:0 } }
};

const sessions = new Map();

export function getState(id) {
  if (!sessions.has(id)) {
    sessions.set(id, JSON.parse(JSON.stringify(defaultState)));
  }
  return sessions.get(id);
}

export function setState(id, patch) {
  const cur = getState(id);
  const next = {
    ...cur,
    ...patch,
    sigils: { ...cur.sigils, ...(patch.sigils || {}) },
    flags:  { ...cur.flags,  ...(patch.flags  || {}) }
  };
  sessions.set(id, next);
  // optional save in browser
  try {
    localStorage.setItem("eidra_" + id, JSON.stringify(next));
  } catch {}
  return next;
}
