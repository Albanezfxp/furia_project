import { Link, useNavigate } from "react-router-dom";
import Input from "./Input";
import ButtonSubmit from "./ButtonSubmit";
import "../styles/LoginForm.css";
import { useState } from "react";
import api from '../api';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
    const navigate = useNavigate()
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<String | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()    
    try {
      const payload = {
        email: String(formData.email).trim(),
        password: String(formData.password).trim(),
      };
      const response = await api.post(`user/login`, payload );
      console.log('Resposta:', response.data); 
      localStorage.setItem('userId', response.data.id.toString());

      setError(null)
      setSuccess(true);
      setTimeout(() => navigate("/chat"), 2000);

    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("E-mail ou senha inválidos");
        setSuccess(false);

      } else {
        setSuccess(false);

        setError("Erro ao fazer login. Tente novamente.");
      }
    }
  }

  return (
    <>
    {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          Login successful! Redirecting to chat...
        </div>
      )}
      <form className="login-form" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          name="email"
        />
        <Input
          type="password"
          placeholder="Senha"
          value={formData.password}
          onChange={handleChange}
          name="password"
        />
        <ButtonSubmit class="login" content="ENTRAR" />
      </form>
      <Link to="/register" className="register-link">
        Registrar
      </Link>
    </>
  );
}