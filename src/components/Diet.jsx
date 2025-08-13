import React from "react";
import "../assets/css/tag.css"; // for .picker-box, .section-title, etc.

export default function Diet() {
  return (
    <main style={{ padding: "0 12px 24px" }}>
      <section className="picker-box" style={{ marginTop: 16 }}>
        <h1 style={{ color: "orange", fontSize: 32, marginBottom: 8 }}>Diet</h1>
        <p style={{ color: "#ddd" }}>
          People usually start going to the gym for two main reasons, either to gain weight (bulking) or lose weight (cutting). Although lifting can help you achieve your goals, neither of these can be done without a proper diet.
        </p>
      </section>

      <section className="picker-box" style={{ marginTop: 16 }}>
        <h2 className="section-title">Bulking</h2>
        <p style={{ color: "#ddd" }}>
          In order to gain weight, you have to be at a consistent calorie surplus and aim to eat at least 1 gram of protein per pound of body weight daily. Hence, you want to be eating food that is high in protein and/or calories. Some common foods which help with bulking include chicken, turkey, beef, eggs, peanut butter, Greek yogurt, bananas, oatmeal, salmon, rice, and beans. It is also helpful to be drinking protein shakes.
        </p>
      </section>

      <section className="picker-box" style={{ marginTop: 16 }}>
        <h2 className="section-title">Cutting</h2>
        <p style={{ color: "#ddd" }}>
          In order to lose weight, you have to be at a consistent calorie deficit, meaning you consume fewer calories than you burn. In addition to adding cardio to your workouts, you should focus on eating foods that are low-calorie and high-volume, while still meeting your nutritional needs. Some foods include vegetables, sweet potatoes, nuts, oats, fruits, and lean meats.
        </p>
      </section>
    </main>
  );
}
