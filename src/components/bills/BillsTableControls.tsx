
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search } from "lucide-react";
import { useScreenSize } from "@/hooks/use-mobile";

interface BillsTableControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const BillsTableControls = ({ searchQuery, onSearchChange }: BillsTableControlsProps) => {
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile' || screenSize === 'mobile-small';

  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bills..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex gap-2">
          <Select defaultValue="batch-actions">
            <SelectTrigger className="flex-1 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="batch-actions">Batch Actions</SelectItem>
              <SelectItem value="mark-paid">Mark as Paid</SelectItem>
              <SelectItem value="schedule-payment">Schedule Payment</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9 px-3">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <Select defaultValue="oldest-due">
          <SelectTrigger className="w-full h-9 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="oldest-due">Oldest due date</SelectItem>
            <SelectItem value="newest-due">Newest due date</SelectItem>
            <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
            <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Select defaultValue="batch-actions">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="batch-actions">Batch Actions</SelectItem>
            <SelectItem value="mark-paid">Mark as Paid</SelectItem>
            <SelectItem value="schedule-payment">Schedule Payment</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select defaultValue="oldest-due">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oldest-due">Oldest due date</SelectItem>
              <SelectItem value="newest-due">Newest due date</SelectItem>
              <SelectItem value="amount-high">Amount (High to Low)</SelectItem>
              <SelectItem value="amount-low">Amount (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Input
          placeholder="Search by bill number or vendor"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-80"
        />
      </div>
    </div>
  );
};
