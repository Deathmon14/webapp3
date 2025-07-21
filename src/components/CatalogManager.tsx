import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
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
        const packagesCol = collection(db, 'packages');
        const packagesSnapshot = await getDocs(packagesCol);
        const packagesData = packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EventPackage[];
        setEventPackages(packagesData);

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
      await addDoc(collection(db, 'bookings'), {
        clientId: user.uid, clientName: user.name, packageId: selectedPackage.id,
        packageName: selectedPackage.name, customizations: selectedCustomizations,
        totalPrice: getTotalPrice(), eventDate: eventDate, status: 'pending',
        createdAt: serverTimestamp(), requirements: requirements, guestCount: guestCount,
      });
      alert('Booking request submitted successfully!');
      setCurrentStep('packages'); setSelectedPackage(null); setSelectedCustomizations([]); setEventDate(''); setRequirements('');
    } catch (error) {
      console.error("Error creating booking: ", error);
      alert('There was an error submitting your booking.');
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
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Choose from our curated event packages or customize your own perfect celebration</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {eventPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border hover:border-purple-200">
              <div className="relative h-64"><img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />{pkg.popular && (<div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium"><Star className="w-4 h-4 inline mr-1" /> Popular</div>)}<div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg"><span className="text-xl font-bold text-gray-900">${pkg.basePrice.toLocaleString()}</span><span className="text-sm text-gray-600 ml-1">base</span></div></div>
              <div className="p-6"><h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3><p className="text-gray-600 mb-4">{pkg.description}</p><div className="space-y-2 mb-6">{pkg.features.map((feature, index) => (<div key={index} className="flex items-center text-sm text-gray-600"><Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" /><span>{feature}</span></div>))}</div><div className="flex gap-3"><button onClick={() => { setSelectedPackage(pkg); setCurrentStep('customize'); }} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center group"><span>Customize</span><ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></button><button onClick={() => { setSelectedPackage(pkg); setCurrentStep('book'); }} className="px-6 py-3 border border-purple-200 text-purple-700 rounded-xl font-medium hover:bg-purple-50 transition-colors">Book Now</button></div></div>
            </div>
          ))}
        </div>
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white"><h3 className="text-2xl font-bold mb-4">Need Something Custom?</h3><p className="text-purple-100 mb-6 max-w-2xl mx-auto">Our event planning experts can create a completely custom package tailored to your unique vision and requirements.</p><button className="bg-white text-purple-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors">Contact Our Planners</button></div>
      </div>
    );
  }

  // The rest of the JSX for 'customize' and 'book' steps is unchanged.
  // ...
  return <div>...</div>; 
};

export default ClientDashboard;