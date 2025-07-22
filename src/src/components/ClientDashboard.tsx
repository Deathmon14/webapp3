import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase'; // Assuming your firebase config is in src/lib/firebase.ts
import { Package, Star, ArrowRight, Check, Image, Users } from 'lucide-react';
import { User, EventPackage, CustomizationOption } from '../types';

interface ClientDashboardProps {
  user: User;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  // State for live data from Firestore
  const [eventPackages, setEventPackages] = useState<EventPackage[]>([]);
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOption[]>([]);
  const [loading, setLoading] = useState(true);

  // State for the booking flow
  const [selectedPackage, setSelectedPackage] = useState<EventPackage | null>(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState<CustomizationOption[]>([]);
  const [guestCount, setGuestCount] = useState(50);
  const [eventDate, setEventDate] = useState('');
  const [requirements, setRequirements] = useState('');
  const [currentStep, setCurrentStep] = useState<'packages' | 'customize' | 'book'>('packages');

  // Fetch data from Firestore when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch event packages
        const packagesCol = collection(db, 'packages');
        const packagesSnapshot = await getDocs(packagesCol);
        const packagesData = packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EventPackage[];
        setEventPackages(packagesData);

        // Fetch customization options
        const optionsCol = collection(db, 'customizationOptions');
        const optionsSnapshot = await getDocs(optionsCol);
        const optionsData = optionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CustomizationOption[];
        setCustomizationOptions(optionsData);

      } catch (error) {
        console.error("Error fetching data from Firestore: ", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const getTotalPrice = () => {
    if (!selectedPackage) return 0;
    const customizationTotal = selectedCustomizations.reduce((sum, option) => {
      const price = option.category === 'catering' ? option.price * guestCount : option.price;
      return sum + price;
    }, 0);
    return selectedPackage.basePrice + customizationTotal;
  };

  const toggleCustomization = (option: CustomizationOption) => {
    setSelectedCustomizations(prev => {
      const exists = prev.find(item => item.id === option.id);
      if (exists) {
        return prev.filter(item => item.id !== option.id);
      } else {
        const filtered = prev.filter(item => item.category !== option.category);
        return [...filtered, option];
      }
    });
  };

  const handleBooking = async () => {
    if (!selectedPackage || !eventDate) {
      alert('Please select a package and an event date.');
      return;
    }
    try {
      // Add a new document to the 'bookings' collection in Firestore
      await addDoc(collection(db, 'bookings'), {
        clientId: user.uid,
        clientName: user.name,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        customizations: selectedCustomizations.map(({ id, category, name, price }) => ({ id, category, name, price })), // Storing a cleaner object
        totalPrice: getTotalPrice(),
        eventDate: eventDate,
        status: 'pending',
        createdAt: serverTimestamp(),
        requirements: requirements,
        guestCount: guestCount,
      });

      alert('Booking request submitted successfully! Our team will contact you soon.');
      // Reset state after booking
      setCurrentStep('packages');
      setSelectedPackage(null);
      setSelectedCustomizations([]);
      setEventDate('');
      setRequirements('');
    } catch (error) {
      console.error("Error creating booking: ", error);
      alert('There was an error submitting your booking. Please try again.');
    }
  };

  const categoriesConfig = {
    venue: { name: 'Venue', icon: <Image className="w-5 h-5" /> },
    catering: { name: 'Catering', icon: <Users className="w-5 h-5" /> },
    decoration: { name: 'Decoration', icon: <Star className="w-5 h-5" /> },
    entertainment: { name: 'Entertainment', icon: <Users className="w-5 h-5" /> },
    photography: { name: 'Photography', icon: <Image className="w-5 h-5" /> }
  };

  if (loading) {
    return <div className="text-center p-12">Loading event packages...</div>;
  }

  if (currentStep === 'packages') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome back, {user.name}!</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our curated event packages or customize your own perfect celebration
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {eventPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border hover:border-purple-200">
              <div className="relative h-64">
                <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                {pkg.popular && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4 inline mr-1" /> Popular
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <span className="text-xl font-bold text-gray-900">${pkg.basePrice.toLocaleString()}</span>
                  <span className="text-sm text-gray-600 ml-1">base</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                <p className="text-gray-600 mb-4">{pkg.description}</p>
                <div className="space-y-2 mb-6">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setSelectedPackage(pkg); setCurrentStep('customize'); }} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center group">
                    <span>Customize</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={() => { setSelectedPackage(pkg); setCurrentStep('book'); }} className="px-6 py-3 border border-purple-200 text-purple-700 rounded-xl font-medium hover:bg-purple-50 transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Need Something Custom?</h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Our event planning experts can create a completely custom package tailored to your unique vision and requirements.
          </p>
          <button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors">
            Contact Our Planners
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'customize') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => setCurrentStep('packages')} className="flex items-center text-purple-600 hover:text-purple-700 mb-4">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Packages
            </button>
            <h2 className="text-3xl font-bold text-gray-900">Customize: {selectedPackage?.name}</h2>
            <p className="text-gray-600">Base price: ${selectedPackage?.basePrice.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Current Total</div>
            <div className="text-3xl font-bold text-gray-900">${getTotalPrice().toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Guests</label>
              <input type="number" value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
          </div>
        </div>
        <div className="space-y-8">
          {Object.entries(categoriesConfig).map(([categoryKey, config]) => {
            const options = customizationOptions.filter(opt => opt.category === categoryKey);
            const selected = selectedCustomizations.find(opt => opt.category === categoryKey);
            return (
              <div key={categoryKey} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">{config.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900">{config.name}</h3>
                  {selected && <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Selected</span>}
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {options.map((option) => {
                    const isSelected = selected?.id === option.id;
                    const displayPrice = option.category === 'catering' ? `$${option.price}/person (${guestCount} guests = $${(option.price * guestCount).toLocaleString()})` : `$${option.price.toLocaleString()}`;
                    return (
                      <div key={option.id} onClick={() => toggleCustomization(option)} className={`relative cursor-pointer border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                        {isSelected && <div className="absolute top-3 right-3 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                        <img src={option.image} alt={option.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-1">{option.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                        <p className="font-bold text-purple-600">{displayPrice}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex justify-between items-center bg-white rounded-2xl p-6 shadow-lg">
          <div>
            <div className="text-sm text-gray-600">Total Price</div>
            <div className="text-2xl font-bold text-gray-900">${getTotalPrice().toLocaleString()}</div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setCurrentStep('packages')} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={() => setCurrentStep('book')} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200">Proceed to Booking</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button onClick={() => setCurrentStep('customize')} className="flex items-center text-purple-600 hover:text-purple-700 mb-4">
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Customization
        </button>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Booking</h2>
        <p className="text-gray-600">Review your event details and submit your booking request</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Event Summary</h3>
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedPackage?.name}</h4>
                <p className="text-sm text-gray-600">{selectedPackage?.description}</p>
              </div>
              <span className="font-bold text-gray-900">${selectedPackage?.basePrice.toLocaleString()}</span>
            </div>
          </div>
          {selectedCustomizations.length > 0 && (
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Customizations</h4>
              <div className="space-y-2">
                {selectedCustomizations.map((option) => {
                  const price = option.category === 'catering' ? option.price * guestCount : option.price;
                  return (
                    <div key={option.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{option.name}{option.category === 'catering' && ` (${guestCount} guests)`}</span>
                      <span className="font-medium">${price.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-3">Event Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Guests:</span>
                <span className="font-medium">{guestCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{eventDate || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total Price:</span>
            <span className="text-purple-600">${getTotalPrice().toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Additional Information</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Date *</label>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
              <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Any special dietary requirements, accessibility needs, or specific requests..." className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none" />
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• We'll review your booking request within 24 hours</li>
                <li>• Our team will contact you to confirm details</li>
                <li>• You'll receive a detailed quote and contract</li>
                <li>• Payment options will be provided upon confirmation</li>
              </ul>
            </div>
            <button onClick={handleBooking} disabled={!eventDate} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              Submit Booking Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;