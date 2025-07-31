import React from 'react';
import { Calendar, ShieldCheck, Users, Briefcase, Star, Workflow } from 'lucide-react';
import Lottie from 'lottie-react';
import animationData from '../assets/animation.json';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5 flex items-center">
              <Calendar className="h-8 w-auto text-purple-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">KAISRI</span>
            </a>
          </div>
          <div className="flex lg:flex-1 lg:justify-end">
            <button
              onClick={onLoginClick}
              className="text-sm font-semibold leading-6 text-purple-700 hover:text-purple-900 transition"
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero section */}
        <div className="relative isolate overflow-hidden bg-gradient-to-b from-purple-50/30 pt-14">
          <div className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white shadow-xl shadow-purple-600/10 ring-1 ring-purple-50"></div>
          <div className="mx-auto max-w-7xl px-6 py-32 sm:py-40 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-16">
              <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl animate-fade-in-up">
                Your Event. Our Technology. Seamlessly Managed.
              </h1>
              <div className="mt-6 max-w-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <p className="text-lg leading-8 text-gray-700">
                  KAISRI combines cutting-edge technology with personalized coordination. 
                  Book your event in minutes while we handle vendor management and flawless execution.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <button
                    onClick={onLoginClick}
                    className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 hover:scale-105 transition-all"
                  >
                    Get Started
                  </button>
                </div>
              </div>
              <div className="mt-10 w-full max-w-lg sm:mt-16 lg:mt-0 lg:max-w-none">
                <Lottie animationData={animationData} loop={true} />
              </div>
            </div>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="mx-auto mt-24 max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="text-base font-semibold leading-7 text-purple-600">How KAISRI Works</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple 3-Step Process
          </p>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            From booking to celebration, we make event management effortless with a clear workflow.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="p-6 rounded-2xl bg-purple-50 shadow hover:shadow-lg transition">
              <Users className="mx-auto h-10 w-10 text-purple-600" />
              <h3 className="mt-4 text-lg font-semibold">Client Books</h3>
              <p className="mt-2 text-gray-600">Clients select packages, customize, and make secure payments through KAISRI.</p>
            </div>
            <div className="p-6 rounded-2xl bg-purple-50 shadow hover:shadow-lg transition">
              <ShieldCheck className="mx-auto h-10 w-10 text-purple-600" />
              <h3 className="mt-4 text-lg font-semibold">Admin Manages</h3>
              <p className="mt-2 text-gray-600">KAISRI Admin confirms bookings, coordinates vendors, and tracks progress.</p>
            </div>
            <div className="p-6 rounded-2xl bg-purple-50 shadow hover:shadow-lg transition">
              <Briefcase className="mx-auto h-10 w-10 text-purple-600" />
              <h3 className="mt-4 text-lg font-semibold">Vendors Execute</h3>
              <p className="mt-2 text-gray-600">Vendors deliver quality services under KAISRI’s supervision for a flawless event.</p>
            </div>
          </div>
        </div>

        {/* Feature section */}
        <div className="mx-auto mt-32 max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-purple-600">Everything You Need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Technology + Service = Hassle-Free Events
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              KAISRI is not just a booking app—it’s your event partner, combining tech efficiency with real-world coordination.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
            <div className="card-modern hover-scale">
              <Users className="h-5 w-5 text-purple-600" />
              <h3 className="mt-4 font-semibold">For Clients</h3>
              <p className="text-gray-600 mt-2">Book your event with ease while KAISRI handles all backend coordination.</p>
            </div>
            <div className="card-modern hover-scale">
              <Briefcase className="h-5 w-5 text-purple-600" />
              <h3 className="mt-4 font-semibold">For Vendors</h3>
              <p className="text-gray-600 mt-2">Get tasks directly from KAISRI, focus on delivery, and receive secure payments.</p>
            </div>
            <div className="card-modern hover-scale">
              <ShieldCheck className="h-5 w-5 text-purple-600" />
              <h3 className="mt-4 font-semibold">For Admins</h3>
              <p className="text-gray-600 mt-2">Oversee every event, confirm bookings, and ensure perfect execution.</p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mx-auto mt-32 max-w-7xl sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-gray-900 px-6 py-20 shadow-xl sm:rounded-3xl">
            <div className="absolute inset-0 bg-gray-900/80"></div>
            <div className="relative max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" />
                ))}
              </div>
              <blockquote className="text-white text-lg font-semibold">
                “KAISRI handled everything—from vendor selection to final execution. 
                 All we did was book and relax. Truly hassle-free!”
              </blockquote>
              <figcaption className="mt-4 text-white">
                <strong>Rahul Mehta</strong> – Corporate Client
              </figcaption>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto mt-32 max-w-7xl px-6 pb-10 text-center">
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} KAISRI Technologies. All rights reserved.  
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
