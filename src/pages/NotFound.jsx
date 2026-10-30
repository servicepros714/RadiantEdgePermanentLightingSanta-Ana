import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="confirm" id="main">
      <div className="container confirm__card">
        <p className="eyebrow">404</p>
        <h1 className="confirm__title">This page is unlit.</h1>
        <p className="lede">The page you’re looking for doesn’t exist.</p>
        <div className="confirm__btns">
          <Link to="/" className="btn btn--emerald">Back to home</Link>
          <Link to="/book" className="btn btn--gold">Book online</Link>
        </div>
      </div>
    </main>
  );
}
