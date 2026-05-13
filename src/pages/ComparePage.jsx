import { CompareElements } from '../components/compare/CompareElements.jsx';

export const ComparePage = ({ initialElement }) => (
  <div className="p-4 md:p-6 max-w-4xl mx-auto h-full flex flex-col">
    <div className="mb-4">
      <h2 className="text-lg font-bold text-white mb-1">Compare Elements</h2>
      <p className="text-sm text-gray-400">Search and select two elements for a side-by-side property comparison.</p>
    </div>
    <div className="flex-1 overflow-hidden">
      <CompareElements initialElement={initialElement} />
    </div>
  </div>
);
export default ComparePage;
