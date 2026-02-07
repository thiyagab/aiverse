import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }: any) => {
  const baseClass = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-story-accent hover:bg-story-accentHover text-white shadow-lg shadow-story-accent/20",
    secondary: "bg-story-700 hover:bg-story-600 text-white",
    outline: "border border-story-700 hover:border-story-accent text-gray-300 hover:text-white",
    ghost: "text-gray-400 hover:text-white hover:bg-story-800"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseClass} ${variants[variant as keyof typeof variants]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export const Input = ({ label, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>}
    <input 
      {...props}
      className="w-full bg-story-800 border border-story-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-story-accent focus:ring-1 focus:ring-story-accent transition-all"
    />
  </div>
);

export const TextArea = ({ label, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>}
    <textarea 
      {...props}
      className="w-full bg-story-800 border border-story-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-story-accent focus:ring-1 focus:ring-story-accent transition-all min-h-[100px]"
    />
  </div>
);

export const Select = ({ label, options, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>}
    <select 
      {...props}
      className="w-full bg-story-800 border border-story-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-story-accent focus:ring-1 focus:ring-story-accent transition-all appearance-none"
    >
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export const Card = ({ children, className = '' }: any) => (
  <div className={`bg-story-800/50 backdrop-blur-sm border border-story-700 rounded-xl p-6 ${className}`}>
    {children}
  </div>
);

export const Badge = ({ children, color = 'blue' }: any) => {
    const colors = {
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        green: "bg-green-500/10 text-green-400 border-green-500/20",
        red: "bg-red-500/10 text-red-400 border-red-500/20",
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[color as keyof typeof colors] || colors.blue}`}>
            {children}
        </span>
    )
}
