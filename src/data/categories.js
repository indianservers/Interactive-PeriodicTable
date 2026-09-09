export const categories = [
  { id: "alkali metal", label: "Alkali Metal", color: "#ef4444", bgClass: "bg-red-500", textClass: "text-red-400", borderClass: "border-red-500/40" },
  { id: "alkaline earth metal", label: "Alkaline Earth Metal", color: "#f97316", bgClass: "bg-orange-500", textClass: "text-orange-400", borderClass: "border-orange-500/40" },
  { id: "transition metal", label: "Transition Metal", color: "#eab308", bgClass: "bg-yellow-500", textClass: "text-yellow-400", borderClass: "border-yellow-500/40" },
  { id: "post-transition metal", label: "Post-Transition Metal", color: "#22c55e", bgClass: "bg-green-500", textClass: "text-green-400", borderClass: "border-green-500/40" },
  { id: "metalloid", label: "Metalloid", color: "#14b8a6", bgClass: "bg-teal-500", textClass: "text-teal-400", borderClass: "border-teal-500/40" },
  { id: "reactive nonmetal", label: "Reactive Nonmetal", color: "#3b82f6", bgClass: "bg-blue-500", textClass: "text-blue-400", borderClass: "border-blue-500/40" },
  { id: "halogen", label: "Halogen", color: "#8b5cf6", bgClass: "bg-violet-500", textClass: "text-violet-400", borderClass: "border-violet-500/40" },
  { id: "noble gas", label: "Noble Gas", color: "#ec4899", bgClass: "bg-pink-500", textClass: "text-pink-400", borderClass: "border-pink-500/40" },
  { id: "lanthanide", label: "Lanthanide", color: "#06b6d4", bgClass: "bg-cyan-500", textClass: "text-cyan-400", borderClass: "border-cyan-500/40" },
  { id: "actinide", label: "Actinide", color: "#f59e0b", bgClass: "bg-amber-500", textClass: "text-amber-400", borderClass: "border-amber-500/40" },
  { id: "unknown", label: "Unknown", color: "#6b7280", bgClass: "bg-gray-500", textClass: "text-gray-400", borderClass: "border-gray-500/40" },
];

export const getCategoryInfo = (categoryId) => {
  const normalized = (categoryId || "").toLowerCase();
  return categories.find(c => c.id === normalized) || categories[categories.length - 1];
};

export default categories;
