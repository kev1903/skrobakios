import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduleItem {
  id: string;
  productCode: string;
  productName: string;
  width: string;
  length: string;
  height: string;
  depth: string;
  qty: string;
  leadTime: string;
  brand: string;
  color: string;
  finish: string;
  material: string;
  supplier: string;
  status: string;
}

interface ScheduleSection {
  id: string;
  name: string;
  count: number;
  items: ScheduleItem[];
}

interface ScheduleDetailPageProps {
  scheduleName: string;
  onBack: () => void;
}

export const ScheduleDetailPage = ({ scheduleName, onBack }: ScheduleDetailPageProps) => {
  const [sections, setSections] = useState<ScheduleSection[]>([
    {
      id: '1',
      name: 'Moulding',
      count: 4,
      items: [
        {
          id: '1-1',
          productCode: 'PWC090',
          productName: '',
          width: '',
          length: '',
          height: '',
          depth: '',
          qty: '',
          leadTime: '',
          brand: '',
          color: '',
          finish: '',
          material: 'Mouldex, Light...',
          supplier: '',
          status: 'Draft'
        }
      ]
    },
    {
      id: '2',
      name: 'Render',
      count: 1,
      items: []
    },
    {
      id: '3',
      name: 'Balustrades',
      count: 1,
      items: []
    }
  ]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-semibold text-foreground">{scheduleName}</h1>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} className="bg-white/80 backdrop-blur-xl border border-border/30 rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
              {/* Section Header */}
              <div className="px-6 py-4 border-b border-border/30 bg-muted/20">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-foreground">{section.name}</h2>
                  <Badge variant="outline" className="bg-muted/50">
                    {section.count}
                  </Badge>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/10 border-b border-border/30">
                      <th className="px-4 py-3 text-left">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                          Product Details
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                          Product Name
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                          Width (MM)
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                          Length (MM)
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                          Height (MM)
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                          Depth (MM)
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                          QTY
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                          Lead Time
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                          Supplier
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                          Status
                        </div>
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.items.length > 0 ? (
                      section.items.map((item) => (
                        <tr key={item.id} className="border-b border-border/30 hover:bg-accent/30 transition-colors">
                          <td className="px-4 py-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                                  <div className="w-12 h-8 bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10 rounded" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-foreground">{item.productCode}</div>
                                  <div className="text-xs text-muted-foreground">PRODUCT DETAILS</div>
                                </div>
                              </div>
                              <Input placeholder="Enter Doc Code" className="text-xs h-8" />
                            </div>
                          </td>
                          <td className="px-4 py-6">
                            <div className="space-y-2">
                              <Input placeholder="-" className="text-xs h-8" />
                              <div className="text-[10px] uppercase text-muted-foreground">PRODUCT NAME</div>
                              <Input placeholder="-" className="text-xs h-8" />
                              <div className="text-[10px] uppercase text-muted-foreground">BRAND</div>
                            </div>
                          </td>
                          <td className="px-4 py-6">
                            <div className="space-y-2">
                              <Input placeholder="-" className="text-xs h-8" />
                              <div className="text-[10px] uppercase text-muted-foreground">WIDTH (MM)</div>
                              <Input placeholder="-" className="text-xs h-8" />
                              <div className="text-[10px] uppercase text-muted-foreground">COLOUR</div>
                            </div>
                          </td>
                          <td className="px-4 py-6">
                            <div className="space-y-2">
                              <Input placeholder="-" className="text-xs h-8" />
                              <div className="text-[10px] uppercase text-muted-foreground">LENGTH (MM)</div>
                              <Input placeholder="-" className="text-xs h-8" />
                              <div className="text-[10px] uppercase text-muted-foreground">FINISH</div>
                            </div>
                          </td>
                          <td className="px-4 py-6">
                            <div className="space-y-2">
                              <Input placeholder="-" className="text-xs h-8" />
                              <div className="text-[10px] uppercase text-muted-foreground">HEIGHT (MM)</div>
                            </div>
                          </td>
                          <td className="px-4 py-6">
                            <div className="space-y-2">
                              <Input placeholder="-" className="text-xs h-8" />
                              <div className="text-[10px] uppercase text-muted-foreground">DEPTH (MM)</div>
                            </div>
                          </td>
                          <td className="px-4 py-6">
                            <div className="space-y-2">
                              <Input placeholder="-" className="text-xs h-8" />
                              <div className="text-[10px] uppercase text-muted-foreground">QTY</div>
                              <div className="text-xs text-foreground">Options: {item.material}</div>
                              <div className="text-[10px] uppercase text-muted-foreground">MATERIAL</div>
                            </div>
                          </td>
                          <td className="px-4 py-6">
                            <div className="space-y-2">
                              <Input placeholder="-" className="text-xs h-8" />
                              <div className="text-[10px] uppercase text-muted-foreground">LEAD TIME</div>
                            </div>
                          </td>
                          <td className="px-4 py-6">
                            <div className="space-y-2">
                              <div className="text-sm text-muted-foreground">Supplier</div>
                              <div className="text-xs text-muted-foreground">Click to add supplier</div>
                            </div>
                          </td>
                          <td className="px-4 py-6">
                            <Select defaultValue={item.status}>
                              <SelectTrigger className="w-28 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Ordered">Ordered</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-4 py-6">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="h-8">
                                Details
                              </Button>
                              <Button variant="outline" size="sm" className="h-8">
                                Quote
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">
                          No items in this section yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
