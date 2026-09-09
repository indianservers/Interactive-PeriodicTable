export const Badge = ({ children, color = 'gray', className = '' }) => {
  const colors = {
    gray: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
    indigo: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    green: 'bg-green-500/20 text-green-300 border border-green-500/30',
    red: 'bg-red-500/20 text-red-300 border border-red-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    pink: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray} ${className}`}>
      {children}
    </span>
  );
};
export default Badge;
