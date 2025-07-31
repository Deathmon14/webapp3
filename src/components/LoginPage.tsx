// src/components/LoginPage.tsx

import React, { useState } from 'react';
import { Calendar, Users, Briefcase, ArrowRight, Eye, EyeOff, Mail, Lock, User as UserIcon } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';
import toast from 'react-hot-toast';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client' as 'client' | 'vendor'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSignupSuccess(false);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.status === 'pending') {
          setError('Your account is pending approval from an administrator. Please check back later.');
          toast.error('Your account is pending approval.');
          await auth.signOut();
          setLoading(false);
          return;
        }

        const userObject: User = {
          uid: user.uid,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          status: userData.status
        };
        onLogin(userObject);
        toast.success(`Welcome back, ${userData.name}!`);
      } else {
        setError('User profile not found. Please contact support.');
        toast.error('User profile not found.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to log in. Please check your credentials.');
      toast.error(error.message || 'Failed to log in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSignupSuccess(false);

    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      toast.error('Please enter your full name.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const isVendor = formData.role === 'vendor';

      const userData = {
        uid: user.uid,
        name: formData.name.trim(),
        email: formData.email,
        role: formData.role,
        status: isVendor ? 'pending' : 'active',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      if (isVendor) {
        await auth.signOut();
        setSignupSuccess(true);
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '', role: 'client' });
        toast.success('Vendor account created! Pending admin approval.');
      } else {
        const userObject: User = {
          uid: user.uid,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          status: 'active'
        };
        onLogin(userObject);
        toast.success(`Welcome, ${userData.name}! Your client account is ready.`);
      }

    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
      toast.error(error.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const roleInfo = {
    client: {
      title: 'Client Account',
      description: 'Browse and book event packages',
      icon: <Users className="w-6 h-6" />,
      color: 'from-primary-600 to-secondary-600'
    },
    vendor: {
      title: 'Vendor Account',
      description: 'Manage event services and tasks',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-teal-600 to-green-600'
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden">
        {/* Branding Panel */}
        <div className="hidden md:flex flex-col justify-between p-8 bg-gradient-to-br from-primary-600 to-secondary-500 text-white">
          <div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8" />
              <span className="text-2xl font-bold">KAISRI</span>
            </div>
            <h2 className="text-4xl font-bold mt-8">
              Book it. Forget it. <br /> Flaunt it.
            </h2>
            <p className="mt-4 text-primary-100">
              Your seamless event experience starts here.
            </p>
          </div>
          <div className="text-sm text-primary-200">
            &copy; {new Date().getFullYear()} KAISRI, Inc. All rights reserved.
          </div>
        </div>

        {/* Form Panel */}
        <div className="bg-white p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {isLogin ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          <p className="text-neutral-600 mb-6">
            {isLogin ? 'Sign in to continue to your dashboard.' : 'Join us to start planning.'}
          </p>

          {signupSuccess && (
            <div className="bg-success-50 border border-success-200 rounded-xl p-4 mb-6">
              <p className="text-success-800 text-sm font-medium">
                Vendor account created! An administrator will review your request. You can log in once approved.
              </p>
            </div>
          )}
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-base"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-base"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-base pr-12"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-neutral-500 mt-1">Password must be at least 6 characters</p>
              )}
            </div>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Account Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(roleInfo).map(([role, info]) => (
                    <label
                      key={role}
                      className={`relative cursor-pointer border-2 rounded-xl p-4 transition-all ${
                        formData.role === role
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-neutral-200 hover:border-primary-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={formData.role === role}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className={`w-10 h-10 bg-gradient-to-r ${info.color} rounded-lg flex items-center justify-center mx-auto mb-2 text-white`}>
                          {info.icon}
                        </div>
                        <h4 className="font-medium text-neutral-900 text-sm">{info.title}</h4>
                        <p className="text-xs text-neutral-600 mt-1">{info.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ name: '', email: '', password: '', role: 'client' });
                }}
                className="ml-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
