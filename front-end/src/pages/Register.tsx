import { Link } from "react-router-dom";
import "../styles/Register.css";
import HeaderForm from "../components/HeaderForm";
import RegisterForm from "../components/RegisterForm";

const Register = () => {
 

  return (
    <div className="register-container">
      <HeaderForm class = "register" content = "Registrar"/>
      <RegisterForm />
      <Link to="/login" className="login-link">
        Já tem acesso?
      </Link>
    </div>
  );
};

export default Register;
