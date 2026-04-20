import { useEffect } from "react";
import { useHubStore } from "../store/useHubStore";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function MainLayout({ children }) {
  const { hubs, fetchHubs } = useHubStore();

  useEffect(() => {
    if (hubs.length === 0) {
      fetchHubs();
    }
  }, [hubs.length, fetchHubs]);

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden bg-[#050712] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.15),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),transparent_20%)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#02040b] via-[#080b16] to-[#090d1a] opacity-90" />

      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="relative flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto min-h-[calc(100vh-2rem)] max-w-[1600px] rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_35px_120px_rgba(0,0,0,0.22)] backdrop-blur-2xl md:p-6">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
