export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {icon && <div className="text-5xl mb-4">{icon}</div>}
    <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
    {description && <p className="text-gray-400 text-sm max-w-xs mb-4">{description}</p>}
    {action && <div>{action}</div>}
  </div>
);
export default EmptyState;
