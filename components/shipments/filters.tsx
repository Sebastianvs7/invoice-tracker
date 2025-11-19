import { useMemo } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import { useCompanies } from "@/hooks/use-companies";
import type { FiltersProps } from "@/types";

export default function Filters({
  selectedCompanyId,
  onCompanyChange,
  onUploadClick,
}: FiltersProps) {
  const { companies, isLoading } = useCompanies();
  const t = useTranslations();

  const selectValue = selectedCompanyId ?? "all";
  const options = useMemo(
    () => [
      { id: "all", name: "all" },
      ...companies.map((company) => ({
        id: company.id.toString(),
        name: company.name,
      })),
    ],
    [companies]
  );

  const handleChange = (value: string) => {
    if (value === "all") {
      onCompanyChange(null);
    } else {
      onCompanyChange(value);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <Select
        value={selectValue}
        onValueChange={handleChange}
        disabled={isLoading && companies.length === 0}
      >
        <SelectTrigger
          className="w-full sm:w-[280px]"
          aria-label={t.filterPlaceholder}
        >
          <SelectValue placeholder={t.filterPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.id === "all" ? t.allCompanies : company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={onUploadClick} className="gap-2 ml-auto">
        <Upload className="h-4 w-4" />
        {t.uploadInvoices}
      </Button>
    </div>
  );
}
