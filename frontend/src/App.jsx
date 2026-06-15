import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/admin/AdminLayout';
import ManageBooks from './pages/admin/ManageBooks';
import ManageOrders from './pages/admin/ManageOrders';
import Dashboard from './pages/admin/Dashboard';
import ManageCoupons from './pages/admin/ManageCoupons';
import ManageCategories from './pages/admin/ManageCategories';
import ManageUsers from './pages/admin/ManageUsers';
import TopBooks from './pages/TopBooks';

function App() {
    return (
        <BrowserRouter>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                    <Routes>
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
                            <Route path="coupons" element={<ManageCoupons />} />
                            <Route path="categories" element={<ManageCategories />} />
                            <Route path="users" element={<ManageUsers />} />
                        </Route>

                        <Route path="/cart" element={
                            <ProtectedRoute><Cart /></ProtectedRoute>
                        } />
                        <Route path="/checkout" element={
                            <ProtectedRoute><Checkout /></ProtectedRoute>
                        } />
                        <Route path="/order-success" element={
                            <ProtectedRoute><OrderSuccess /></ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute><Profile /></ProtectedRoute>
                        } />
                        <Route path="/wishlist" element={
                            <ProtectedRoute><Wishlist /></ProtectedRoute>
                        } />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;
