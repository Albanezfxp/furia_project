import "../styles/Login.css";
import HeaderForm from "../components/HeaderForm";
import LoginForm from "../components/LoginForm";

const Login = () => {
  return (
    <div className="login-container">
      <HeaderForm class = "login" content = "LOGIN"/>
      <LoginForm/> 
    </div>
  );
};
export default Login;
