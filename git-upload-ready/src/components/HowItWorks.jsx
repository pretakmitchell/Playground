import React from 'react';

function HowItWorks() {
  const steps = [
    { num: 1, icon: '📁', title: 'RECEIVE', subtitle: 'YOUR KIT' },
    { num: 2, icon: '🔍', title: 'FOLLOW THE', subtitle: 'CLUES' },
    { num: 3, icon: '👣', title: 'COMPLETE', subtitle: 'THE MISSIONS' },
    { num: 4, icon: '🛡️', title: 'EARN YOUR', subtitle: 'BADGE' }
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Tape on corners */}
      <div className="tape" style={{ top: '-10px', left: '-20px', transform: 'rotate(-45deg)' }}></div>
      <div className="tape" style={{ top: '-10px', right: '-20px', transform: 'rotate(45deg)' }}></div>

      <div style={{
        backgroundImage: 'url(/assets/torn_paper.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '40px 30px',
        boxShadow: 'var(--shadow-deep)',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h2 style={{
          fontSize: '32px',
          letterSpacing: '1px',
          marginBottom: '30px',
          textTransform: 'uppercase'
        }}>HOW THE MISSION WORKS</h2>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          gap: '15px'
        }}>
          {steps.map((step, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.4)',
              border: '1px solid rgba(0,0,0,0.1)',
              padding: '15px 10px',
              borderRight: idx !== steps.length - 1 ? '1px dashed rgba(0,0,0,0.2)' : '1px solid rgba(0,0,0,0.1)',
              flex: 1
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-gold)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                {step.num}
              </div>
              <div style={{ fontSize: '36px', marginBottom: '15px', filter: 'grayscale(100%)' }}>
                {step.icon}
              </div>
              <div style={{ 
                fontFamily: 'var(--font-heading)', 
                textAlign: 'center', 
                fontSize: '14px', 
                fontWeight: '600',
                lineHeight: '1.2'
              }}>
                {step.title} <br/> {step.subtitle}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
