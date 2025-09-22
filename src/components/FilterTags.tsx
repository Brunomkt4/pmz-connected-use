import { Badge } from "@/components/ui/badge";

export const FilterTags = () => {
  const filters = [
    { id: "health", label: "Sanitary Inspection", color: "bg-brand-blue", textColor: "text-white" },
    { id: "transport", label: "Refrigerated Transport", color: "bg-brand-orange", textColor: "text-white" },
    { id: "banking", label: "Bank Guarantees", color: "bg-brand-red", textColor: "text-white" },
    { id: "credit", label: "Letter of Credit", color: "bg-brand-navy", textColor: "text-white" },
    { id: "halal", label: "Halal/Kosher Certification", color: "bg-brand-burgundy", textColor: "text-white" },
  ];

  return (
    <div className="bg-gradient-card border-b border-border px-6 py-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {filters.map((filter) => (
          <Badge
            key={filter.id}
            variant="secondary"
            className={`${filter.color} ${filter.textColor} hover:opacity-90 hover:shadow-soft cursor-pointer px-4 py-2 font-medium smooth-transition rounded-full border-0`}
          >
            {filter.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};