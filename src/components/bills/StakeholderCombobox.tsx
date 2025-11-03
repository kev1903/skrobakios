import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStakeholders } from "@/hooks/useStakeholders";
import { useCompany } from "@/contexts/CompanyContext";

interface StakeholderComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const StakeholderCombobox = ({ value, onValueChange }: StakeholderComboboxProps) => {
  const [open, setOpen] = useState(false);
  const { currentCompany } = useCompany();
  
  const { stakeholders, loading } = useStakeholders({
    companyId: currentCompany?.id,
    status: ['active'],
  });

  const getDisplayValue = () => {
    if (!value) return "Select stakeholder";
    
    // While loading, show loading state instead of raw ID
    if (loading) {
      return "Loading...";
    }
    
    const stakeholder = stakeholders.find((s) => s.id === value);
    if (stakeholder) {
      return stakeholder.display_name;
    }
    
    // If stakeholder not found after loading, show placeholder
    return "Select stakeholder";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">{getDisplayValue()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-background/95 backdrop-blur-xl border-border/30 z-[9999]">
        <Command>
          <CommandInput 
            placeholder="Search stakeholder..." 
          />
          <CommandEmpty>
            {loading ? "Loading..." : "No stakeholders found"}
          </CommandEmpty>
          <CommandGroup>
            <CommandItem
              value=""
              onSelect={() => {
                onValueChange("");
                setOpen(false);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === "" ? "opacity-100" : "opacity-0"
                )}
              />
              Not assigned
            </CommandItem>
            {stakeholders.map((stakeholder) => (
              <CommandItem
                key={stakeholder.id}
                value={stakeholder.display_name}
                onSelect={() => {
                  onValueChange(stakeholder.id === value ? "" : stakeholder.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === stakeholder.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{stakeholder.display_name}</span>
                  {stakeholder.category && (
                    <span className="text-xs text-muted-foreground capitalize">
                      {stakeholder.category}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
