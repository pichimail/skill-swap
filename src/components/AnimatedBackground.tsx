'use client';

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#f4f7fb]">
      {/* Light icy mesh gradient orbs */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full opacity-80"
        style={{ background: '#e0eaf5', filter: 'blur(100px)' }}
      />
      <div 
        className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-80"
        style={{ background: '#e6f0fa', filter: 'blur(120px)' }}
      />
      <div 
        className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full opacity-80"
        style={{ background: '#f0f4f8', filter: 'blur(100px)' }}
      />
      
      {/* Very subtle dot grid to match Moven texture */}
      <div 
        className="absolute inset-0 opacity-40" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.06) 1px, transparent 1px)', 
          backgroundSize: '24px 24px' 
        }} 
      />
    </div>
  );
}
