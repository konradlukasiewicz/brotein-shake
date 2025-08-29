import React, { useEffect, useMemo, useState } from "react";
import MobileGuard from "../../components/MobileGuard";
import { Link } from "react-router-dom";

// styles (reuse your existing tables/buttons)
import "../../assets/css/home.css";
import "../../assets/css/button.css";
import "../../assets/css/text.css";
import "../../assets/css/workout-log.css";

// data (your JSON files)
import PRIORITY from "../../data/priority.json";
import EXERCISES from "../../data/exercises.json";

/* --------- storage / date helpers (match WorkoutLog) --------- */
const STORAGE_KEY = "brotein_log_v4";

function loadLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveLogs(obj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}
function isoToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}
function daysDiffFromToday(dateKey) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateKey + "T00:00:00");
  return Math.round((today - d) / (1000 * 60 * 60 * 24));
}
function humanDayLabel(dateKey) {
  const diff = daysDiffFromToday(dateKey);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) {
    return new Date(dateKey + "T00:00:00").toLocaleDateString(undefined, {
      weekday: "long",
    });
  }
  return new Date(dateKey + "T00:00:00").toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/* --------- exercise helpers (reuse priorities) --------- */
const typesByName = Object.fromEntries(EXERCISES.map((e) => [e.name, e.type || []]));
const MUSCLES = Object.keys(PRIORITY);
function sortedExercisesFor(muscle) {
  const priorityList = PRIORITY[muscle] || [];
  const idx = new Map(priorityList.map((n, i) => [n, i]));
  return EXERCISES
    .filter((e) => e.primary === muscle)
    .slice()
    .sort((a, b) => {
      const ai = idx.has(a.name) ? idx.get(a.name) : 1e9;
      const bi = idx.has(b.name) ? idx.get(b.name) : 1e9;
      if (ai !== bi) return ai - bi;
      return a.name.localeCompare(b.name);
    });
}
function hasBodyweightOption(name) {
  const types = typesByName[name] || [];
  if (types.includes("bodyweight")) return true;
  const n = name.toLowerCase();
  return (
    n.includes("push up") ||
    n.includes("pull up") ||
    n.includes("chin up") ||
    n.includes("dip") ||
    n.includes("plank") ||
    n.includes("crunch") ||
    n.includes("leg raise") ||
    n.includes("sit up")
  );
}
function defaultType(name) {
  const t = typesByName[name] || [];
  return t[0] || "";
}

/* ======================= MOBILE HOME ======================= */
export default function HomeMobile() {
  const [phase, setPhase] = useState("splash"); // splash -> login (first time) -> app
  const [tab, setTab] = useState("log");
  const [logsByDate, setLogsByDate] = useState(loadLogs);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const authed = localStorage.getItem("bs_authed") === "1";
      setPhase(authed ? "app" : "login");
    }, 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => saveLogs(logsByDate), [logsByDate]);

  function doLogin() {
    localStorage.setItem("bs_authed", "1");
    setPhase("app");
  }
  function logOut() {
    localStorage.removeItem("bs_authed");
    setPhase("login");
  }

  // Flatten workouts into a single feed, newest first
  const feed = useMemo(() => {
    const items = [];
    for (const dayKey of Object.keys(logsByDate)) {
      const arr = logsByDate[dayKey] || [];
      for (const w of arr) items.push({ ...w, dateKey: dayKey });
    }
    items.sort((a, b) => {
      const da = a.dateKey, db = b.dateKey;
      if (da !== db) return new Date(db) - new Date(da);
      return (b.id || "").localeCompare(a.id || "");
    });
    return items;
  }, [logsByDate]);

  function addWorkout(dateKey, workout) {
    setLogsByDate((prev) => {
      const next = { ...prev };
      next[dateKey] = [...(next[dateKey] || []), workout];
      return next;
    });
  }

  return (
    <MobileGuard>
      {phase === "splash" && <Splash />}

      {phase === "login" && (
        <div className="login-overlay">
          <div className="login-card">
            <h2 style={{ marginTop: 0 }}>Welcome</h2>
            <p>Sign in to continue.</p>
            <button className="big-button" onClick={doLogin}>Log in</button>
          </div>
        </div>
      )}

      {phase === "app" && (
        <div className="mobile-app">
          <main className="mobile-main">
            {tab === "log" && (
              <section>
                <h2 className="mobile-h2">Log</h2>
                {feed.length === 0 ? (
                  <p style={{ opacity: .8 }}>No workouts yet. Tap the + to add one.</p>
                ) : (
                  <ul className="workout-list" style={{ gap: ".5rem" }}>
                    {feed.map((w) => (
                      <FeedItem key={w.id} workout={w} />
                    ))}
                  </ul>
                )}
              </section>
            )}

            {tab === "generate" && (
              <section>
                <h2 className="mobile-h2">Generate</h2>
                <p>Build a routine tailored to you.</p>
                <Link to="/custom-workout">
                  <button className="big-button">Create Custom Workout</button>
                </Link>
                <span style={{ display: "inline-block", width: 8 }} />
                <Link to="/splits">
                  <button className="big-button">Browse Splits</button>
                </Link>
              </section>
            )}

            {tab === "info" && (
              <section>
                <h2 className="mobile-h2">Info</h2>
                <a
                  className="purple-button"
                  href="https://www.planetfitness.com/summerpass"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Free Planet Fitness Pass
                </a>
              </section>
            )}

            {tab === "settings" && (
              <section>
                <h2 className="mobile-h2">Settings</h2>
                <button className="big-button" onClick={logOut}>Log out</button>
              </section>
            )}
          </main>

          {/* Floating + button to add a workout inline */}
          {tab === "log" && (
            <button className="fab" aria-label="Add workout" onClick={() => setAddOpen(true)}>
              +
            </button>
          )}

          <nav className="bottom-nav">
            <Tab id="log" icon="📓" label="Log" tab={tab} setTab={setTab} />
            <Tab id="generate" icon="⚡" label="Generate" tab={tab} setTab={setTab} />
            <Tab id="info" icon="ℹ️" label="Info" tab={tab} setTab={setTab} />
            <Tab id="settings" icon="⚙️" label="Settings" tab={tab} setTab={setTab} />
          </nav>
        </div>
      )}

      {addOpen && (
        <AddEditWorkoutModal
          mode="add"
          onClose={() => setAddOpen(false)}
          onSubmit={(dateKey, payload) => {
            addWorkout(dateKey, payload);
            setAddOpen(false);
          }}
        />
      )}
    </MobileGuard>
  );
}

