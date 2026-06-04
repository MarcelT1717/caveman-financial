import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Sectors from "@/pages/Sectors";
import Library from "@/pages/Library";
import Admin from "@/pages/Admin";
import SubscribeModal from "@/components/SubscribeModal";
import { SubscribeProvider, useSubscribe } from "@/context/SubscribeContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const KEEP_ALIVE_INTERVAL = 14 * 60 * 1000; // 14 minutes

function AppContent() {
  const { isModalOpen, closeSubscribeModal } = useSubscribe();

  useEffect(() => {
    const ping = () => fetch(`${BACKEND_URL}/api/`).catch(() => {});
    ping();
    const interval = setInterval(ping, KEEP_ALIVE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sectors" element={<Sectors />} />
          <Route path="/library" element={<Library />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
      <SubscribeModal isOpen={isModalOpen} onClose={closeSubscribeModal} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SubscribeProvider>
        <AppContent />
      </SubscribeProvider>
    </BrowserRouter>
  );
}

export default App;

