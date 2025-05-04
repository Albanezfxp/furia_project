import logo from "../assets/original-519eba43b5e06c4036ad54fe2b6e496f.jpg";
import "../styles/HomeHeader.css"
export default function HomeHeader() {
    return <>
        <div>
        <img src={logo} alt="Furia Logo" className="home-logo" />
        <h1 className="home-title">BOT FURIOSO</h1>
        <p className="home-subtitle">Interaja com a furia</p>
      </div>
    </>
}