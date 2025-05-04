import { useNavigate } from "react-router-dom";
import logoFuria from "../assets/original-519eba43b5e06c4036ad54fe2b6e496f.jpg";
import "../styles/HeaderForm.css"

export default function HeaderForm(props:any) {
    const navigate = useNavigate()
    const redirect = () => {
        navigate("/")
    }
    
    return <>
          <img src={logoFuria} alt="Furia Logo" className={`${props.class}-logo`} onClick={redirect} />
          <h1 className="login-title">{props.content}</h1>
    </>
}