import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Signup successful');
        navigate('/login');
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00BFB3] to-[#008B8B] px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-6 sm:p-8 lg:p-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#00BFB3] mb-2">Create Account</h1>
            <p className="text-[#96C93D] text-md sm:text-lg">Join SolarisTech today</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-sm sm:text-md font-medium text-[#00BFB3] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#00BFB3]/20 focus:border-[#00BFB3] focus:ring-2 focus:ring-[#00BFB3]/20 transition-colors bg-white"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm sm:text-md font-medium text-[#00BFB3] mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[#00BFB3]/20 focus:border-[#00BFB3] focus:ring-2 focus:ring-[#00BFB3]/20 transition-colors bg-white"
                placeholder="Create a password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#00BFB3] text-white py-2 sm:py-3 rounded-xl font-medium hover:bg-[#96C93D] transition-colors"
            >
              Sign Up
            </button>
          </form>

          <p className="mt-6 sm:mt-8 text-center text-[#00BFB3] text-xs sm:text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-[#96C93D] font-medium hover:text-[#00BFB3] transition-colors">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
