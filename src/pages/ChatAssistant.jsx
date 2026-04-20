import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { dbAPI } from "../services/firebase";
import { Send, Trash2, Plus, Sparkles } from "lucide-react";
import EmptyState from "../components/EmptyState";
import SkeletonLoader from "../components/SkeletonLoader";
import PageTransition from "../components/PageTransition";

const CHAT_ENDPOINT = import.meta.env.VITE_AI_API_URL || "/api/chat";

export default function ChatAssistant() {
  const { currentUser } = useAuth();
  const { isTyping, setIsTyping } = useChat();

  const [inputText, setInputText] = useState("");
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [backendError, setBackendError] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [backendStatus, setBackendStatus] = useState("Checking AI connectivity...");
  const [checkingBackend, setCheckingBackend] = useState(true);
  const [pendingReply, setPendingReply] = useState(false);

  const chatEndRef = useRef(null);

  const checkBackendHealth = async () => {
    setCheckingBackend(true);
    try {
      // Since we're using a rule-based assistant, it's always ready
      setBackendOnline(true);
      setGeminiConfigured(true); // Not needed but set to true for compatibility
      setBackendStatus("EventMate AI assistant is ready to help!");
    } catch (error) {
      console.error("Health check failed:", error);
      setBackendOnline(true); // Always online for rule-based assistant
      setBackendStatus("Assistant is ready.");
    } finally {
      setCheckingBackend(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();

    if (!currentUser) return;

    const loadChats = async () => {
      setLoadingChats(true);
      const userChats = await dbAPI.getUserChats(currentUser.uid);

      if (userChats.length === 0) {
        const newId = await dbAPI.createChat(currentUser.uid);
        await dbAPI.sendMessage(
          newId,
          "bot",
          "Hi there! I'm EventMate AI. Ask me about events, your schedule, or book sessions."
        );

        const refreshed = await dbAPI.getUserChats(currentUser.uid);
        setChats(refreshed);
        setActiveChatId(newId);
      } else {
        setChats(userChats);
        setActiveChatId(userChats[0].id);
      }

      setLoadingChats(false);
    };

    loadChats();
  }, [currentUser]);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    const unsubscribe = dbAPI.subscribeToMessages(activeChatId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    });

    return () => unsubscribe();
  }, [activeChatId]);

  const createConversation = async () => {
    if (!currentUser) return null;

    try {
      const newId = await dbAPI.createChat(currentUser.uid);
      await dbAPI.sendMessage(
        newId,
        "bot",
        "Hello! I'm ready to help you find events, build your schedule, and streamline bookings."
      );

      const refreshed = await dbAPI.getUserChats(currentUser.uid);
      setChats(refreshed);
      setActiveChatId(newId);
      return newId;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      setBackendError(true);
      return null;
    }
  };

  const handleNewChat = async () => {
    setBackendError(false);
    await createConversation();
  };

  const handleDeleteChat = async (e, id) => {
    e.stopPropagation();
    await dbAPI.deleteChat(id);
    const refreshed = await dbAPI.getUserChats(currentUser.uid);
    setChats(refreshed);
    setActiveChatId(refreshed[0]?.id || null);
  };

  const processInput = async (text, chatId = activeChatId) => {
    setIsTyping(true);
    setPendingReply(true);
    setBackendError(false);

    try {
      // Simple rule-based assistant responses
      const lowerText = text.toLowerCase();
      let reply = "";

      if (lowerText.includes("event") || lowerText.includes("schedule") || lowerText.includes("book")) {
        if (lowerText.includes("what") || lowerText.includes("show") || lowerText.includes("list")) {
          reply = "I can help you find events! Check the Events Calendar page to see upcoming events and available sessions. You can filter by date, category, or hall.";
        } else if (lowerText.includes("book") || lowerText.includes("register")) {
          reply = "To book a session, go to the Events Calendar, select an event, and click 'Book Now'. Make sure you're logged in to save your bookings to your schedule.";
        } else if (lowerText.includes("my schedule") || lowerText.includes("my events")) {
          reply = "Visit the My Schedule page to see all your booked events and upcoming sessions. You can also manage your bookings there.";
        } else {
          reply = "Events are a great way to learn! I recommend checking the Upcoming Events page for the latest sessions. What type of event are you interested in?";
        }
      } else if (lowerText.includes("hall") || lowerText.includes("venue") || lowerText.includes("location")) {
        reply = "We have multiple halls available. Check the Hall Details page to see venue information, capacity, and amenities for each location.";
      } else if (lowerText.includes("profile") || lowerText.includes("account")) {
        reply = "You can manage your profile information on the Profile page. Update your details, preferences, and view your booking history.";
      } else if (lowerText.includes("help") || lowerText.includes("how")) {
        reply = "I'm here to help! You can ask me about events, booking sessions, your schedule, or navigating the platform. Try asking 'What events are available?' or 'How do I book a session?'";
      } else if (lowerText.includes("hello") || lowerText.includes("hi") || lowerText.includes("hey")) {
        reply = "Hello! I'm EventMate AI, your event planning assistant. How can I help you today?";
      } else {
        reply = "I'm here to help with event planning and scheduling. You can ask me about upcoming events, booking sessions, your schedule, or any questions about the platform. What would you like to know?";
      }

      await dbAPI.sendMessage(chatId, "bot", reply);
    } catch (error) {
      console.error("Chat processing failed:", error);
      setBackendError(true);
      await dbAPI.sendMessage(
        chatId,
        "bot",
        "I'm having trouble processing your message. Please try again."
      );
    } finally {
      setIsTyping(false);
      setPendingReply(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const chatId = activeChatId || (await createConversation());
    if (!chatId) return;

    setInputText("");
    try {
      await dbAPI.sendMessage(chatId, "user", text);
      await processInput(text, chatId);
    } catch (error) {
      console.error("Failed to send message:", error);
      setBackendError(true);
    }
  };

  const handleSuggestedPrompt = async (text) => {
    setBackendError(false);
    const chatId = activeChatId || (await createConversation());
    if (!chatId) return;

    setInputText("");
    try {
      await dbAPI.sendMessage(chatId, "user", text);
      await processInput(text, chatId);
    } catch (error) {
      console.error("Failed to send suggested prompt:", error);
      setBackendError(true);
    }
  };

  const activeChat = chats.find((chat) => chat.id === activeChatId);
  const subtitle = activeChat
    ? `Started ${activeChat.createdAt ? format(activeChat.createdAt.toDate(), "MMM d, yyyy") : "recently"}`
    : "Start a new conversation with your AI assistant.";

  const helperSuggestions = [
    "What should I attend next?",
    "Show me the best sessions for my schedule",
    "Help me book a session in the next hour",
  ];

  if (!currentUser) {
    return (
      <PageTransition>
        <div className="flex min-h-[60vh] items-center justify-center rounded-[2rem] border border-white/10 bg-[#111827]/80 p-8 text-center shadow-glow">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">Login to access EventMate AI</h2>
            <p className="text-sm text-slate-400 mb-6">Sign in to chat with your event planner AI and manage bookings.</p>
            <Link to="/login" className="btn-primary inline-flex items-center px-6 py-3">
              Go to Login
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="glass-panel flex min-h-[calc(100vh-4rem)] flex-col p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-300">Conversations</p>
              <h2 className="text-xl font-semibold text-white">Chat History</h2>
            </div>
            <button
              onClick={handleNewChat}
              className="inline-flex h-11 items-center justify-center rounded-3xl bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="min-h-[220px] flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loadingChats ? (
              <SkeletonLoader count={5} type="list" />
            ) : chats.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No conversations yet"
                desc="Create a new chat and start asking about events, schedules, or bookings."
                action={
                  <button onClick={handleNewChat} className="btn-primary">
                    Start chat
                  </button>
                }
              />
            ) : (
              <div className="space-y-3">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`w-full rounded-3xl border px-4 py-3 text-left transition ${
                      activeChatId === chat.id
                        ? "border-indigo-400/40 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-white"
                        : "border-white/5 bg-white/5 text-slate-300 hover:border-indigo-300/20 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Chat session</p>
                        <p className="text-xs text-slate-400 mt-1 truncate">{chat.createdAt ? format(chat.createdAt.toDate(), "MMM d, yyyy") : "Started recently"}</p>
                      </div>
                      <Trash2
                        size={16}
                        className="text-slate-400 hover:text-red-400"
                        onClick={(e) => handleDeleteChat(e, chat.id)}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <section className="glass-panel flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden px-0">
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-white">{activeChat ? "EventMate AI" : "New Conversation"}</h1>
                <p className="mt-2 text-sm text-slate-400 max-w-2xl">{subtitle}</p>
              </div>
              <div className="space-y-2 rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                <p>{messages.length} messages · {isTyping ? "AI is thinking..." : "Ready to chat"}</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className={`text-xs ${backendOnline ? "text-emerald-300" : "text-rose-300"}`}>
                    {checkingBackend ? "Checking assistant status..." : backendStatus}
                  </p>
                  {/* No retry button needed since assistant is always ready */}
                </div>
              </div>
            </div>
            {backendError && (
              <div className="mt-5 rounded-3xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 shadow-sm">
                Assistant encountered an issue. Please try again.
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
              {messages.length === 0 && !loadingChats ? (
                <EmptyState
                  icon={Sparkles}
                  title="Ask anything about your event program"
                  desc="Try one of the prompts below to get fast event planning advice."
                  action={
                    <div className="flex flex-wrap justify-center gap-3">
                      {helperSuggestions.map((text) => (
                        <button
                          key={text}
                          onClick={() => handleSuggestedPrompt(text)}
                          className="hint-chip"
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  }
                />
              ) : (
                <AnimatePresence initial={false} mode="popLayout">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.25 }}
                      className={`message-bubble ${msg.sender === "user" ? "message-user ml-auto bg-gradient-to-r from-indigo-500 to-violet-500 text-white" : "message-ai"}`}
                    >
                      <p className="text-sm leading-6">{msg.text}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {(isTyping || pendingReply) && (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="message-bubble message-ai inline-flex items-center gap-3 bg-white/10 border-white/10 shadow-sm"
                >
                  <span className="typing-dots inline-flex gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-slate-300 animate-pulse" />
                    <span className="inline-block h-2 w-2 rounded-full bg-slate-300 animate-pulse delay-150" />
                    <span className="inline-block h-2 w-2 rounded-full bg-slate-300 animate-pulse delay-300" />
                  </span>
                  {pendingReply ? "Crafting your premium EventMate answer..." : "AI is thinking..."}
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleUserSubmit} className="border-t border-white/10 px-6 py-5">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="chat-input"
                  placeholder="Ask about events, booking, or your schedule..."
                  disabled={!backendOnline}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className="btn-primary inline-flex h-14 items-center justify-center rounded-3xl px-6 py-3 text-sm"
                >
                  <Send size={18} />
                  Send
                </button>
              </div>

              {backendError && (
                <div className="mt-4 rounded-3xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  Assistant is temporarily unavailable. Your message has been saved.
                </div>
              )}
            </form>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
