import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Tasks from "./Components/Tasks";
import AddTask from "./Components/AddTask";
import Navbar from "./Components/Navbar";

const App = () => {
  return (
    <BrowserRouter>
         <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/add" element={<AddTask />} />
        <Route path="*" element={<Home/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
