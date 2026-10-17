import ExperienceDirectory from '../components/ExperienceDirectory.jsx';
export default function ModulesHubTargetPage({ onNavigate }) {
 return <main className="min-h-screen bg-[#061526] p-4 text-slate-100 md:p-8">
  <nav className="flex flex-wrap gap-5"><a href="#/dashboard">Main home</a><a href="#/modules">All studios &amp; tools</a><a href="#/lab">All laboratories</a><a href="#/visuals/pharma">Pharmaceutical Chemistry Lab</a></nav>
  <ExperienceDirectory kind="studios" onNavigate={onNavigate}/>
 </main>;
}
