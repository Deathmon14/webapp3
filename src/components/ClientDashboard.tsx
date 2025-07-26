// src/components/ClientDashboard.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, doc, getDoc, setDoc, query, where, orderBy, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Package, Star, ArrowRight, Check, Image, Users, Heart, Search, Eye, X, Calendar, Briefcase, XCircle, MessageSquare, DollarSign } from 'lucide-react';
import { User, EventPackage, CustomizationOption, BookingRequest, Review } from '../types';
import ChatModal from './ChatModal';

interface ClientDashboardProps {
  user: User;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [eventPackages, setEventPackages] = useState<EventPackage[]>([]);
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<BookingRequest | null>(null);
  const [view, setView] = useState<'all' | 'saved' | 'bookings'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedBookingForChat, setSelectedBookingForChat] = useState<BookingRequest | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<EventPackage | null>(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState<CustomizationOption[]>([]);
  const [guestCount, setGuestCount] = useState(50);
  const [eventDate, setEventDate] = useState('');
  const [requirements, setRequirements] = useState('');
  const [currentStep, setCurrentStep] = useState<'packages' | 'customize' | 'book'>('packages');

  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const packagesSnapshot = await getDocs(collection(db, 'packages'));
        setEventPackages(packagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as EventPackage));

        const optionsSnapshot = await getDocs(collection(db, 'customizationOptions'));
        setCustomizationOptions(optionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as CustomizationOption));

        const wishlistDoc = await getDoc(doc(db, 'wishlists', user.uid));
        if (wishlistDoc.exists()) setWishlist(wishlistDoc.data().packageIds || []);
        
        const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
        setReviews(reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Review));

      } catch (error) {
        console.error("Error fetching static data:", error);
      }
    };

    fetchStaticData();

    const userBookingsQuery = query(collection(db, 'bookings'), where('clientId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribeUserBookings = onSnapshot(userBookingsQuery, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as BookingRequest));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings in real-time:", error);
      setLoading(false);
    });

    // NOTE: This is not scalable for a large number of bookings.
    // In production, a Cloud Function should update a dedicated 'unavailableDates' collection.
    const allBookingsQuery = query(
      collection(db, 'bookings'), 
      where('status', 'in', ['confirmed', 'in-progress'])
    );
    const unsubscribeAllBookings = onSnapshot(allBookingsQuery, (snapshot) => {
      const dates = snapshot.docs.map(doc => doc.data().eventDate as string);
      setUnavailableDates(dates);
    }, (error) => {
      console.error("Error fetching unavailable dates:", error);
    });

    return () => {
      unsubscribeUserBookings(); 
      unsubscribeAllBookings();
    };
  }, [user.uid]);

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!selectedBookingForReview) return;
    try {
      const newReviewData = {
        packageId: selectedBookingForReview.packageId,
        bookingId: selectedBookingForReview.id, // <-- FIX: Pass the booking ID
        clientId: user.uid,
        clientName: user.name,
        rating,
        comment,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'reviews'), newReviewData);
      
      setReviews(prev => [...prev, { 
        ...newReviewData, 
        id: docRef.id, 
        createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } 
      } as Review]);

      alert('Thank you for your review!');
      setIsReviewOpen(false);
      setSelectedBookingForReview(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    }
  };

  const getPackageRating = (packageId: string) => {
    const relevantReviews = reviews.filter(r => r.packageId === packageId);
    if (relevantReviews.length === 0) return { average: 0, count: 0 };
    const total = relevantReviews.reduce((sum, r) => sum + r.rating, 0);
    return {
      average: total / relevantReviews.length,
      count: relevantReviews.length
    };
  };

  const toggleWishlist = async (packageId: string) => {
    const newWishlist = wishlist.includes(packageId)
      ? wishlist.filter(id => id !== packageId)
      : [...wishlist, packageId];
    
    setWishlist(newWishlist);

    try {
      const wishlistDocRef = doc(db, 'wishlists', user.uid);
      await setDoc(wishlistDocRef, { userId: user.uid, packageIds: newWishlist }, { merge: true });
    } catch (error) {
      console.error("Error updating wishlist: ", error);
      setWishlist(wishlist); 
      alert("There was an error updating your wishlist.");
    }
  };

  const filteredPackages = eventPackages
    .filter(pkg => {
      if (view === 'saved' && !wishlist.includes(pkg.id)) return false;
      if (searchTerm && !pkg.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.basePrice - b.basePrice;
        case 'price-desc': return b.basePrice - a.basePrice;
        default: return 0;
      }
    });
  
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
    if (unavailableDates.includes(eventDate)) {
        alert("The selected date is no longer available. Please choose another date.");
        return;
    }

    try {
      const batch = writeBatch(db);

      const newBookingRef = doc(collection(db, 'bookings'));
      batch.set(newBookingRef, {
        clientId: user.uid,
        clientName: user.name,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        customizations: selectedCustomizations.map(({ id, category, name, price }) => ({ id, category, name, price })),
        totalPrice: getTotalPrice(),
        eventDate: eventDate,
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        requirements: requirements,
        guestCount: guestCount,
      });

      const logRef = doc(collection(db, 'activity_logs'));
      batch.set(logRef, {
        message: `${user.name} submitted a new booking request for "${selectedPackage.name}".`,
        timestamp: serverTimestamp(),
        meta: {
          clientId: user.uid,
          bookingId: newBookingRef.id
        }
      });

      await batch.commit();

      alert('Booking request submitted successfully!');
      
      setCurrentStep('packages');
      setView('bookings');
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

  const DatePicker = ({ selectedDate, onDateChange, disabledDates }: { 
    selectedDate: string, 
    onDateChange: (date: string) => void,
    disabledDates: string[]
  }) => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const minDate = today.toISOString().split('T')[0];

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value;
      if (disabledDates.includes(newDate)) {
        alert("This date is already booked. Please choose another date.");
        return;
      }
      onDateChange(newDate);
    };
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Event Date *</label>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={handleDateChange}
          min={minDate}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Note: Dates already booked are not available.</p>
      </div>
    );
  };
  
  if (loading) {
    return <div className="text-center p-12 text-gray-600">Loading...</div>;
  }
  
  const ReviewModal = ({ isOpen, onClose, onSubmit, booking }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onSubmit: (rating: number, comment: string) => void;
    booking: BookingRequest | null;
  }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
      if (!isOpen) {
        setRating(0);
        setComment('');
      }
    }, [isOpen]);

    if (!isOpen || !booking) return null;

    const handleSubmit = () => {
      if (rating === 0) {
        alert('Please select a star rating.');
        return;
      }
      onSubmit(rating, comment);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Review {booking.packageName}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">How was your experience with this package?</p>
            <div className="flex justify-center mb-6">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <Star
                  key={starValue}
                  className={`w-10 h-10 cursor-pointer ${starValue <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  onClick={() => setRating(starValue)}
                />
              ))}
            </div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">Comments (Optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share your thoughts about the package..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="p-6 border-t flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSubmit} className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200">Submit Review</button>
          </div>
        </div>
      </div>
    );
  };

  const BookingStatusTracker = ({ booking }: { booking: BookingRequest }) => {
    const statuses: BookingRequest['status'][] = ['pending', 'awaiting-payment', 'confirmed', 'in-progress', 'completed'];
    const currentStatusIndex = statuses.indexOf(booking.status);
    const isRejected = booking.status === 'rejected';
    const isCompleted = booking.status === 'completed';

    const hasReviewed = reviews.some(
      (review) => review.packageId === booking.packageId && review.clientId === user.uid && review.bookingId === booking.id // Checks for bookingId
    );
    const isAwaitingPayment = booking.status === 'awaiting-payment';


    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border hover:border-purple-200 transition-all flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-xl text-gray-900">{booking.packageName}</h3>
            <p className="text-sm text-gray-500">Booked on: {booking.createdAt && typeof booking.createdAt === 'object' && 'seconds' in booking.createdAt 
              ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString() 
              : 'N/A'}
            </p>
            <p className="text-sm text-gray-500">Event Date: {new Date(booking.eventDate).toLocaleDateString()}</p>
            <p className="text-sm text-gray-500">Guests: {booking.guestCount}</p>
          </div>
          <span className={`font-bold text-lg ${isRejected ? 'text-red-500' : 'text-purple-600'}`}>
            {isRejected ? 'Rejected' : `$${booking.totalPrice.toLocaleString()}`}
          </span>
        </div>

        <div className="flex-grow">
          {isRejected ? (
            <div className="flex items-center p-4 bg-red-50 rounded-lg">
              <XCircle className="w-8 h-8 text-red-500 mr-4" />
              <div>
                <h4 className="font-semibold text-red-800">Booking Rejected</h4>
                <p className="text-sm text-red-700">Unfortunately, we are unable to proceed with this booking. Please contact support for more details.</p>
              </div>
            </div>
          ) : (
            <>
              {booking.customizations && booking.customizations.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">Customizations:</h4>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                    {booking.customizations.map((custom, idx) => (
                      <li key={idx}>{custom.name} - ${custom.category === 'catering' && booking.guestCount
                        ? (custom.price * booking.guestCount).toLocaleString()
                        : custom.price.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {booking.requirements && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">Special Requirements:</h4>
                  <p className="text-sm text-gray-600 italic">"{booking.requirements}"</p>
                </div>
              )}

              <div className="relative pt-4">
                <div className="absolute left-4 top-6 h-[calc(100%-2rem)] w-0.5 bg-gray-200"></div>
                
                {statuses.map((status, index) => (
                  <div key={status} className="flex items-start mb-6 relative">
                    <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStatusIndex ? 'bg-purple-600' : 'bg-gray-300'}`}>
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h4 className={`font-semibold ${index <= currentStatusIndex ? 'text-gray-900' : 'text-gray-500'}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {booking.status === status ? "Current Status" : index < currentStatusIndex ? "Completed" : "Pending"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t flex flex-col gap-2">
           {isAwaitingPayment && (
            <button
              onClick={() => alert("Redirecting to Razorpay...")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              Proceed to Payment
            </button>
          )}

          <button 
            onClick={() => {
              setSelectedBookingForChat(booking);
              setIsChatOpen(true);
            }}
            disabled={isRejected}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <MessageSquare className="w-4 h-4" />
            {isRejected ? 'Booking Rejected' : 'Contact Admin'}
          </button>

          {isCompleted && !isRejected && !hasReviewed && (
            <button
              onClick={() => {
                setSelectedBookingForReview(booking);
                setIsReviewOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Star className="w-4 h-4" />
              Leave a Review
            </button>
          )}
          {isCompleted && !isRejected && hasReviewed && (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Review Submitted
            </button>
          )}
        </div>
      </div>
    );
  };
  
  if (currentStep === 'packages') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isChatOpen && selectedBookingForChat && (
          <ChatModal 
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            booking={selectedBookingForChat}
            currentUser={user}
          />
        )}

        <ReviewModal 
          isOpen={isReviewOpen} 
          onClose={() => setIsReviewOpen(false)} 
          onSubmit={handleReviewSubmit} 
          booking={selectedBookingForReview} 
        />
        
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome back, {user.name}!</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our curated event packages or customize your own perfect celebration
          </p>
        </div>
        
        <div className="mb-8 p-4 bg-white/50 rounded-2xl shadow-md border">
          <div className="grid md:grid-cols-3 gap-4 items-center">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search for packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'default' | 'price-asc' | 'price-desc')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-gray-200 rounded-full p-1 flex">
            <button onClick={() => setView('all')} className={`px-6 py-2 rounded-full text-sm font-medium ${view === 'all' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'}`}>
              All Packages
            </button>
            <button onClick={() => setView('saved')} className={`px-6 py-2 rounded-full text-sm font-medium ${view === 'saved' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'}`}>
              Saved ({wishlist.length})
            </button>
            <button onClick={() => setView('bookings')} className={`px-6 py-2 rounded-full text-sm font-medium ${view === 'bookings' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'}`}>
              My Bookings ({bookings.length})
            </button>
          </div>
        </div>

        {view === 'all' || view === 'saved' ? (
          filteredPackages.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {filteredPackages.map((pkg) => {
                const isWishlisted = wishlist.includes(pkg.id);
                const rating = getPackageRating(pkg.id);
                return (
                  <div key={pkg.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border hover:border-purple-200">
                    <div className="relative h-64">
                      <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                      <button onClick={(e) => { e.stopPropagation(); toggleWishlist(pkg.id); }} className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                        <Heart className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                      </button>
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
                      
                      <div className="flex items-center mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-5 h-5 ${i < Math.round(rating.average) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">({rating.count} reviews)</span>
                      </div>

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
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-800">No Packages Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or save some packages!</p>
            </div>
          )
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {bookings.length > 0 ? (
              bookings.map(booking => <BookingStatusTracker key={booking.id} booking={booking} />)
            ) : (
              <div className="md:col-span-2 text-center py-16">
                <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">No Bookings Yet</h3>
                <p className="text-gray-500 mt-2">Your booked events will appear here. Start planning your next celebration!</p>
                <button onClick={() => setView('all')} className="mt-6 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors">
                  Browse Packages
                </button>
              </div>
            )}
          </div>
        )}

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
        {isPreviewOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 sticky top-0 bg-white border-b z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Your Custom Event</h3>
                  <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-gray-600">A preview of your selected options for the "{selectedPackage?.name}" package.</p>
              </div>
              <div className="p-6 space-y-6">
                {Object.entries(categoriesConfig).map(([key, config]) => {
                  const selected = selectedCustomizations.find(opt => opt.category === key);
                  if (!selected) return null;
                  return (
                    <div key={key}>
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">{config.icon}</div>
                        <h4 className="text-xl font-bold text-gray-800">{config.name}</h4>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
                        <img src={selected.image} alt={selected.name} className="w-full md:w-48 h-32 object-cover rounded-lg"/>
                        <div>
                          <h5 className="font-semibold text-gray-900">{selected.name}</h5>
                          <p className="text-sm text-gray-600">{selected.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {selectedCustomizations.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <p>No customizations selected yet. Start customizing your package!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
            <DatePicker selectedDate={eventDate} onDateChange={setEventDate} disabledDates={unavailableDates} />
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
            <button 
              onClick={() => setIsPreviewOpen(true)} 
              disabled={selectedCustomizations.length === 0} 
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Selections
            </button>
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
            <DatePicker selectedDate={eventDate} onDateChange={setEventDate} disabledDates={unavailableDates} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
              <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Any dietary needs, accessibility, etc..." className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none" />
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
            <button onClick={handleBooking} disabled={!eventDate || unavailableDates.includes(eventDate)} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              Submit Booking Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;