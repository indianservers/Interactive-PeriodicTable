export const chemblActivityUrl = ({ targetId, moleculeId, type = "IC50" }) => {
  const query = new URLSearchParams({ target_chembl_id: targetId, molecule_chembl_id: moleculeId, standard_type: type, format: "json" });
  return `https://www.ebi.ac.uk/chembl/api/data/activity.json?${query}`;
};

