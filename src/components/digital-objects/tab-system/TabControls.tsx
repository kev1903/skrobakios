import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export const TabControls = () => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">3 hidden fields</span>
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
      >
        Filter
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
      >
        Group
      </Button>
    </div>
  );
};