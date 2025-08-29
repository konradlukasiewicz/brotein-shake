import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home";
import CustomWorkout from "./components/CustomWorkout.jsx";
import Splits from "./components/Splits.jsx";
import Diet from "./components/Diet.jsx";
import WorkoutLog from "./components/WorkoutLog";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/workouts" element={<CustomWorkout />} />
        <Route path="/custom-workout" element={<CustomWorkout />} />
        <Route path="/splits" element={<Splits />} />
        <Route path="/diet" element={<Diet />} />
        <Route path="/log" element={<WorkoutLog />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
