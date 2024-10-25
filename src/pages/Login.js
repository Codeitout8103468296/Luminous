import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem('email', email);
        navigate('/home');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00BFB3] to-[#008B8B] px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-6 sm:p-8 lg:p-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12">
          {/* Logo & Header */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#00BFB3] mb-2">SolarisTech</h1>
            <p className="text-[#96C93D] text-md sm:text-lg">Powering a sustainable future</p>
          </div>

          {/* Login Form */}
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
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#96C93D] focus:ring-[#96C93D] border-[#00BFB3]/20 rounded"
                />
                <label className="ml-2 text-[#00BFB3]">Remember me</label>
              </div>
              <a href="#" className="text-[#00BFB3] hover:text-[#96C93D] transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-[#00BFB3] text-white py-2 sm:py-3 rounded-xl font-medium hover:bg-[#96C93D] transition-colors"
            >
              Sign In
            </button>

            <div className="relative my-5 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#00BFB3]/20"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-[#00BFB3]">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-white text-[#00BFB3] py-2 sm:py-3 rounded-xl font-medium border-2 border-[#00BFB3]/20 hover:bg-[#00BFB3]/5 transition-colors"
            >
              Sign in with Google
            </button>
          </form>

          <p className="mt-6 sm:mt-8 text-center text-[#00BFB3] text-xs sm:text-sm">
            Don't have an account?{' '}
            <a href="#" className="text-[#96C93D] font-medium hover:text-[#00BFB3] transition-colors">
              Sign up now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
