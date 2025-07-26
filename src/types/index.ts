// src/types/index.ts
export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'client' | 'vendor'| 'admin';
  status: 'active' | 'pending'| 'disabled';
}

export interface EventPackage {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  features: string[];
  popular?: boolean;
}

export interface CustomizationOption {
  id: string;
  category: 'venue' | 'catering' | 'decoration' | 'entertainment' | 'photography';
  name: string;
  price: number;
  description: string;
  image: string;
}

export interface BookingRequest {
  id: string;
  clientId: string;
  clientName: string;
  packageId: string;
  packageName: string;
  customizations: CustomizationOption[];
  totalPrice: number;
  eventDate: string;
  status: 'pending' | 'awaiting-payment' | 'confirmed' | 'in-progress' | 'completed'| 'rejected';
  createdAt: any;
  requirements: string;
  guestCount: number;
}

export interface VendorTask {
  id: string;
  bookingId: string;
  vendorId: string;
  vendorName: string;
  category: string;
  title: string;
  description: string;
  status: 'assigned' | 'in-progress' | 'completed';
  deadline: string;
  clientRequirements: string;
  eventDate: string;
}

export interface Wishlist {
  userId: string;
  packageIds: string[];
}

export interface Review {
  id: string;
  packageId: string;
  bookingId: string; // <-- FIX: Added this field
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: any;
  link?: string;
}

export interface ActivityLog {
  id: string;
  message: string;
  timestamp: any;
  meta?: {
    userId?: string;
    bookingId?: string;
    vendorName?: string;
    clientName?: string;
  }
}