import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Sectors from "@/pages/Sectors";
import Library from "@/pages/Library";
import Admin from "@/pages/Admin";
import SubscribeModal from "@/components/SubscribeModal";
import { SubscribeProvider, useSubscribe } from "@/context/SubscribeContext";

function AppContent() {
  const { isModalOpen, closeSubscribeModal } = useSubscribe();
  
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

