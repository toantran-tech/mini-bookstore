import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderHistory from './pages/OrderHistory';
import AdminLayout from './pages/admin/AdminLayout';
import ManageBooks from './pages/admin/ManageBooks';
import ManageOrders from './pages/admin/ManageOrders';
import Dashboard from './pages/admin/Dashboard';
import TopBooks from './pages/TopBooks';

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <main>
                <Routes>
                    {}
                    <Route path="/" element={<Home />} />
                    <Route path="/top" element={<TopBooks />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/books/:id" element={<BookDetail />} />
                    <Route path="/admin" element={
                        <ProtectedRoute requireAdmin={true}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="books" element={<ManageBooks />} />
                        <Route path="orders" element={<ManageOrders />} />
                    </Route>

                    {/* Protected — cần đăng nhập */}
                    <Route path="/cart" element={
                        <ProtectedRoute><Cart /></ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                        <ProtectedRoute><Checkout /></ProtectedRoute>
                    } />
                    <Route path="/order-success" element={
                        <ProtectedRoute><OrderSuccess /></ProtectedRoute>
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
