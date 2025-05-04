import { Link } from "react-router-dom";
import botIcon from "../assets/Furia_Esports_logo.png";
import "../styles/HomeButton.css"

export default function HomeButton() {
    return <>
       <div id="home-button-container">
        <p className="home-text">Clique para iniciar o Bot Furioso</p>
        <Link to="/login" className="home-button">
          <img src={botIcon} alt="Bot Icon" id="bot-icon" />
        </Link>
      </div>
    </>
}