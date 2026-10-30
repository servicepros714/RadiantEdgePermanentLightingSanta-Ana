import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { BUSINESS, DEPOSIT } from '../config/site.js';
import { useDraft, draftComplete, saveConfirmation } from '../lib/draft.jsx';
import { estimate, vehicleString, addonNames } from '../lib/pricing.js';
import { longDate, windowLabel } from '../lib/time.js';
import { createBooking, createPaymentIntent, apiConfigured } from '../lib/api.js';
import { Lock, Calendar, Clock, Pin, Home } from '../components/Icons.jsx';

const PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripeReady = /^pk_(test|live)_[A-Za-z0-9]+$/.test(PK) && !PK.includes('REPLACE');
const stripePromise = stripeReady ? loadStripe(PK) : null;

const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#00352A',
    colorText: '#1D1F21',
    colorDanger: '#B42318',
    fontFamily: 'Urbanist, system-ui, sans-serif',
    borderRadius: '10px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': { border: '1px solid #D8D0C2', boxShadow: 'none' },
    '.Input:focus': { border: '1px solid #00352A', boxShadow: '0 0 0 3px rgba(253,197,42,.35)' },
    '.Label': { fontWeight: '600' },
  },
};

function bookingBody(d, extra) {
  return {
    ref: d.ref,
    type: d.type,
    service: d.pkg,
    date: d.date,
    time: d.time,
    name: d.name.trim(),
    phone: d.phone.replace(/\D/g, ''),
    email: d.email.trim(),
    address: d.address.trim(),
    vehicle: vehicleString(d),
    addons: addonNames(d.addons),
    estimate: estimate(d),
    ...extra,
  };
}

