import React, { useState } from 'react';
import { Calendar, Users, Briefcase, ArrowRight, Eye, EyeOff, Mail, Lock, User as UserIcon } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userObject: User = {
          id: user.uid,
          uid: user.uid,
          name: userData.name,
          email: userData.email,
          role: userData.role
        };
        onLogin(userObject);
      } else {
        setError('User profile not found. Please contact support.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      setLoading(false);
      return;
    }

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Create user document in Firestore
      const userData = {
        uid: user.uid,
        name: formData.name.trim(),
        email: formData.email,
        role: formData.role,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      // Create user object for the app
      const userObject: User = {
        id: user.uid,
        uid: user.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role
      };

      onLogin(userObject);
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleInfo = {
    client: {
      title: 'Client Account',
      description: 'Browse and book event packages',
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-600 to-blue-600'
    },
    vendor: {
      title: 'Vendor Account',
      description: 'Manage event services and tasks',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-teal-600 to-green-600'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              EventEase
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
          <p className="text-gray-500 mt-2">
            {isLogin ? 'Sign in to manage your events' : 'Join our event management platform'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
            {/* Name Field (Signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
              )}
            </div>

            {/* Role Selection (Signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Account Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(roleInfo).map(([role, info]) => (
                    <label
                      key={role}
                      className={`relative cursor-pointer border-2 rounded-xl p-4 transition-all ${
                        formData.role === role
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-200'
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
                        <h4 className="font-medium text-gray-900 text-sm">{info.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{info.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ name: '', email: '', password: '', role: 'client' });
                }}
                className="ml-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Demo Note */}
          {isLogin && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                <strong>Demo:</strong> Create a new account or use existing credentials to test the platform.
              </p>
            </div>
          )}
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">Smart Planning</h4>
            <p className="text-xs text-gray-600">Intuitive event planning</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center mx-auto">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">Team Coordination</h4>
            <p className="text-xs text-gray-600">Seamless collaboration</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto">
              <Briefcase className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">Progress Tracking</h4>
            <p className="text-xs text-gray-600">Real-time updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;