'use client';

interface ParentProps {
  children: React.ReactNode; // Type for children
}

export default function DisappearingText({ children}: ParentProps) {
  return (
    <div className="animated-overlay">
      <div className="animated-text">{children}</div>
    </div>
  );
}


