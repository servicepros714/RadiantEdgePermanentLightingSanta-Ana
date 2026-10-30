import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Nav, { FocusBar } from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import MobileBar from './components/MobileBar.jsx';
import Home from './pages/Home.jsx';
import Book from './pages/Book.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmation from './pages/Confirmation.jsx';
import NotFound from './pages/NotFound.jsx';

/* Scroll to top on every route change; scroll to the section when the URL has a hash. */
function ScrollManager() {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      let tries = 0;
      const go = () => {
        const el = document.getElementById(id);
        if (el) {
          const navH = document.querySelector('.nav')?.offsetHeight || 0;
          window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navH + 1, behavior: 'smooth' });
        } else if (tries++ < 20) requestAnimationFrame(go);
      };
      go();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, key]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const focused = pathname === '/book' || pathname === '/checkout';
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <ScrollManager />
      {focused ? <FocusBar backTo={pathname === '/checkout' ? '/book' : '/'} backLabel={pathname === '/checkout' ? 'Booking' : 'Home'} /> : <Nav />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/book" element={<Book />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!focused && <Footer />}
      <MobileBar />
    </>
  );
}
