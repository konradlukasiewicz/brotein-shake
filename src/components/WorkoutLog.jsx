import React, { useEffect, useMemo, useRef, useState } from "react";
import "../assets/css/workout-log.css";
import EXERCISES from "../data/exercises.json";
import PRIORITY from "../data/priority.json";

const STORAGE_KEY = "brotein_log_v4";

/* ----------------------- date helpers ----------------------- */
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
  if (diff === 0) return "TOday";
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

/* ----------------------- persistence ----------------------- */
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

/* ----------------------- data helpers ----------------------- */
const typesByName = Object.fromEntries(EXERCISES.map((e) => [e.name, e.type || []]));
const primaryByName = Object.fromEntries(EXERCISES.map((e) => [e.name, e.primary]));
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

/* ----------------------- inline styles for day header ----------------------- */
const styles = {
  dayHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.6rem 0 0.4rem",
    borderBottom: "2px solid orange",
  },
  dayTitle: {
    fontFamily: "Track, sans-serif",
    fontSize: "1.2rem",
  },
  addGlobal: {
    background: "#1f1f1f",
    color: "#FAF9F6",
    border: "4px solid orange",
    borderRadius: "20px",
    padding: "0.55rem 1rem",
    fontSize: "1rem",
    cursor: "pointer",
  },
};

