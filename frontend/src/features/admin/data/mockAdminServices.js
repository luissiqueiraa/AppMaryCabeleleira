export const serviceFilters = [
  { id: "all", label: "Todos" },
  { id: "hair", label: "Cabelo" },
  { id: "nails", label: "Unhas" },
  { id: "makeup", label: "Maquiagem" },
  { id: "brows", label: "Sobrancelha" },
];

export const serviceCategories = serviceFilters.filter((item) => item.id !== "all");
