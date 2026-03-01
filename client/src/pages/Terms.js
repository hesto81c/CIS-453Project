import React from 'react';
import { useNavigate } from 'react-router-dom';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '40px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
      <div style={{ width: '3px', height: '20px', background: 'linear-gradient(180deg,#9b1c31,#7a1526)', borderRadius: '2px', flexShrink: 0 }}/>
      <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', fontWeight: 600, color: '#f0f2f8', margin: 0, letterSpacing: '3px' }}>{title}</h2>
    </div>
    <div style={{ color: '#9098aa', fontSize: '14px', lineHeight: 1.9, letterSpacing: '0.3px', paddingLeft: '19px' }}>
      {children}
    </div>
  </div>
);

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#050508', minHeight: '100vh', fontFamily: "'Montserrat',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');`}</style>

      {/* Top accent */}
      <div style={{ height: '2px', background: 'linear-gradient(90deg,transparent,#9b1c31,#c8cdd6,#9b1c31,transparent)' }}/>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg,#0e0e14,#050508)', borderBottom: '1px solid #1e1e2e', padding: '60px 40px 48px', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1rem', letterSpacing: '6px', color: '#9b1c31', marginBottom: '12px', fontWeight: 600 }}>
          RENTAL 10
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 700, color: '#f0f2f8', margin: '0 0 16px', letterSpacing: '4px' }}>
          Terms & Conditions
        </h1>
        <p style={{ color: '#4a5060', fontSize: '12px', letterSpacing: '2px' }}>
          EFFECTIVE DATE: JANUARY 1, 2026 · SYRACUSE, NEW YORK
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 40px 80px' }}>

        <div style={{ background: 'rgba(155,28,49,0.06)', border: '1px solid rgba(155,28,49,0.2)', borderRadius: '10px', padding: '20px 24px', marginBottom: '48px' }}>
          <p style={{ color: '#c8cdd6', fontSize: '13px', lineHeight: 1.8, margin: 0 }}>
            Please read these Terms and Conditions carefully before renting a vehicle from Rental 10. By completing a reservation, you agree to be bound by the following terms.
          </p>
        </div>

        <Section title="1. ELIGIBILITY REQUIREMENTS">
          <p>To rent a vehicle from Rental 10, you must meet the following requirements:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '12px' }}>
            <li style={{ marginBottom: '8px' }}>Be at least 21 years of age at the time of rental</li>
            <li style={{ marginBottom: '8px' }}>Hold a valid driver's license issued in the United States or equivalent international license</li>
            <li style={{ marginBottom: '8px' }}>Provide a valid form of government-issued photo identification</li>
            <li style={{ marginBottom: '8px' }}>Present a valid credit or debit card in your name at the time of pickup</li>
          </ul>
        </Section>

        <Section title="2. RESERVATIONS & PAYMENTS">
          <p>All reservations are subject to vehicle availability. A booking is confirmed only after successful payment processing. Rental 10 accepts credit cards, debit cards, PayPal, and cash payments.</p>
          <p style={{ marginTop: '12px' }}>Prices are listed in US dollars and are subject to applicable New York State sales tax (8.875%). Additional fees may apply for airport pickups, one-way rentals, and optional insurance coverage.</p>
        </Section>

        <Section title="3. CANCELLATION POLICY">
          <p>Reservations may be cancelled at no charge up to 24 hours before the scheduled pickup time. Cancellations made within 24 hours of the pickup time may be subject to a cancellation fee equal to one day's rental rate.</p>
          <p style={{ marginTop: '12px' }}>To cancel a reservation, log in to your account and navigate to My Reservations in your profile, or contact our customer service team directly.</p>
        </Section>

        <Section title="4. VEHICLE USE">
          <p>The rented vehicle must only be operated by the registered driver listed in the reservation. Subletting or transferring the vehicle to a third party is strictly prohibited. The vehicle must be used in compliance with all applicable traffic laws and regulations.</p>
          <p style={{ marginTop: '12px' }}>Off-road use, racing, towing, or transporting hazardous materials is expressly forbidden. Smoking in any rental vehicle is prohibited and will result in a cleaning fee.</p>
        </Section>

        <Section title="5. INSURANCE & LIABILITY">
          <p>Optional full coverage insurance is available at an additional daily rate. Without this coverage, the renter assumes full financial responsibility for any damage, theft, or loss of the vehicle during the rental period.</p>
          <p style={{ marginTop: '12px' }}>Rental 10 carries liability insurance as required by New York State law. However, this coverage does not extend to the renter's personal property or consequential damages.</p>
        </Section>

        <Section title="6. FUEL POLICY">
          <p>All vehicles are provided with a full tank of fuel and must be returned with a full tank. If the vehicle is returned with less fuel than provided, a refueling fee will be charged at the prevailing local rate plus a service charge.</p>
        </Section>

        <Section title="7. LATE RETURNS">
          <p>Vehicles must be returned by the date and time specified in the reservation. Late returns beyond a one-hour grace period will be charged at the daily rental rate pro-rated by the hour, plus an administrative fee.</p>
        </Section>

        <Section title="8. DAMAGE & ACCIDENTS">
          <p>The renter is responsible for reporting any damage or accident involving the rental vehicle immediately, regardless of fault. Failure to report damage may result in additional charges. All accidents must be documented with a police report.</p>
        </Section>

        <Section title="9. PRIVACY">
          <p>Rental 10 collects personal information necessary to process reservations and comply with legal obligations. Your data is stored securely and will not be sold or shared with third parties except as required by law. For full details, please refer to our Privacy Policy.</p>
        </Section>

        <Section title="10. GOVERNING LAW">
          <p>These Terms and Conditions are governed by the laws of the State of New York. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Onondaga County, New York.</p>
        </Section>

        <Section title="11. CONTACT">
          <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
          <div style={{ marginTop: '12px', background: '#0e0e14', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '16px 20px' }}>
            <p style={{ margin: '0 0 4px', color: '#f0f2f8', fontWeight: 600 }}>Rental 10</p>
            <p style={{ margin: '0 0 4px' }}>Syracuse, New York 13201</p>
            <p style={{ margin: '0 0 4px' }}>Email: rental10syracuse@gmail.com</p>
          </div>
        </Section>

        {/* Back button */}
        <div style={{ borderTop: '1px solid #1e1e2e', paddingTop: '40px', display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/catalog')} style={{
            background: 'linear-gradient(135deg,#9b1c31,#7a1526)', border: 'none',
            borderRadius: '8px', padding: '13px 32px', color: '#f0f2f8',
            fontWeight: 700, fontSize: '11px', letterSpacing: '3px',
            cursor: 'pointer', fontFamily: "'Montserrat',sans-serif",
          }}>BROWSE FLEET</button>
          <button onClick={() => navigate(-1)} style={{
            background: 'transparent', border: '1px solid #1e1e2e',
            borderRadius: '8px', padding: '13px 32px', color: '#6a7080',
            fontWeight: 600, fontSize: '11px', letterSpacing: '3px',
            cursor: 'pointer', fontFamily: "'Montserrat',sans-serif",
          }}>GO BACK</button>
        </div>
      </div>
    </div>
  );
};

export default Terms;