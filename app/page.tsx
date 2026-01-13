'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTodayDateString } from '@/lib/questions';
import {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPushNotifications,
  sendTestNotification,
} from '@/lib/notifications';

type UserId = 'ajay' | 'akansha';

export default function HomePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<UserId>('ajay');
  const [loading, setLoading] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<'unknown' | 'granted' | 'denied' | 'default'>('unknown');
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    // Register service worker on mount
    registerServiceWorker();

    // Check current notification permission
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  const handleStartToday = async () => {
    setLoading(true);

    try {
      const today = getTodayDateString();

      // Initialize today's round if it doesn't exist
      await fetch(`/api/round?date=${today}`);

      // Navigate to today's question
      router.push(`/daily/${today}?uid=${userId}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load today\'s question. Please try again.');
      setLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    setNotificationLoading(true);

    try {
      const permission = await requestNotificationPermission();
      setNotificationStatus(permission);

      if (permission === 'granted') {
        await subscribeToPushNotifications(userId);
        alert('✅ Notifications enabled! You\'ll get a daily reminder at 8 PM.');
      } else {
        alert('❌ Notifications denied. You can enable them later in your browser settings.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('Failed to enable notifications. Please try again.');
    }

    setNotificationLoading(false);
  };

  const handleTestNotification = async () => {
    try {
      const success = await sendTestNotification(userId);
      if (success) {
        alert('✅ Test notification sent! Check your device.');
      } else {
        alert('❌ Failed to send test notification.');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('Failed to send test notification.');
    }
  };

  const getUserName = (id: UserId) => id === 'ajay' ? 'Ajay' : 'Akansha';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🎮</div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Sync
          </h1>
          <p className="text-xl text-gray-600">
            The Daily Connection Game
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome! 👋
          </h2>
          <p className="text-gray-600 mb-6">
            Answer today's question and guess what your partner will say. Build your collaborative score together!
          </p>

          {/* User Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Who are you?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUserId('ajay')}
                className={`
                  py-3 px-4 rounded-xl font-semibold transition-all duration-200
                  ${userId === 'ajay'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                Ajay 👨
              </button>
              <button
                onClick={() => setUserId('akansha')}
                className={`
                  py-3 px-4 rounded-xl font-semibold transition-all duration-200
                  ${userId === 'akansha'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                Akansha 👩
              </button>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartToday}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? 'Loading...' : 'Play Today\'s Sync 🎮'}
          </button>

          {/* Notification Setup */}
          {notificationStatus === 'default' && (
            <button
              onClick={handleEnableNotifications}
              disabled={notificationLoading}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 disabled:opacity-50"
            >
              {notificationLoading ? 'Setting up...' : '🔔 Enable Daily Reminders'}
            </button>
          )}

          {notificationStatus === 'granted' && (
            <div className="space-y-2">
              <div className="flex items-center justify-center text-green-600 font-semibold">
                ✅ Notifications Enabled
              </div>
              <button
                onClick={handleTestNotification}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
              >
                📨 Send Test Notification
              </button>
            </div>
          )}

          {notificationStatus === 'denied' && (
            <div className="text-center text-sm text-gray-500">
              Notifications blocked. Enable in browser settings to get daily reminders.
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-3xl mb-1">🎯</div>
            <div className="text-xs text-gray-600">Collaborative</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-3xl mb-1">⏱️</div>
            <div className="text-xs text-gray-600">2 Minutes</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <div className="text-3xl mb-1">📊</div>
            <div className="text-xs text-gray-600">Track Progress</div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white/80 backdrop-blur rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-3">How it works:</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>Answer today's question for yourself</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>Guess what your partner will answer</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Get 2 points if both guess correctly, 1 if one does, 0 if neither</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Build your collaborative score together!</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
