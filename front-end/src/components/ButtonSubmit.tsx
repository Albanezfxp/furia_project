import iconFuria from "../assets/Furia_Esports_logo.png";
import "../styles/ButtonSubmit.css"

export default function ButtonSubmit(props: any) {
    return <>
              <button type="submit" className={`${props.class}-button`}>
                  <img src={iconFuria} alt="Icon" />
                  {props.content}
                </button>
    </>
}