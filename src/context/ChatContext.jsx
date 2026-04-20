import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  // We strictly persist Context States like Pathfinding origins or Booking metadata!
  // Actual string dialogue messages natively stream via Firestore `onSnapshot` inside ChatAssistant.jsx
  const [appState, setAppState] = useState({
      conversationStep: 'idle', 
      pendingBooking: null
  });

  // Global indicator for network sync
  const [isTyping, setIsTyping] = useState(false);

  return (
    <ChatContext.Provider value={{
      isTyping, setIsTyping,
      appState, setAppState
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
