import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export const ViewControlsDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
        >
          Grid view <ChevronDown className="ml-2 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-slate-800 border-white/20">
        <DropdownMenuItem className="text-white hover:bg-white/10">
          Grid view
        </DropdownMenuItem>
        <DropdownMenuItem className="text-white hover:bg-white/10">
          List view
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};