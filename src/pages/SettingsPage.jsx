import { Trash2, Moon, Sun, Minimize2, Maximize2, Wind, Contrast, Languages, Palette } from 'lucide-react';

const ToggleRow = ({ label, desc, enabled, onToggle, icon: Icon }) => (
  <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
    <div className="flex items-center gap-3">
      {Icon && <Icon size={16} className="text-gray-400" />}
      <div>
        <p className="text-sm font-medium text-gray-200">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
    </div>
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-indigo-600' : 'bg-white/10'}`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : ''}`}
      />
    </button>
  </div>
);

export const SettingsPage = ({
  isDark, onThemeToggle,
  compact, onCompactToggle,
  reducedMotion, onReducedMotionToggle,
  highContrast, onHighContrastToggle,
  colorTheme, onColorThemeChange,
  language, onLanguageChange,
  onResetData,
}) => (
  <div className="p-4 md:p-6 max-w-lg mx-auto">
    <h2 className="text-lg font-bold text-white mb-6">Settings</h2>

    <div className="space-y-4">
      <div className="glass rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Appearance</h3>
        <ToggleRow
          label="Dark Mode"
          desc="Switch between dark and light themes"
          enabled={isDark}
          onToggle={onThemeToggle}
          icon={isDark ? Moon : Sun}
        />
        <ToggleRow
          label="Compact Tiles"
          desc="Show smaller element tiles in the periodic table"
          enabled={compact}
          onToggle={onCompactToggle}
          icon={compact ? Minimize2 : Maximize2}
        />
        <ToggleRow
          label="Reduced Motion"
          desc="Disable electron orbit animations"
          enabled={reducedMotion}
          onToggle={onReducedMotionToggle}
          icon={Wind}
        />
        <ToggleRow
          label="High Contrast"
          desc="Increase borders, text contrast, and focus visibility"
          enabled={highContrast}
          onToggle={onHighContrastToggle}
          icon={Contrast}
        />
        <div className="py-4 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <Palette size={16} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-200">Color Theme</p>
              <p className="text-xs text-gray-500 mt-0.5">Study, neon, classic, or print palette</p>
            </div>
          </div>
          <select value={colorTheme} onChange={e => onColorThemeChange(e.target.value)} className="input text-sm">
            <option value="study">Study</option>
            <option value="neon">Neon</option>
            <option value="classic">Classic</option>
            <option value="print">Print</option>
          </select>
        </div>
        <div className="py-4">
          <div className="flex items-center gap-3 mb-2">
            <Languages size={16} className="text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-200">Language</p>
              <p className="text-xs text-gray-500 mt-0.5">Hindi/English toggle for supported study panels</p>
            </div>
          </div>
          <select value={language} onChange={e => onLanguageChange(e.target.value)} className="input text-sm">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Data</h3>
        <p className="text-xs text-gray-400 mb-4">
          This app stores your theme preference, favorite elements, and quiz scores locally in your browser. No data is sent to any server.
        </p>
        <button
          onClick={onResetData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
        >
          <Trash2 size={14} />
          Reset All App Data
        </button>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About</h3>
        <div className="text-xs text-gray-400 space-y-1">
          <p>Chemistry Universe — Periodic Table Pro</p>
          <p>Version 1.0 · Phase 1</p>
          <p>118 elements · All data stored locally</p>
          <p className="mt-2 text-gray-600">Data sourced from standard chemistry references. Null values shown where data is not available. Atom shell diagrams are educational Bohr models, not quantum-mechanical representations.</p>
        </div>
      </div>
    </div>
  </div>
);
export default SettingsPage;
