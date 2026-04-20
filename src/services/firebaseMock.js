import { useState, useEffect } from 'react';

// Create a pseudo-mock that mimics Firebase API perfectly.
// If actual Firebase is injected later, we just swap this file's imports.

const MOCK_DELAY = 500; // Simulated network delay

const getStorage = (key, defaultVal) => {
  const d = localStorage.getItem(key);
  return d ? JSON.parse(d) : defaultVal;
};
const setStorage = (key, val) => localStorage.setItem(key, JSON.stringify(val));

// Seed default events if empty
const seedEvents = [
  { id: '1', title: 'Keynote', time: '10:00', hallId: 'hall-a', desc: 'Opening ceremony' },
  { id: '2', title: 'AI Talk', time: '14:00', hallId: 'hall-a', desc: 'Future of AI models' },
  { id: '3', title: 'Web Dev', time: '15:00', hallId: 'hall-b', desc: 'React & Vite workflows' },
  { id: '4', title: 'Hackathon Briefing', time: '16:00', hallId: 'hall-c', desc: 'Rules & setup' }
];

if (!localStorage.getItem('events')) {
  setStorage('events', seedEvents);
}
if (!localStorage.getItem('bookings')) {
  setStorage('bookings', []);
}

// ----------------- AUTH (MOCK) -----------------
export const mockSignInWithGoogle = async () => {
  return new Promise((resolve) => setTimeout(() => {
    const user = { uid: 'user_123', displayName: 'Demo User', email: 'demo@techfest.com' };
    setStorage('currentUser', user);
    resolve(user);
  }, MOCK_DELAY));
};

export const mockSignOut = async () => {
    return new Promise((resolve) => setTimeout(() => {
        localStorage.removeItem('currentUser');
        resolve();
    }, MOCK_DELAY));
}

export const getMockCurrentUser = () => getStorage('currentUser', null);

// ----------------- DB (MOCK FIRESTORE) -----------------
export const dbAPI = {
  getEvents: async () => {
    return new Promise(res => setTimeout(() => res(getStorage('events', [])), MOCK_DELAY));
  },
  
  getEventsByHall: async (hallId) => {
    return new Promise(res => setTimeout(() => {
      const all = getStorage('events', []);
      res(all.filter(e => e.hallId === hallId));
    }, MOCK_DELAY));
  },

  addEvent: async (eventData) => {
    return new Promise(res => setTimeout(() => {
      const all = getStorage('events', []);
      const newEvent = { ...eventData, id: Date.now().toString() };
      all.push(newEvent);
      setStorage('events', all);
      res(newEvent);
    }, MOCK_DELAY));
  },

  deleteEvent: async (id) => {
    return new Promise(res => setTimeout(() => {
      let all = getStorage('events', []);
      all = all.filter(e => e.id !== id);
      setStorage('events', all);
      res();
    }, MOCK_DELAY));
  },

  // Bookings
  bookSession: async (userId, eventId) => {
     return new Promise(res => setTimeout(() => {
         const bookings = getStorage('bookings', []);
         if(!bookings.find(b => b.userId === userId && b.eventId === eventId)) {
             bookings.push({ userId, eventId, timestamp: Date.now() });
             setStorage('bookings', bookings);
         }
         res();
     }, MOCK_DELAY));
  },

  getUserBookings: async (userId) => {
      return new Promise(res => setTimeout(() => {
          const bookings = getStorage('bookings', []).filter(b => b.userId === userId);
          const allEvents = getStorage('events', []);
          // Hydrate with event data
          const hydrated = bookings.map(b => ({
              ...b,
              event: allEvents.find(e => e.id === b.eventId) || { title: 'Unknown (Deleted)' }
          }));
          res(hydrated);
      }, MOCK_DELAY));
  }
};
