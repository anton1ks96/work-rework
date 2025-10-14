import { useEffect, useState } from "react";
import Header from "./components/header.jsx";
import SideBar from "./components/sidebar.jsx";
import MainContent from "./components/MainContent.jsx";
import Footer from "./components/Footer.jsx";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clearTrigger, setClearTrigger] = useState(0); // increments to signal clearing search
  const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

    return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header
          onSearch={setSearchQuery}
          onOpenSidebar={() => setIsMobileSidebarVisible(true)}
          onSearchFocus={() => setIsSearchFocused(true)}
          onSearchBlur={() => setIsSearchFocused(false)}
          clearTrigger={clearTrigger}
        />

        <MainContent
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isMobileSidebarVisible={isMobileSidebarVisible}
            setIsMobileSidebarVisible={setIsMobileSidebarVisible}
            setClearTrigger={setClearTrigger}
        />
      {/* Desktop overlay: appears while focusing search with short query; clickable to dismiss */}
      {!isMobile && isSearchFocused && searchQuery.length < 2 && (
        <div
          onClick={() => {
            setSearchQuery("");
            setIsSearchFocused(false);
            setClearTrigger(c => c + 1);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 5,
            cursor: "pointer",
            transition: "background .25s ease"
          }}
        />
      )}
      <SideBar />
      <Footer />
    </div>
  );
};

export default App;
