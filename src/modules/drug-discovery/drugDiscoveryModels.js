/**
 * Normalized domain contracts used by Drug Discovery Studio.
 * These JSDoc types keep source evidence attached instead of flattening unlike assays.
 *
 * @typedef {Object} SourceCitation
 * @property {string} sourceDatabase
 * @property {string} sourceId
 * @property {string} sourceUrl
 * @property {string} retrievedAt
 * @property {'experimental'|'computed'|'predicted'|'simulated'} experimentalOrPredicted
 * @property {string=} method
 * @property {string=} notes
 *
 * @typedef {Object} ProteinTarget
 * @property {string} id
 * @property {string} name
 * @property {string} gene
 * @property {string} uniprot
 * @property {string} organism
 * @property {SourceCitation[]} provenance
 *
 * @typedef {Object} BindingSite
 * @property {string[]} residues
 * @property {string=} ligandCode
 * @property {SourceCitation[]} provenance
 *
 * @typedef {Object} ProteinStructure
 * @property {string} id
 * @property {string} method
 * @property {number=} resolution
 * @property {string} source
 * @property {BindingSite=} bindingSite
 * @property {SourceCitation} provenance
 *
 * @typedef {Object} Compound
 * @property {number} cid
 * @property {string} chembl
 * @property {string} name
 * @property {string} smiles
 * @property {string} inchikey
 * @property {number} mw
 * @property {number} logp
 * @property {number} tpsa
 * @property {SourceCitation[]} provenance
 *
 * @typedef {Object} Assay
 * @property {string} assayId
 * @property {string} targetId
 * @property {string} organism
 * @property {number} confidenceScore
 * @property {SourceCitation} provenance
 *
 * @typedef {Object} BioactivityRecord
 * @property {string} moleculeId
 * @property {string} activityType
 * @property {number} standardValue
 * @property {string} unit
 * @property {string} relation
 * @property {number=} pchembl
 * @property {SourceCitation} provenance
 *
 * @typedef {Object} ADMERecord
 * @property {string} endpoint
 * @property {number|null} value
 * @property {string=} unit
 * @property {SourceCitation=} provenance
 *
 * @typedef {Object} ToxicityRecord
 * @property {string} endpoint
 * @property {number|null} value
 * @property {string=} unit
 * @property {SourceCitation=} provenance
 *
 * @typedef {Object} ScreeningResult
 * @property {number} cid
 * @property {string} method
 * @property {number=} rank
 * @property {SourceCitation} provenance
 *
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} targetId
 * @property {string} status
 *
 * @typedef {Object} NotebookEntry
 * @property {string} id
 * @property {string} kind
 * @property {string} content
 * @property {string} createdAt
 */

export const MODEL_SCHEMA_VERSION = "1.0.0";

