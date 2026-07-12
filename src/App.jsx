import React, { useEffect } from 'react'
import Registration from './pages/Registration.jsx'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import { notifyVisit } from "./utils/visitorNotify";
import ProtectedRoute from './components/ProtectedRoute.jsx';

const App = () => {

  useEffect(() => {
    notifyVisit();
  }, []);

  return (
    <div>
      <Routes>
        <Route path='/' element={<Registration/>}/>
        <Route
          path='/home'
          element={
            <ProtectedRoute>
              <Home/>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App