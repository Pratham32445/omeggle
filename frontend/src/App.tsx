import Header from "./components/Header";
import Home from "./components/Home";
import Landing from "./components/Landing";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <div className="w-full h-screen">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/start" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