/* ---------- little components ---------- */
function Splash() {
  return (
    <div className="splash-overlay">
      <div className="splash-card">
        <h1 className="main-title" style={{ margin: 0 }}>BROTEIN SHAKE</h1>
      </div>
    </div>
  );
}

function Tab({ icon, label, id, tab, setTab }) {
  const active = tab === id;
  return (
    <button className={`bottom-tab ${active ? "active" : ""}`} onClick={() => setTab(id)}>
      <span className="tab-ic" aria-hidden="true">{icon}</span>
      <span className="tab-label">{label}</span>
    </button>
  );
}

function FeedItem({ workout }) {
  const [open, setOpen] = useState(false);
  const dateLabel = humanDayLabel(workout.dateKey);

  return (
    <li className="workout-item">
      <button
        className={`workout-bar mobile-header ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="wb-left">
          <span className="workout-title">{workout.title}</span>
          <span className="workout-time">• {dateLabel}{workout.time ? ` @ ${workout.time}` : ""}</span>
        </div>
        <span className={`chev ${open ? "rot" : ""}`} aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="workout-details mobile-details">
          <ul className="ex-list">
            {workout.exercises.map((ex, idx) => (
              <li key={idx} className="ex-row">
                <div className="ex-name">{ex.name}</div>
                <div className="ex-meta">
                  {ex.sets} sets × {ex.reps} reps{" "}
                  {ex.isBW ? "· BW" : (ex.weight !== "" && ex.weight !== null && ex.weight !== undefined ? `@ ${ex.weight} lb` : "")}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}


/* ---------- Add/Edit Modal (add only here) ---------- */
function AddEditWorkoutModal({ mode, onClose, onSubmit }) {
  const isEdit = mode === "edit";
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [dateVal, setDateVal] = useState(isoToday());

  const [rows, setRows] = useState([]); // { name, type, sets, reps, weight, isBW }
  const [muscle, setMuscle] = useState(MUSCLES[0] || "");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const within = muscle ? sortedExercisesFor(muscle) : EXERCISES;
    const q = query.trim().toLowerCase();
    const filtered = q
      ? within.filter(
          (e) => e.name.toLowerCase().includes(q) || e.primary.toLowerCase().includes(q)
        )
      : within;
    const chosen = new Set(rows.map((r) => r.name));
    return filtered.slice().sort((a, b) => {
      const ain = chosen.has(a.name) ? -1 : 0;
      const bin = chosen.has(b.name) ? -1 : 0;
      if (ain !== bin) return ain - bin;
      return a.name.localeCompare(b.name);
    });
  }, [muscle, query, rows]);

  function toggleExercise(name) {
    setRows((prev) => {
      const exists = prev.find((r) => r.name === name);
      if (exists) return prev.filter((r) => r.name !== name);
      return [...prev, { name, type: defaultType(name), sets: 3, reps: 10, weight: "", isBW: false }];
    });
  }
  function setRow(name, patch) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.name !== name) return r;
        let next = { ...r, ...patch };
        if ("isBW" in patch && patch.isBW) {
          const types = typesByName[name] || [];
          if (types.includes("bodyweight")) next.type = "bodyweight";
          next.weight = "";
        }
        if ("isBW" in patch && !patch.isBW && r.type === "bodyweight") {
          const types = (typesByName[name] || []).filter((t) => t !== "bodyweight");
          if (types.length > 0) next.type = types[0];
        }
        return next;
      })
    );
  }
  function step(name, field, delta, lo, hi) {
    setRows((prev) =>
      prev.map((r) =>
        r.name === name ? { ...r, [field]: Math.max(lo, Math.min(hi, Number(r[field] || 0) + delta)) } : r
      )
    );
  }

  function handleSave() {
    if (!title.trim()) return alert("Title required.");
    if (!dateVal) return alert("Date required.");
    if (rows.length === 0) return alert("Choose at least one exercise.");
    const payload = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      time: time.trim(),
      dateKey: dateVal,
      exercises: rows.map((r) => ({
        name: r.name,
        type: r.type,
        sets: Number(r.sets) || 0,
        reps: Number(r.reps) || 0,
        // numeric only; empty when BW or blank
        weight: r.isBW ? "" : (r.weight === "" || r.weight == null ? "" : Number(r.weight)),
        isBW: !!r.isBW,
      })),
    };
    onSubmit(dateVal, payload);
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <h2>{isEdit ? "Edit Workout" : "Add Workout"}</h2>
          <button className="close-x" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="form-grid">
          <label className="field">
            <span>Title</span>
            <input className="input" placeholder="e.g., Push Day" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="field">
            <span>Time (optional)</span>
            <input className="input" placeholder="e.g., 5:30 PM" value={time} onChange={(e) => setTime(e.target.value)} />
          </label>
          <label className="field">
            <span>Date</span>
            <input className="input" type="date" value={dateVal} onChange={(e) => setDateVal(e.target.value)} />
          </label>
        </div>

        <div className="picker-head">
          <h3>Choose Exercises</h3>
          <div className="picker-controls">
            <select className="input" value={muscle} onChange={(e) => setMuscle(e.target.value)}>
              {MUSCLES.map((m) => <option value={m} key={m}>{m[0].toUpperCase() + m.slice(1)}</option>)}
            </select>
            <input className="input" placeholder="Search name or muscle" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="picker-list">
          {list.map((e) => {
            const chosen = !!rows.find((r) => r.name === e.name);
            return (
              <button key={e.name} className={`ex-chip ${chosen ? "chosen" : ""}`} onClick={() => toggleExercise(e.name)} aria-pressed={chosen}>
                <span className="chip-name">{e.name}</span>
                <span className="chip-muscle">{e.primary}</span>
                <span className="chip-plus">{chosen ? "✓" : "+"}</span>
              </button>
            );
          })}
        </div>

        {rows.length > 0 && (
          <div className="chosen-table-wrap">
            <table className="ex-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Type</th>
                  <th>Sets</th>
                  <th>Reps</th>
                  <th style={{ whiteSpace: "nowrap" }}>Weight</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const types = typesByName[r.name] || [];
                  const bwCapable = hasBodyweightOption(r.name);
                  return (
                    <tr key={r.name}>
                      <td>{r.name}</td>
                      <td>
                        <select
                          className="type-select"
                          value={r.type}
                          onChange={(e) => setRow(r.name, { type: e.target.value, isBW: e.target.value === "bodyweight" })}
                        >
                          {types.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td>
                        <div className="stepper">
                          <button className="stepper-btn" onClick={() => step(r.name, "sets", -1, 1, 9)}>-</button>
                          <div className="stepper-num">{r.sets ?? 3}</div>
                          <button className="stepper-btn" onClick={() => step(r.name, "sets", +1, 1, 9)}>+</button>
                        </div>
                      </td>
                      <td>
                        <div className="stepper">
                          <button className="stepper-btn" onClick={() => step(r.name, "reps", -1, 1, 99)}>-</button>
                          <div className="stepper-num">{r.reps ?? 10}</div>
                          <button className="stepper-btn" onClick={() => step(r.name, "reps", +1, 1, 99)}>+</button>
                        </div>
                      </td>
                      <td>
                        <div className="weight-cell">
                          <input
                            className="mini-input weight"
                            type="number"
                            inputMode="decimal"
                            step="0.5"
                            min="0"
                            placeholder={r.isBW ? "BW" : "e.g., 135"}
                            value={r.isBW ? "" : String(r.weight ?? "")}
                            onChange={(e) => {
                              let v = e.target.value.replace(/[^0-9.]/g, "");
                              const parts = v.split(".");
                              if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
                              setRow(r.name, { weight: v });
                            }}
                            readOnly={r.isBW}
                          />
                          {!r.isBW && <span className="lb-suffix">lb</span>}
                          {bwCapable && (
                            <button
                              className={`bw-btn ${r.isBW ? "active" : ""}`}
                              onClick={() => setRow(r.name, { isBW: !r.isBW })}
                              type="button"
                            >
                              BW
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <button className="tiny danger" onClick={() => setRows((prev) => prev.filter((x) => x.name !== r.name))}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-actions">
          <button className="big-button save" onClick={handleSave}>Save workout</button>
          <button className="big-button cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
