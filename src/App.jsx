import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import Places from './pages/Places'
import BucketList from './pages/BucketList'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/places" element={<Places />} />
        <Route path="/bucket-list" element={<BucketList />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
