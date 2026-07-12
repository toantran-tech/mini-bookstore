import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const BookDetail = lazy(() => import('./pages/BookDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const NotFound = lazy(() => import('./pages/NotFound'));
const TopBooks = lazy(() => import('./pages/TopBooks'));
const PaymentReturn = lazy(() => import('./pages/PaymentReturn'));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageBooks = lazy(() => import('./pages/admin/ManageBooks'));
const ManageOrders = lazy(() => import('./pages/admin/ManageOrders'));
const ManageCoupons = lazy(() => import('./pages/admin/ManageCoupons'));
const ManageCategories = lazy(() => import('./pages/admin/ManageCategories'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));

function RouteFallback() {
    return (
        <div className="min-h-[50vh] flex items-center justify-center" role="status" aria-live="polite">
            <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold">Đang tải trang...</span>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                    <Suspense fallback={<RouteFallback />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/top" element={<TopBooks />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/books/:id" element={<BookDetail />} />
                            <Route path="/payment-return" element={<PaymentReturn />} />

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
                    </Suspense>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;