/* ======================= MAIN ======================= */
export default function WorkoutLog() {
  // logsByDate: { 'YYYY-MM-DD': [ {id, title, time, exercises:[{name, type, sets, reps, weight, isBW}]} ] }
  const [logsByDate, setLogsByDate] = useState(loadLogs);
  const [expanded, setExpanded] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editFor, setEditFor] = useState(null); // { dayKey, workout } | null
  const scrollerRef = useRef(null);

  useEffect(() => saveLogs(logsByDate), [logsByDate]);

  // Only show days that have workouts; newest first
  const dayKeys = useMemo(() => {
    const keys = Object.keys(logsByDate).filter((k) => (logsByDate[k] || []).length > 0);
    return keys.sort((a, b) => new Date(b + "T00:00:00") - new Date(a + "T00:00:00"));
  }, [logsByDate]);

  function addWorkout(dateKey, workout) {
    setLogsByDate((prev) => {
      const next = { ...prev };
      next[dateKey] = [...(next[dateKey] || []), workout];
      return next;
    });
    setExpanded(workout.id);
    requestAnimationFrame(() => {
      const el = scrollerRef.current;
      if (el) el.scrollTop = 0;
    });
  }
  function updateWorkout(dayKey, workout) {
    setLogsByDate((prev) => {
      const next = { ...prev };
      next[dayKey] = (next[dayKey] || []).map((w) => (w.id === workout.id ? workout : w));
      return next;
    });
    setExpanded(workout.id);
  }
  function deleteWorkout(dayKey, workoutId) {
    setLogsByDate((prev) => {
      const next = { ...prev };
      next[dayKey] = (next[dayKey] || []).filter((w) => w.id !== workoutId);
      if (next[dayKey]?.length === 0) delete next[dayKey];
      return next;
    });
  }

  return (
    <main className="log-main">
      <header className="log-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="main-title">Workout Log</h1>
        </div>
        <button style={styles.addGlobal} onClick={() => setAddOpen(true)}>+ Add workout</button>
      </header>

      <section className="log-scroller" ref={scrollerRef} aria-label="Workout history list">
        {dayKeys.length === 0 ? (
          <div style={{ opacity: 0.8, padding: "0.5rem 0" }}>
            No workouts yet. Click <strong>+ Add workout</strong> to log your first session.
          </div>
        ) : (
          dayKeys.map((dayKey) => {
            const workouts = logsByDate[dayKey];
            const dateLabel = humanDayLabel(dayKey);
            return (
              <div className="day-group" key={dayKey}>
                <div style={styles.dayHeader}>
                  <div style={styles.dayTitle}>{dateLabel}</div>
                </div>

                <ul className="workout-list" style={{ marginTop: "0.6rem" }}>
                  {workouts.map((w) => {
                    const isOpen = expanded === w.id;
                    const exerciseCount = w.exercises?.length || 0;
                    return (
                      <li key={w.id} className="workout-item">
                        <button
                          className={`workout-bar ${isOpen ? "open" : ""}`}
                          onClick={() => setExpanded(isOpen ? null : w.id)}
                          aria-expanded={isOpen}
                        >
                          <div className="workout-bar-left">
                            <span className="workout-title">{w.title}</span>
                            {w.time ? <span className="workout-time">@ {w.time}</span> : null}
                          </div>
                          <div className="workout-bar-right">
                            <span className="pill">{exerciseCount} exercises</span>
                            <span className="chev" aria-hidden="true">{isOpen ? "▴" : "▾"}</span>
                          </div>
                        </button>

                        {isOpen && (
                          <div className="workout-details">
                            <table className="ex-table">
                              <thead>
                                <tr>
                                  <th>Exercise</th>
                                  <th>Type</th>
                                  <th>Sets</th>
                                  <th>Reps</th>
                                  <th>Weight</th>
                                </tr>
                              </thead>
                              <tbody>
                                {w.exercises.map((ex, idx) => (
                                  <tr key={idx}>
                                    <td>{ex.name}</td>
                                    <td>{ex.type || defaultType(ex.name) || "-"}</td>
                                    <td>{ex.sets}</td>
                                    <td>{ex.reps}</td>
                                    <td>{ex.isBW ? "Bodyweight" : (ex.weight ? `${ex.weight} lb` : "-")}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="workout-actions">
                              <button className="tiny" onClick={() => setEditFor({ dayKey, workout: w })}>Edit</button>
                              <button className="danger-btn" onClick={() => deleteWorkout(dayKey, w.id)}>Delete</button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
      </section>

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

      {editFor && (
        <AddEditWorkoutModal
          mode="edit"
          dateKey={editFor.dayKey}
          initial={editFor.workout}
          onClose={() => setEditFor(null)}
          onSubmit={(_, updated) => {
            updateWorkout(editFor.dayKey, updated);
            setEditFor(null);
          }}
        />
      )}
    </main>
  );
}

/* ======================= Add/Edit Modal ======================= */
function AddEditWorkoutModal({ mode, dateKey, initial, onClose, onSubmit }) {
  const isEdit = mode === "edit";
  const [title, setTitle] = useState(initial?.title || "");
  const [time, setTime] = useState(initial?.time || "");
  const [dateVal, setDateVal] = useState(isEdit ? dateKey : isoToday());

  // rows = [{ name, type, sets, reps, weight, isBW }]
  const [rows, setRows] = useState(
    initial?.exercises?.map((e) => ({
      name: e.name,
      type: e.type || defaultType(e.name),
      sets: Number(e.sets) || 3,
      reps: Number(e.reps) || 10,
      weight: e.weight || "",
      isBW: !!e.isBW,
    })) || []
  );

  // picker state
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
    const chosenNames = new Set(rows.map((r) => r.name));
    return filtered.slice().sort((a, b) => {
      const ain = chosenNames.has(a.name) ? -1 : 0;
      const bin = chosenNames.has(b.name) ? -1 : 0;
      if (ain !== bin) return ain - bin;
      return a.name.localeCompare(b.name);
    });
  }, [muscle, query, rows]);

  function toggleExercise(name) {
    setRows((prev) => {
      const exists = prev.find((r) => r.name === name);
      if (exists) return prev.filter((r) => r.name !== name);
      return [
        ...prev,
        {
          name,
          type: defaultType(name),
          sets: 3,
          reps: 10,
          weight: "",
          isBW: false,
        },
      ];
    });
  }

  function clamp(v, lo, hi) {
    if (Number.isNaN(v)) return lo;
    return Math.max(lo, Math.min(hi, v));
  }

  function step(name, field, delta, lo, hi) {
    setRows((prev) =>
      prev.map((r) =>
        r.name === name ? { ...r, [field]: clamp(Number(r[field] || 0) + delta, lo, hi) } : r
      )
    );
  }

  function setRow(name, patch) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.name !== name) return r;
        let next = { ...r, ...patch };
        // If toggling BW on, snap type to "bodyweight" when available.
        if ("isBW" in patch && patch.isBW) {
          const types = typesByName[name] || [];
          if (types.includes("bodyweight")) next.type = "bodyweight";
          // also clear weight text while showing filled visual
          next.weight = "";
        }
        // If turning BW off and current type is bodyweight, pick first non-bodyweight type if available
        if ("isBW" in patch && !patch.isBW && r.type === "bodyweight") {
          const types = (typesByName[name] || []).filter((t) => t !== "bodyweight");
          if (types.length > 0) next.type = types[0];
        }
        return next;
      })
    );
  }

  function handleSave() {
    if (!title.trim()) return alert("Title required.");
    if (!dateVal) return alert("Date required.");
    if (rows.length === 0) return alert("Choose at least one exercise.");

    const payload = {
      id: initial?.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      time: time.trim(),
      dateKey: dateVal,
      exercises: rows.map((r) => ({
        name: r.name,
        type: r.type,
        sets: Number(r.sets) || 0,
        reps: Number(r.reps) || 0,
        weight: r.isBW ? "" : String(r.weight || ""),
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
            <input
              className="input"
              placeholder="e.g., Push Day, Legs A, Upper 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Time (optional)</span>
            <input
              className="input"
              placeholder="e.g., 5:30 PM"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Date</span>
            <input
              className="input"
              type="date"
              value={dateVal}
              onChange={(e) => setDateVal(e.target.value)}
            />
          </label>
        </div>

        <div className="picker-head">
          <h3>Choose Exercises</h3>
          <div className="picker-controls">
            <select className="input" value={muscle} onChange={(e) => setMuscle(e.target.value)}>
              {MUSCLES.map((m) => (
                <option value={m} key={m}>{m[0].toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Search name or muscle"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="picker-list">
          {list.map((e) => {
            const chosen = !!rows.find((r) => r.name === e.name);
            return (
              <button
                key={e.name}
                className={`ex-chip ${chosen ? "chosen" : ""}`}
                onClick={() => toggleExercise(e.name)}
                aria-pressed={chosen}
              >
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
                          onChange={(e) => setRow(r.name, { type: e.target.value, isBW: e.target.value === "bodyweight" ? true : r.isBW && false })}
                        >
                          {types.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
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
                            type="text"
                            placeholder="e.g., 135"
                            value={r.isBW ? "Bodyweight" : r.weight}
                            onChange={(e) => setRow(r.name, { weight: e.target.value })}
                            readOnly={r.isBW}
                            disabled={false}
                          />
                          {!r.isBW && <span className="lb-suffix">lb</span>}
                          {bwCapable && (
                            <button
                              className={`bw-btn ${r.isBW ? "active" : ""}`}
                              onClick={() => setRow(r.name, { isBW: !r.isBW })}
                              title="Toggle bodyweight"
                              type="button"
                            >
                              BW
                            </button>
                          )}
                        </div>
                      </td>

                      <td>
                        <button
                          className="tiny danger"
                          onClick={() => setRows((prev) => prev.filter((x) => x.name !== r.name))}
                          aria-label={`Remove ${r.name}`}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-actions">
          <button className="big-button save" onClick={handleSave}>
            {isEdit ? "Save changes" : "Save workout"}
          </button>
          <button className="big-button cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
