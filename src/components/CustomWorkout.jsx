import { useState, useMemo } from "react";
import "../assets/css/tag.css";
import exercises from "../data/exercises.json";
import priority from "../data/priority.json";

const TAGS = [
  "Chest","Triceps","Shoulders","Back","Biceps","Rear Delts",
  "Quads","Hamstrings","Calves","Glutes","Core"
];

const SPLITS = ["Push Pull Legs", "Upper Lower", "Full Body", "Arnold"];
const SET_OPTIONS = ["1", "2", "3"];

const SPLIT_DAYS = {
  "Push Pull Legs": ["Push", "Pull", "Legs"],
  "Upper Lower": ["Upper", "Lower"],
  "Arnold": ["Chest/Back", "Shoulders/Arms", "Legs"],
  "Full Body": []
};

const SPLIT_DAY_MUSCLES = {
  "Push Pull Legs": {
    "Push": ["chest", "triceps", "shoulders"],
    "Pull": ["back", "biceps", "rear delts"],
    "Legs": ["quads", "hamstrings", "glutes", "calves"]
  },
  "Upper Lower": {
    "Upper": ["chest", "triceps", "shoulders", "back", "biceps"],
    "Lower": ["quads","hamstrings","glutes","calves"]
  },
  "Arnold": {
    "Chest/Back": ["chest", "back", "rear delts"],
    "Shoulders/Arms": ["shoulders", "biceps", "triceps"],
    "Legs": ["quads", "hamstrings","glutes","calves"]
  },
  "Full Body": {
    "Full Body": [
      "chest", "triceps", "shoulders", "back",
      "biceps", "quads", "hamstrings", "glutes"
    ]
  }
};

