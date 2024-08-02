
// src/Router.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './App';
import GameSession from './gamesession';
import Game from './game';
import KOTHSession from './kothsession';
import KOTHGame from './kothgame';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gamesession" element={<GameSession />} />
        <Route path="/game" element={<Game />} />
        <Route path="/kothsession" element={<KOTHSession />} />
        <Route path="/kothgame" element={<KOTHGame />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
