import React, { useState } from 'react';
import { AuthFormProps } from '../types';

export const SignIn: React.FC<AuthFormProps> = ({ onSwitchView, onLogin }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin) {
        onLogin();
    }
  };

  return (
    <div className="max-w-md mx-auto w-full animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Sign In to ZAP</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg leading-relaxed">
        Welcome back! Please enter your details to access your dashboard.
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="merchant" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Merchant Name
          </label>
          <input
            id="merchant"
            type="text"
            placeholder="My Awesome Restaurant"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Your email
          </label>
          <input
            id="email"
            type="email"
            placeholder="manager@restaurant.com"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="space-y-2 relative">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <a href="#" className="text-sm font-medium text-primary hover:text-indigo-600 dark:hover:text-indigo-400">
              Forgot?
            </a>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              defaultValue="••••••••••••"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn w-full"
        >
          Sign In
        </button>
      </form>

      <div className="text-center text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center gap-2 mt-10">
        Don’t have an account?
        <button
          onClick={() => onSwitchView('signup')}
          className="inline-block px-5 py-2 rounded-full border border-purple-500 dark:border-purple-400 text-purple-600 dark:text-purple-300 font-bold bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors"
        >
          Sign up
        </button>
      </div>
    </div>
  );
};