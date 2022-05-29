import React from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

import NotFound from "./components/NotFound";
import AuctionList from "./components/AuctionList";
import Auction from "./components/Auction"
import LoginRegister from "./components/LoginRegister";
import CreateAuction from "./components/CreateAuction";


function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <Routes>
              <Route path="/auctions" element={<AuctionList/>}/>
              <Route path="/auctions/create" element={<CreateAuction/>}/>
              <Route path="/auctions/:id" element={<Auction/>}/>
              <Route path="/account" element={<LoginRegister/>}/>
              <Route path="*" element={<NotFound/>}/>
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