function PayForm({ onPaid, busy, setBusy, setError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [express, setExpress] = useState(false);
  const returnUrl = `${window.location.origin}/checkout`;

  const confirm = useCallback(async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    setError('');
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required',
    });
    if (error) {
      setError(error.message || 'Your payment didn’t go through. Please try again.');
      setBusy(false);
      return;
    }
    if (paymentIntent && ['succeeded', 'processing', 'requires_capture'].includes(paymentIntent.status)) {
      onPaid(paymentIntent.id);
    } else {
      setError('Your payment didn’t complete. Please try again.');
      setBusy(false);
    }
  }, [stripe, elements, returnUrl, onPaid, setBusy, setError]);

  const submit = (e) => { e.preventDefault(); confirm(); };

  return (
    <form onSubmit={submit} className="pay__form">
      <div className={express ? 'pay__express' : 'pay__express is-empty'}>
        <ExpressCheckoutElement
          options={{ buttonHeight: 48 }}
          onReady={({ availablePaymentMethods }) => setExpress(Boolean(availablePaymentMethods))}
          onConfirm={confirm}
        />
      </div>
      {express && <p className="pay__or"><span>or pay by card</span></p>}
      <PaymentElement options={{ layout: 'tabs' }} />
      <button type="submit" className="btn btn--gold btn--lg btn--block" disabled={!stripe || busy}>
        <Lock width={18} height={18} /> {busy ? 'Processing…' : `Pay $${DEPOSIT} deposit`}
      </button>
    </form>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { draft: d } = useDraft();
  const [secret, setSecret] = useState('');
  const [intentErr, setIntentErr] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [paidButUnsaved, setPaidButUnsaved] = useState('');
  const startedRef = useRef(false);
  const ok = draftComplete(d);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const returnedPi = params.get('payment_intent');
  const redirectStatus = params.get('redirect_status');

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { if (!ok && !returnedPi) navigate('/book', { replace: true }); }, [ok, returnedPi, navigate]);

  const finish = useCallback(async (extra) => {
    setBusy(true);
    setError('');
    try {
      const res = await createBooking(bookingBody(d, extra));
      saveConfirmation({
        id: res.id, conflict: Boolean(res.conflict), payment: extra.payment === 'paid' ? 'Paid' : 'Pay Later',
        type: d.type, pkg: d.pkg, vehicle: vehicleString(d), date: d.date, time: d.time, name: d.name, email: d.email, address: d.address,
      });
      navigate('/confirmation', { replace: true }); // the draft is cleared on the confirmation page
    } catch (e) {
      setBusy(false);
      if (extra.payment === 'paid') setPaidButUnsaved(extra.piId);
      setError(e.message || 'We couldn’t save your booking. Please try again or call us.');
    }
  }, [d, navigate]);

  const onPaid = useCallback((piId) => finish({ payment: 'paid', piId }), [finish]);

  // Returning from a redirect-based payment method.
  useEffect(() => {
    if (!returnedPi || startedRef.current || !ok) return;
    startedRef.current = true;
    if (redirectStatus === 'succeeded' || redirectStatus === 'processing') onPaid(returnedPi);
    else setError('Your payment wasn’t completed. Please try again.');
  }, [returnedPi, redirectStatus, ok, onPaid]);

  // Create the PaymentIntent (never blocked on the database).
  useEffect(() => {
    if (!ok || returnedPi || !stripeReady || !apiConfigured() || secret) return;
    let off = false;
    createPaymentIntent(d.ref)
      .then((r) => { if (!off) setSecret(r.clientSecret); })
      .catch((e) => { if (!off) setIntentErr(e.message || 'Online payment is unavailable right now.'); });
    return () => { off = true; };
  }, [ok, returnedPi, d.ref, secret]);

  if (!ok) return <main className="checkout"><div className="container"><p className="note">Loading…</p></div></main>;

  const payUnavailable = !stripeReady || !apiConfigured() || intentErr;

  return (
    <main className="checkout" id="main">
      <div className="container">
        <header className="checkout__head">
          <p className="eyebrow">Checkout</p>
          <h1 className="checkout__title">Reserve your install</h1>
          <p className="checkout__sub">A ${DEPOSIT} reservation deposit holds your date and is applied to your final invoice.</p>
        </header>

        <div className="checkout__grid">
          <section className="order" aria-labelledby="order-title">
            <h2 id="order-title" className="order__title">Your install</h2>
            <p className="order__pkg">{d.type} · {d.pkg}</p>
            <ul className="order__list">
              <li><Home width={18} height={18} /><span>{vehicleString(d)}</span></li>
              <li><Calendar width={18} height={18} /><span>{longDate(d.date)}</span></li>
              <li><Clock width={18} height={18} /><span>{windowLabel(d.time)} (Pacific)</span></li>
              <li><Pin width={18} height={18} /><span>{d.address}</span></li>
            </ul>
            <dl className="order__money">
              <div><dt>Estimate</dt><dd>{estimate(d)}</dd></div>
              <div className="order__due"><dt>Due today</dt><dd>${DEPOSIT}.00</dd></div>
            </dl>
            <p className="order__fine">Applied to your final invoice. Final price is confirmed at the on-site visit.</p>
            <Link to="/book" className="order__edit">Edit details</Link>
          </section>

          <section className="pay" aria-labelledby="pay-title">
            <h2 id="pay-title" className="pay__title"><Lock width={18} height={18} /> Reservation deposit</h2>

            {paidButUnsaved ? (
              <div className="formerr" role="alert">
                Your payment went through, but we couldn’t save the booking. Please try again, or call {BUSINESS.phoneDisplay} and mention payment {paidButUnsaved}.
                <button type="button" className="btn btn--emerald btn--block" disabled={busy} onClick={() => onPaid(paidButUnsaved)}>
                  {busy ? 'Saving…' : 'Try saving again'}
                </button>
              </div>
            ) : returnedPi ? (
              <p className="note">{busy ? 'Confirming your payment…' : ''}</p>
            ) : payUnavailable ? (
              <p className="note">
                {intentErr || 'Online payment isn’t set up yet.'} You can still reserve your date and pay at the visit.
              </p>
            ) : secret ? (
              <Elements key={secret} stripe={stripePromise} options={{ clientSecret: secret, appearance }}>
                <PayForm onPaid={onPaid} busy={busy} setBusy={setBusy} setError={setError} />
              </Elements>
            ) : (
              <div className="pay__skeleton" aria-busy="true" aria-label="Loading secure payment form"><span /><span /><span /></div>
            )}

            {error && !paidButUnsaved && <p className="formerr" role="alert">{error}</p>}

            <p className="pay__secure">Payments are processed securely by Stripe.</p>
            {!paidButUnsaved && (
              <button type="button" className="textlink" disabled={busy} onClick={() => finish({ payment: 'later' })}>
                I’ll pay at the visit
              </button>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
