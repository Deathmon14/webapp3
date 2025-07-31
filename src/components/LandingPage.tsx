import React from 'react';
import { Calendar, ShieldCheck, Users, Briefcase, Star } from 'lucide-react';
import Lottie from 'lottie-react';
import animationData from '../assets/animation.json'; // You'll need to add a Lottie JSON file to your assets

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
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero section */}
        <div className="relative isolate overflow-hidden bg-gradient-to-b from-purple-100/20 pt-14">
          <div className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white shadow-xl shadow-purple-600/10 ring-1 ring-purple-50 sm:mr-20 lg:mr-0 xl:mr-16 xl:origin-center"></div>
          <div className="mx-auto max-w-7xl px-6 py-32 sm:py-40 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8">
              <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:col-span-2 xl:col-auto animate-fade-in-up">
                Book it. Forget it. Flaunt it.
              </h1>
              <div className="mt-6 max-w-xl lg:mt-0 xl:col-end-1 xl:row-start-1 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <p className="text-lg leading-8 text-gray-600">
                  KAISRI is your all-in-one event management platform, designed to streamline planning, coordination, and execution. Whether you are a client, a vendor, or an admin, we have the tools to make your event a success.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <button
                    onClick={onLoginClick}
                    className="btn-3d"
                  >
                    Get started
                  </button>
                </div>
              </div>
              <div className="mt-10 w-full max-w-lg sm:mt-16 lg:mt-0 lg:max-w-none xl:row-span-2 xl:row-end-2 xl:mt-36">
                <Lottie animationData={animationData} loop={true} />
              </div>
            </div>
          </div>
        </div>

        {/* Feature section */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-purple-600">Everything you need</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              A platform for every role
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              KAISRI provides tailored dashboards for clients, vendors, and administrators to ensure a seamless event management experience for everyone involved.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col card-modern hover-scale">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Users className="h-5 w-5 flex-none text-purple-600" aria-hidden="true" />
                  For Clients
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Browse and book event packages, customize your event with a variety of vendors, and manage all your bookings in one place.</p>
                </dd>
              </div>
              <div className="flex flex-col card-modern hover-scale">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Briefcase className="h-5 w-5 flex-none text-purple-600" aria-hidden="true" />
                  For Vendors
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Manage your assigned tasks, track your progress, and communicate with clients and administrators to deliver top-quality services.</p>
                </dd>
              </div>
              <div className="flex flex-col card-modern hover-scale">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <ShieldCheck className="h-5 w-5 flex-none text-purple-600" aria-hidden="true" />
                  For Admins
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Oversee all bookings, manage users and vendors, and ensure the smooth operation of all events on the platform.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Testimonial section */}
        <div className="mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-gray-900 px-6 py-20 shadow-xl sm:rounded-3xl sm:px-10 sm:py-24 md:px-12 lg:px-20 hover-scale">
            <img
              className="absolute inset-0 h-full w-full object-cover brightness-150 saturate-0"
              src="https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg"
              alt=""
            />
            <div className="absolute inset-0 bg-gray-900/90 mix-blend-multiply"></div>
            <div className="relative mx-auto max-w-2xl lg:mx-0">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" />
                ))}
              </div>
              <figure>
                <blockquote className="mt-6 text-lg font-semibold text-white sm:text-xl sm:leading-8">
                  <p>
                    “KAISRI made planning our wedding a breeze. We were able to find the perfect vendors and customize everything to our liking. The platform is intuitive and easy to use, and the support team is fantastic.”
                  </p>
                </blockquote>
                <figcaption className="mt-6 text-base text-white">
                  <div className="font-semibold">Aisha Khan</div>
                  <div className="mt-1">Client</div>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto mt-32 max-w-7xl overflow-hidden px-6 pb-20 sm:mt-56 sm:pb-24 lg:px-8">
        <p className="mt-10 text-center text-xs leading-5 text-gray-500">
          &copy; {new Date().getFullYear()} KAISRI, Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;