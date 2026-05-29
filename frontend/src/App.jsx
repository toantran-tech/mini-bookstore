import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <main>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/books/:id" element={<BookDetail />} />

                    {/* Protected — cần đăng nhập */}
                    <Route path="/cart" element={
                        <ProtectedRoute><Cart /></ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                        <ProtectedRoute><OrderHistory /></ProtectedRoute>
                    } />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;
