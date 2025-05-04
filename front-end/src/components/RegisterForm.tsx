import Input from "./Input";
import ButtonSubmit from "./ButtonSubmit";
import "../styles/RegisterForm.css";
import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<String | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(), // Aplica trim imediatamente
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.email || !formData.password) {
        setSuccess(false)
        setError("Por favor, preencha todos os campos obrigatórios");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setSuccess(false);
        setError("As senhas não coincidem");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setSuccess(false);
        setError("Por favor, insira um email válido");
        return;
      }

      const payload = {
        name: String(formData.name).trim(),
        email: String(formData.email).trim(),
        password: String(formData.password).trim(),
      };

      if (
        payload.name.length === 0 ||
        payload.email.length === 0 ||
        payload.password.length === 0
      ) {
        setSuccess(false);
        setError("Os campos não podem estar vazios");
        return;
      }
      if (
        payload.name.length > 255 ||
        payload.email.length > 255 ||
        payload.password.length > 255
      ) {
        setError("Os campos não podem ter mais de 255 caracteres");
        return;
      }

      const response = await api.post("/user", payload);
      setSuccess(true);
      setError(null)
      setFormData({
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
      });
      setTimeout(() => navigate("/login"), 2000);

    } catch (err: any) {
      setSuccess(false);
      console.error("Registration error:", err.response?.data);
      if (err.response?.data?.message) {
        if (Array.isArray(err.response.data.message)) {
          setError(err.response.data.message.join(", "));
        } else if (typeof err.response.data.message === "string") {
          setError(err.response.data.message);
        } else {
          setError("Erro ao registrar usuário");
        }
      } else {
        setSuccess(false);
        setError("Falha no registro. Por favor, tente novamente.");
      }
    }
  };

  return (
    <>
      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          Registration successful! Redirecting to login...
        </div>
      )}
      <form onSubmit={handleSubmit} id="form-register-container">
        <div className="form-group">
          <Input
            type="text"
            placeholder="Nome"
            value={formData.name}
            onChange={handleChange}
            name="name"
          />
        </div>
        <div className="form-group">
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            name="email"
          />
        </div>
        <div className="form-group">
          <Input
            type="password"
            placeholder="Senha"
            value={formData.password}
            onChange={handleChange}
            name="password"
          />
        </div>
        <div className="form-group">
          <Input
            type="password"
            placeholder="Confirme a senha"
            value={formData.confirmPassword}
            onChange={handleChange}
            name="confirmPassword"
          />
        </div>
        <ButtonSubmit class="register" content="Registrar" />
      </form>
    </>
  );
}