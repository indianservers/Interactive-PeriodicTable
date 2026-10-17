import './apparatusIllustration.css';
export default function ApparatusIllustration({kind,alt}){return <figure className="lab-apparatus-illustration"><img src={'/assets/virtual-labs/apparatus/'+kind+'.png'} alt={alt} loading="lazy"/><figcaption>Apparatus overview · open the experiment to adjust controls and take measurements.</figcaption></figure>}
