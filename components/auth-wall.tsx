'use client';

import { signIn } from 'next-auth/react';
import { Button } from './ui/button';
import { useState } from 'react';
import { Input } from './ui/input';

export function AuthWall() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (!result?.ok) {
          setError(result?.error || 'Failed to sign in');
        }
      } else {
        // Register
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Failed to register');
          return;
        }

        // Auto login setelah register
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (!result?.ok) {
          setError(result?.error || 'Failed to sign in');
        }
      }
    } catch (err) {
      void err; // Acknowledged but intentionally not used
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 outline-2 bg-black bg-opacity-80 z-50 flex justify-center items-center">
      <div className="bg-black p-8 rounded-lg shadow-lg text-center flex flex-col justify-center items-center w-96 max-w-[90vw]">
        <div className="flex flex-col items-center justify-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-gray-400">You must be signed in to access this app.</p>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="w-full mb-6">
          {!isLogin && (
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-3 bg-gray-900 border-gray-700 text-white"
              required
              disabled={loading}
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3 bg-gray-900 border-gray-700 text-white"
            required
            disabled={loading}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-3 bg-gray-900 border-gray-700 text-white"
            required
            disabled={loading}
          />

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-white text-black hover:bg-gray-100"
            disabled={loading}
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Register'}
          </Button>
        </form>

        {/* Toggle between login dan register */}
        <div className="w-full mb-6">
          <p className="text-gray-400 text-sm">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="text-white hover:text-gray-200 underline"
              disabled={loading}
            >
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center mb-6">
          <div className="flex-1 border-t border-gray-700"></div>
          <span className="px-3 text-gray-400 text-sm">or</span>
          <div className="flex-1 border-t border-gray-700"></div>
        </div>

        {/* GitHub Sign In */}
        <Button
          className="w-full flex items-center justify-center text-white bg-gray-900 hover:bg-gray-800 border border-gray-700"
          onClick={() => signIn('github')}
          disabled={loading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="mr-2 h-5 w-5"
          >
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.428 2.865 8.186 6.838 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.892 1.528 2.341 1.087 2.91.832.092-.647.35-1.087.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.986 1.03-2.686-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.852.004 1.71.115 2.51.338 1.909-1.295 2.747-1.025 2.747-1.025.546 1.378.203 2.397.1 2.65.64.7 1.028 1.593 1.028 2.686 0 3.848-2.339 4.695-4.568 4.944.36.31.68.923.68 1.861 0 1.343-.012 2.427-.012 2.758 0 .268.18.58.688.482C19.137 20.2 22 16.436 22 12.017 22 6.484 17.523 2 12 2z" />
          </svg>
          Sign In with GitHub
        </Button>
      </div>
    </div>
  );
}
