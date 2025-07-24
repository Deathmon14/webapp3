// src/components/ActivityLog.tsx

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ActivityLog as ActivityLogType } from '../types'; // Renamed to avoid conflict
import { History } from 'lucide-react';

const ActivityLog = () => {
  const [logs, setLogs] = useState<ActivityLogType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const logsQuery = query(
      collection(db, 'activity_logs'),
      orderBy('timestamp', 'desc'),
      limit(15)
    );

    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ActivityLogType));
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching activity logs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const timeSince = (date: any) => {
    if (!date?.seconds) return 'just now';
    const seconds = Math.floor((new Date().getTime() - date.seconds * 1000) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
        <History className="w-6 h-6 mr-3 text-purple-600" />
        Recent Activity
      </h3>
      {loading ? (
        <p className="text-gray-500">Loading activity...</p>
      ) : (
        <ul className="space-y-4">
          {logs.map(log => (
            <li key={log.id} className="flex items-start">
              <div className="flex-shrink-0 w-3 h-3 bg-purple-200 rounded-full mt-1.5 mr-3"></div>
              <div>
                <p className="text-sm text-gray-800">{log.message}</p>
                <p className="text-xs text-gray-500">{timeSince(log.timestamp)}</p>
              </div>
            </li>
          ))}
          {logs.length === 0 && <p className="text-sm text-gray-500">No recent activity.</p>}
        </ul>
      )}
    </div>
  );
};

export default ActivityLog;