export default function CustomWorkout() {
  const [activeMethod, setActiveMethod] = useState("split");
  
  // Split selection
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [splitDropdownOpen, setSplitDropdownOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // Muscle selection
  const [tags, setTags] = useState(
    TAGS.map((name, i) => ({
      name,
      originalIndex: i,
      selected: false,
      selectedRank: null,
    }))
  );
  const [muscleDropdownOpen, setMuscleDropdownOpen] = useState(false);
  
  // Sets selection
  const [selectedSet, setSelectedSet] = useState(null);

  // Generated workout
  const [workout, setWorkout] = useState([]);

  const exerciseByName = useMemo(() => {
    const m = new Map();
    exercises.forEach(e => m.set(e.name, e));
    return m;
  }, []);

  // Switch to split 
  const switchToSplit = () => {
    setActiveMethod("split");
    setMuscleDropdownOpen(false);
    setSelectedDay(null);
    setTags(prev => prev.map(t => ({ ...t, selected: false, selectedRank: null })));
  };

  // Switch to muscle
  const switchToMuscle = () => {
    setActiveMethod("muscle");
    setSplitDropdownOpen(false);
    setSelectedSplit(null);
    setSelectedDay(null);
  };

  // Split select
  const selectSplit = (split) => {
    setSelectedSplit(split);
    setSelectedDay(null);
  };

  // Muscle select
  const selectMuscle = (idx) => {
    setTags(prev => {
      const next = prev.map(t => ({ ...t }));
      const tag = next[idx];

      if (!tag.selected) {
        const maxRank = next.reduce(
          (m, t) => (t.selected && t.selectedRank > m ? t.selectedRank : m), 0
        );
        tag.selected = true;
        tag.selectedRank = maxRank + 1;
      } else {
        const removed = tag.selectedRank;
        tag.selected = false;
        tag.selectedRank = null;
        next.forEach(t => {
          if (t.selected && t.selectedRank > removed) t.selectedRank -= 1;
        });
      }
      return next;
    });
  };

  const pickSet = (opt) => {
    setSelectedSet(prev => (prev === opt ? null : opt));
  };

  // Choose Muscles
  const getTargetMuscles = () => {
    if (activeMethod === "muscle") {
      return tags
        .filter(t => t.selected)
        .sort((a,b) => a.selectedRank - b.selectedRank)
        .map(t => t.name.toLowerCase());
    }

    if (!selectedSplit) return [];
    if (selectedSplit === "Full Body") {
      return SPLIT_DAY_MUSCLES["Full Body"]["Full Body"];
    }
    if (!selectedDay) return [];

    return SPLIT_DAY_MUSCLES[selectedSplit]?.[selectedDay] ?? [];
  };

  // Generate button checking
  const canGenerate = (() => {
    const muscles = getTargetMuscles();
    const sets = parseInt(selectedSet, 10);
    return muscles.length > 0 && sets >= 1;
  })();

  // Build the workout
  const generateWorkout = () => {
    const muscles = getTargetMuscles();
    const setsPerMuscle = parseInt(selectedSet, 10) || 1;

    const result = [];
    for (const muscle of muscles) {
      const preferred = priority[muscle] || [];
      const picks = preferred.slice(0, setsPerMuscle);
      for (const name of picks) {
        const meta = exerciseByName.get(name);
        result.push({
          name,
          muscle,
          type: meta?.type || []
        });
      }
    }
    setWorkout(result);
  };

  return (
    <main id="tag-picker">
      <section className="picker-box">
        
        <div style={{ marginBottom: '24px' }}>
          <button
            className={`dropdown-btn ${activeMethod === 'split' ? 'active' : ''}`}
            onClick={() => {
              switchToSplit();
              setSplitDropdownOpen(!splitDropdownOpen);
            }}
          >
            Choose Split {splitDropdownOpen && activeMethod === 'split' ? "▲" : "▼"}
          </button>
          
          {splitDropdownOpen && activeMethod === 'split' && (
            <div id="tag-bar" style={{ marginBottom: '16px' }}>
              {SPLITS.map(split => (
                <button
                  key={split}
                  className={`tag-btn ${selectedSplit === split ? 'selected' : ''}`}
                  onClick={() => selectSplit(split)}
                >
                  {split}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedSplit && selectedSplit !== "Full Body" && (
          <div style={{ marginTop: '12px', marginBottom: '8px' }}>
            <h3 style={{ color: '#FAF9F6', marginBottom: '8px' }}>
              Choose day for {selectedSplit}:
            </h3>
            <div id="tag-bar" style={{ marginBottom: '16px' }}>
              {SPLIT_DAYS[selectedSplit].map(day => (
                <button
                  key={day}
                  className={`tag-btn ${selectedDay === day ? 'selected' : ''}`}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <button
            className={`dropdown-btn ${activeMethod === 'muscle' ? 'active' : ''}`}
            onClick={() => {
              switchToMuscle();
              setMuscleDropdownOpen(!muscleDropdownOpen);
            }}
          >
            Choose Muscle Group {muscleDropdownOpen && activeMethod === 'muscle' ? "▲" : "▼"}
          </button>
          
          {muscleDropdownOpen && activeMethod === 'muscle' && (
            <div id="tag-bar" style={{ marginBottom: '12px' }}>
              {tags.map((t, i) => {
                const order = t.selected ? t.selectedRank : 1000 + t.originalIndex;
                return (
                  <button
                    key={t.name}
                    className={`tag-btn ${t.selected ? 'selected' : ''}`}
                    style={{ order }}
                    onClick={() => selectMuscle(i)}
                    aria-pressed={t.selected}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="or-divider" aria-hidden="true" />

        <div>
          <h2 className="section-title">Choose sets per group:</h2>
          <div id="tag-bar" style={{ marginBottom: '12px' }}>
            {SET_OPTIONS.map(opt => (
              <button
                key={opt}
                className={`tag-btn ${selectedSet === opt ? 'selected' : ''}`}
                onClick={() => pickSet(opt)}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            className="tag-btn generate-btn"
            onClick={generateWorkout}
            disabled={!canGenerate}
            aria-disabled={!canGenerate}
          >
            GENERATE WORKOUT
          </button>
        </div>

        {workout.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#FAF9F6', marginBottom: '10px' }}>
              Your workout ({workout.length} exercises)
            </h3>
            <div className="workout-grid">
              {workout.map((w, idx) => (
                <div className="workout-card" key={w.name + idx}>
                  <div className="workout-name">{w.name}</div>

                  <div className="workout-meta">
                    <span className="pill">{w.muscle}</span>
                  </div>

                  {w.type && w.type.length > 0 && (
                    <div className="types">{w.type.join(", ")}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </section>
    </main>
  );
}
