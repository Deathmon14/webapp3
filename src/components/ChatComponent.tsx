// src/components/ChatComponent.tsx

import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, BookingRequest } from '../types';
import { ArrowUp } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
}

interface ChatComponentProps {
  booking: BookingRequest;
  currentUser: User;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ booking, currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (!booking?.id) return;

    const messagesQuery = query(
      collection(db, 'chats', booking.id, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [booking.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !booking?.id) return;

    await addDoc(collection(db, 'chats', booking.id, 'messages'), {
      text: newMessage,
      senderId: currentUser.uid,
      senderName: currentUser.name,
      timestamp: serverTimestamp()
    });

    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-bold text-gray-900">Chat for "{booking.packageName}"</h3>
        <p className="text-sm text-gray-500">Discuss details with the event admin.</p>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.senderId === currentUser.uid ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                msg.senderId === currentUser.uid
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
            <span className="text-xs text-gray-400 mt-1 px-1">
              {msg.senderName} - {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t bg-gray-50">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;