import { Link } from "react-router-dom";
import "../../assets/css/home.css";
import "../../assets/css/button.css";
import "../../assets/css/text.css";

export default function HomeDesktop() {
  return (
    <main>
      <div className="welcome">
        <p className="intro-text">WELCOME TO</p>
        <h1 className="main-title">BROTEIN SHAKE</h1>
      </div>

      <section className="hero-choices">
        <div className="choice">
          <h2>Want a personalized workout built just for you?</h2>
          <Link className="cta-btn" to="/custom-workout">CLICK HERE</Link>
        </div>

        <div className="choice">
          <h2>Not sure what you want?</h2>
          <Link className="cta-btn" to="/splits">FIND OUT</Link>
        </div>
      </section>

      <Link to="/log"><button className="button">Workout Log</button></Link>

      <p>Need more information? Click on the buttons below to find out more!</p>

      <div className="button-row">
        <Link to="/workouts"><button className="button">Workouts</button></Link>
        <Link to="/splits"><button className="button">Splits</button></Link>
        <Link to="/diet"><button className="button">Diet</button></Link>
        <a href="mailto:konradlukasiewicz2027@u.northwestern.edu">
          <button className="button">Contact Me</button>
        </a>
      </div>

      <p>
        Want to work out but don't want to pay? Teens can go to Planet Fitness for
        FREE all summer!
      </p>
      <a
        className="purple-button"
        href="https://www.planetfitness.com/summerpass"
        target="_blank"
        rel="noopener noreferrer"
      >
        Claim your free summer pass
      </a>
      <br />
    </main>
  );
}