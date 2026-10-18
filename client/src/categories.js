// Catégories (niveau 1) et sous-catégories (niveau 2) du site.
// value = valeur enregistrée en base · label = texte affiché
// ⚠ Si tu ajoutes une catégorie ici, ajoute aussi sa value dans l'enum de models/Product.js
export const CATEGORIES = [
  { value: "bijoux-accessoires", label: " Accessoires", subs: [
    ["boucles", "Boucles d'oreilles"], ["bagues", "Bagues"], ["colliers", "Colliers"], ["bracelets", "Bracelets"],
    ["parures", "Parures & ensembles"], ["montres", "Montres & coffrets"], ["cheveux", "Accessoires cheveux"], ["chapelets", "Chapelets & porte-clés"],
  ] },
  { value: "sacs", label: "Sacs", subs: [
    ["perles", "Sacs en perles"], ["crochet", "Sacs en crochet"], ["autres", "Autres sacs"],
  ] },
  { value: "laine", label: "Article en laine", subs: [
    ["gilets", "Gilets & cardigans"], ["foulards", " bonnets & cachecol"], ["autres", "Autres"],
  ] },
  { value: "bebe", label: "Bébé", subs: [
    ["tetine", "Attaches-tétine"], ["broches", "Broches bébé"], ["autres", "Autres"],
  ] },
 
  { value: "autres", label: "Autres", subs: [] },
];

export const subsOf = (c) => CATEGORIES.find((x) => x.value === c)?.subs || [];
export const labelOf = (c) => CATEGORIES.find((x) => x.value === c)?.label || c;
export const subLabelOf = (c, s) => subsOf(c).find(([v]) => v === s)?.[1] || "";
export const fullLabel = (c, s) => [labelOf(c), subLabelOf(c, s)].filter(Boolean).join(" › ");
