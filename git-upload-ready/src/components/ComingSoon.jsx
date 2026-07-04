import React from 'react';

function ComingSoon() {
  const kits = [
    { id: 'BUNNY-0404', title: 'EASTER BUNNY KIT', image: '/assets/bunny_kit.jpg' },
    { id: 'GNOME-2501', title: 'GARDEN GNOME KIT', image: '/assets/gnome_kit.jpg' }
  ];

  return (
    <div style={{ position: 'relative', display: 'flex', gap: '30px', alignItems: 'flex-end', paddingTop: '40px' }}>
      
      {/* Coming Soon Stamp */}
      <div style={{
        position: 'absolute',
        top: '-10px',
        left: '50%',
        transform: 'translateX(-50%) rotate(-3deg)',
        border: '3px solid #111',
        padding: '5px 15px',
        fontSize: '28px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        backgroundColor: 'rgba(255,255,255,0.8)',
        zIndex: 10,
        boxShadow: 'var(--shadow-flat)'
      }}>
        COMING SOON
      </div>

      {kits.map((kit, idx) => (
        <div key={idx} style={{
          flex: 1,
          backgroundImage: 'url(/assets/manila_folder.jpg)',
          backgroundSize: 'cover',
          borderRadius: '5px 15px 5px 5px',
          padding: '15px',
          boxShadow: 'var(--shadow-paper)',
          position: 'relative'
        }}>
          {/* File Tab */}
          <div style={{ position: 'absolute', top: '15px', left: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#444' }}></div>
            <span className="typewriter" style={{ fontSize: '10px', fontWeight: 'bold' }}>CASE FILE: {kit.id}</span>
          </div>

          <div style={{
            marginTop: '30px',
            backgroundColor: 'white',
            padding: '10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            <img src={kit.image} alt={kit.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            
            {/* Top Secret Stamp overlay */}
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '50px',
              height: '50px',
              border: '2px solid #333',
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              fontWeight: 'bold',
              transform: 'rotate(15deg)',
              backgroundColor: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              lineHeight: '1'
            }}>
              TOP<br/>SECRET
            </div>

            <h3 style={{
              textAlign: 'center',
              marginTop: '15px',
              fontSize: '22px',
              letterSpacing: '1px'
            }}>{kit.title}</h3>
          </div>
          
          {idx === 1 && (
            <div className="tape" style={{ top: '-15px', right: '-15px', transform: 'rotate(60deg)' }}></div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ComingSoon;
