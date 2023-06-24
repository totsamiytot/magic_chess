import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';

import {HomePage} from "pages/HomePage";
import {BoardPage} from "./pages/BoardPage";

import "./app/styles/reset.css";
import "./app/styles/index.css";

function App() {
    return (
        <div className="app">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="game" element={<BoardPage/>}/>
                </Routes>
            </BrowserRouter>
            <div className="app-bg"></div>
        </div>
    );
}

export default App;
