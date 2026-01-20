import React from 'react';
import { AuthFormProps } from '../types';

export const SignUp: React.FC<AuthFormProps> = ({ onSwitchView }) => {
  return (
    <div className="max-w-md mx-auto w-full animate-fade-in">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Create your account</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg leading-relaxed">
        Set up your merchant profile in minutes and start optimizing your F&amp;B business.
      </p>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
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
          <label htmlFor="fullname" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Full Name
          </label>
          <input
            id="fullname"
            type="text"
            placeholder="John Doe"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="manager@restaurant.com"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
          />
        </div>

        <button
          type="submit"
          className="btn w-full mt-4"
        >
          Get Started
        </button>
      </form>

      <div className="text-center text-slate-500 dark:text-slate-400 text-sm mt-8">
        Already have an account?
        <button
          onClick={() => onSwitchView('signin')}
          className="text-primary hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold transition-colors ml-1"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};