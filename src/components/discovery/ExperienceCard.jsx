import { Bookmark, ArrowUpRight } from 'lucide-react';
import ConceptIcon from '../ConceptIcon.jsx';
import { conceptPng, categoryPng } from '../../data/homeIconManifest.js';
import { Highlight } from './SearchBox.jsx';
export default function ExperienceCard({entry,query='',saved,onSave,onOpen,onPreview}) {
  return <article className={`cl-result dx-card ${entry.upcoming?'is-upcoming':''}`}>
    <div className="dx-card-top"><div className="dx-thumbnail" style={{'--thumb-color':entry.color}}><ConceptIcon icon={conceptPng[entry.id]||categoryPng[entry.category]}/></div><span>{entry.type}<small>{entry.level}</small></span><button aria-label={`${saved?'Unsave':'Save'} ${entry.title}`} aria-pressed={saved} onClick={()=>onSave(entry.id)}><Bookmark size={18} fill={saved?'currentColor':'none'}/></button></div>
    <span className="cl-result-meta">{entry.categoryTitle}</span><h4>{entry.upcoming?<Highlight text={entry.title} query={query}/>:<a href={`#/${entry.path}`} onClick={event=>onOpen(event,entry)}><Highlight text={entry.title} query={query}/></a>}</h4>
    <p><Highlight text={entry.description} query={query}/></p><small className="dx-card-group">{entry.subgroup}</small>
    <div className="dx-card-actions"><button onClick={()=>onPreview(entry)}>Preview & learning goals</button>{entry.upcoming?<em>Upcoming</em>:<a href={`#/${entry.path}`} onClick={event=>onOpen(event,entry)} aria-label={`Open ${entry.title}`}><ArrowUpRight size={18}/></a>}</div>
  </article>;
}
