import { useState } from 'react';
import { login } from '../services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError('');

      await login(username, password);

      alert('Login successful!');

      window.location.href = '/dashboard';
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Hospital Management System</h1>

      <h2>Login</h2>

      <form onSubmit={handleSubmit}>

        <div>
          <label>Username</label>
          <br />

          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Password</label>
          <br />

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <br />

        <button type="submit">
          Login
        </button>

        {error && <p>{error}</p>}

      </form>
    </div>
  );
}

export default Login;