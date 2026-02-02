import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/api/auth.service';
import { useAuth } from '@/api/auth.context';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const { loginUser } = useAuth();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      loginUser(response.access_token);
      navigate('/');
    } catch (error) {
      alert('Error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-ecommerce-dark mb-6 text-center">Login</h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ecommerce-primary outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-ecommerce-primary outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-ecommerce-primary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all shadow-md"
          >
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
}