// src/components/ChatModal.tsx
import React from 'react';
import { X } from 'lucide-react';
import { User, BookingRequest } from '../types';
import ChatComponent from './ChatComponent';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRequest;
  currentUser: User;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, booking, currentUser }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-transparent rounded-2xl w-full max-w-lg h-[70vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-20 p-2 bg-white hover:bg-gray-200 rounded-full shadow-lg"
          aria-label="Close chat"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>
        <ChatComponent booking={booking} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default ChatModal;