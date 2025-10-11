import { useState } from "react";
import Header from "./components/header.jsx";
import SideBar from "./components/sidebar.jsx";
import MainContent from "./components/MainContent.jsx";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>
      <Header onSearch={setSearchQuery} />
      <MainContent searchQuery={searchQuery} />
      <SideBar />
    </div>
  );
};

export default App;
