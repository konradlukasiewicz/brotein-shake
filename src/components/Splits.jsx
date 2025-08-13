import React from "react";
import "../assets/css/tag.css";

const SPLIT_DESCRIPTIONS = {
  "Push Pull Legs":
    "Possibly the most common split, Push Pull Legs revolves around splitting your workouts by muscle group. Push day targets chest, triceps, and shoulder muscles. Pull day targets back, biceps, and rear deltoid muscles. Leg day targets all the leg muscles, specifically quadriceps, hamstrings, glutes, and calves. People typically allow at least one rest day in between each three-day set of workouts. As for core, this can be added on to any day or done separately.",
  "Upper Lower":
    "For many people who work long hours or simply do not have time to go to the gym regularly, an Upper Lower split can be done, dedicating one day to the upper body and one to the lower. Upper body day targets chest, back, shoulder, biceps, and triceps muscles. A lower body day targets quadriceps, hamstrings, glutes, calves, and core.",
  "Full Body":
    "The full body split is great for people who have limited time to workout. The concept is to work all your major muscle groups in a single workout. Rest days are necessary in between to conserve energy. Full body workouts tend to prioritize compund workouts.",
  "Arnold Split":
    "Very similar to PPL, the Arnold Split, named after Arnold Schwarzenegger, this split categorizes workouts in three days: chest and back, shoulders & arms, and legs."
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

function MusclePill({ children }) {
  return (
    <span style={{
      background: "#ffd69a",
      color: "#1f1f1f",
      borderRadius: 999,
      padding: "2px 10px",
      fontSize: "0.9rem",
      marginRight: 8,
      marginBottom: 6,
      display: "inline-block"
    }}>
      {children}
    </span>
  );
}

function SplitCard({ title, description, days }) {
  return (
    <section className="picker-box" style={{ marginTop: 16 }}>
      <h2 style={{ color: "#FAF9F6", fontSize: 25, marginBottom: 8 }}>{title}</h2>
      <p style={{ color: "#ddd", marginBottom: 12 }}>{description}</p>

      {days && Object.keys(days).length > 0 ? (
        <div style={{ marginTop: 6 }}>
          {Object.entries(days).map(([dayName, muscles]) => (
            <div key={dayName} style={{ marginBottom: 12 }}>
              <h3 style={{ color: "orange", fontSize: 18, marginBottom: 6 }}>{dayName}</h3>
              <div>
                {muscles.map(m => <MusclePill key={m}>{m}</MusclePill>)}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function Splits() {
  return (
    <main style={{ padding: "0 12px 24px" }}>
      <section className="picker-box" style={{ marginTop: 16 }}>
        <h1 style={{ color: "orange", fontSize: 32, marginBottom: 8 }}>Splits</h1>
        <p style={{ color: "#ddd" }}>
          There are many ways to structure your workout, here are some common ways that people find effective.
        </p>
      </section>

      <SplitCard
        title="Push Pull Legs"
        description={SPLIT_DESCRIPTIONS["Push Pull Legs"]}
        days={SPLIT_DAY_MUSCLES["Push Pull Legs"]}
      />

      <SplitCard
        title="Upper Lower"
        description={SPLIT_DESCRIPTIONS["Upper Lower"]}
        days={SPLIT_DAY_MUSCLES["Upper Lower"]}
      />

      <SplitCard
        title="Full Body"
        description={SPLIT_DESCRIPTIONS["Full Body"]}
        days={{ "Full Body": SPLIT_DAY_MUSCLES["Full Body"]["Full Body"] }}
      />

      <SplitCard
        title="Arnold Split"
        description={SPLIT_DESCRIPTIONS["Arnold Split"]}
        days={SPLIT_DAY_MUSCLES["Arnold"]}
      />
    </main>
  );
}
