import React from 'react'
import Registration from './pages/Registration.jsx'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Registration/>}/>
        <Route path='/home' element={<Home/>}/>
      </Routes>
    </div>
  )
}

export default App
