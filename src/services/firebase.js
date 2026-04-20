import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  orderBy
} from "firebase/firestore";

// ✅ YOUR FIREBASE CONFIG (correct)
const firebaseConfig = {
  apiKey: "AIzaSyAidA86TOUzZwcEZad5ztBy1gsv7JDOrzg",
  authDomain: "ai-event-assistant-6a205.firebaseapp.com",
  projectId: "ai-event-assistant-6a205",
  storageBucket: "ai-event-assistant-6a205.firebasestorage.app",
  messagingSenderId: "7672012788",
  appId: "1:7672012788:web:009121c09c6b16046f63a1",
  measurementId: "G-45KJHHQXLM"
};

// ✅ INIT
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ FIXED GOOGLE PROVIDER (THIS WAS YOUR BUG)
const googleProvider = new GoogleAuthProvider();

// =========================
// 🔐 AUTH FUNCTIONS
// =========================
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

export const logoutUser = () => signOut(auth);

export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const registerWithEmail = async (email, password) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);

  // ✅ AUTO PROFILE CREATE
  await setDoc(doc(db, "users", res.user.uid), {
    fullName: "",
    email: res.user.email,
    phone: "",
    bio: "",
    organization: "",
    createdAt: serverTimestamp()
  });

  return res;
};

// =========================
// 🔥 DATABASE API
// =========================
export const dbAPI = {

  // EVENTS
  async getEvents() {
    const snapshot = await getDocs(collection(db, "events"));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getEventsByHub(hubId) {
    const q = query(collection(db, "events"), where("hubId", "==", hubId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async addEvent(data) {
    const ref = await addDoc(collection(db, "events"), {
      ...data,
      createdAt: serverTimestamp()
    });
    return ref.id;
  },

  async deleteEvent(id) {
    await deleteDoc(doc(db, "events", id));
  },

  async updateEvent(id, data) {
    await setDoc(doc(db, "events", id), {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  // HUBS
  async getHubs() {
    const snapshot = await getDocs(collection(db, "hubs"));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async addHub(data) {
    const ref = await addDoc(collection(db, "hubs"), data);
    return ref.id;
  },

  async deleteHub(id) {
    await deleteDoc(doc(db, "hubs", id));
  },

  async updateHub(id, data) {
    await setDoc(doc(db, "hubs", id), {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  // PROFILE
  async getProfile(userId) {
    const snap = await getDoc(doc(db, "users", userId));
    return snap.exists() ? snap.data() : null;
  },

  async updateProfile(userId, data) {
    await setDoc(doc(db, "users", userId), data, { merge: true });
  },

  // BOOKINGS
  async bookSession(userId, eventId) {
    await setDoc(doc(db, "bookings", `${userId}_${eventId}`), {
      userId,
      eventId,
      bookedAt: serverTimestamp()
    });
  },

  async getUserBookings(userId) {
    const q = query(collection(db, "bookings"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async cancelBooking(userId, eventId) {
    await deleteDoc(doc(db, "bookings", `${userId}_${eventId}`));
  },

  // CHAT
  async createChat(userId) {
    const ref = await addDoc(collection(db, "chats"), {
      userId,
      createdAt: serverTimestamp()
    });
    return ref.id;
  },

  async getUserChats(userId) {
    const q = query(collection(db, "chats"), where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const t1 = a.createdAt?.toMillis?.() || 0;
        const t2 = b.createdAt?.toMillis?.() || 0;
        return t2 - t1;
      });
  },

  async deleteChat(chatId) {
    await deleteDoc(doc(db, "chats", chatId));
  },

  async sendMessage(chatId, sender, text) {
    await addDoc(collection(db, "messages"), {
      chatId,
      sender,
      text,
      timestamp: serverTimestamp()
    });
  },

  async getMessages(chatId) {
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => {
      const t1 = a.timestamp?.toMillis?.() || 0;
      const t2 = b.timestamp?.toMillis?.() || 0;
      return t1 - t2;
    });
  },

  subscribeToMessages(chatId, callback) {
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId)
    );

    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })).sort((a, b) => {
        const t1 = a.timestamp?.toMillis?.() || 0;
        const t2 = b.timestamp?.toMillis?.() || 0;
        return t1 - t2;
      });
      callback(msgs);
    });
  }
};