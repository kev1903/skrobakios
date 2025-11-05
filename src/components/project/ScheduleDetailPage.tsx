import React, { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useScheduleSections } from '@/hooks/useScheduleSections';
import { useScheduleItems } from '@/hooks/useScheduleItems';

interface ScheduleDetailPageProps {
  scheduleId: string;
  scheduleName: string;
  onBack: () => void;
}

export const ScheduleDetailPage = ({ scheduleId, scheduleName, onBack }: ScheduleDetailPageProps) => {
  const { sections, loading: sectionsLoading, createSection } = useScheduleSections(scheduleId);
  const [showNewProductDialog, setShowNewProductDialog] = useState(false);
  const [showNewSectionDialog, setShowNewSectionDialog] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [newProductData, setNewProductData] = useState({
    product_code: '',
    product_name: '',
    width: '',
    length: '',
    height: '',
    depth: '',
    qty: '',
    lead_time: '',
    brand: '',
    color: '',
    finish: '',
    material: '',
    supplier: '',
    status: 'Draft'
  });

  const handleOpenAddProductDialog = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setNewProductData({
      product_code: '',
      product_name: '',
      width: '',
      length: '',
      height: '',
      depth: '',
      qty: '',
      lead_time: '',
      brand: '',
      color: '',
      finish: '',
      material: '',
      supplier: '',
      status: 'Draft'
    });
    setShowNewProductDialog(true);
  };

  const handleCreateSection = async () => {
    if (newSectionName.trim()) {
      await createSection(newSectionName);
      setNewSectionName('');
      setShowNewSectionDialog(false);
    }
  };

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
          <div className="flex gap-2">
            <Button onClick={() => setShowNewSectionDialog(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              New Section
            </Button>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sectionsLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading sections...</div>
          ) : sections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No sections yet. Click "New Section" to add one.</div>
          ) : (
            sections.map((section) => (
              <SectionView 
                key={section.id} 
                section={section} 
                scheduleId={scheduleId}
                onOpenAddProductDialog={handleOpenAddProductDialog}
                productDataToAdd={currentSectionId === section.id ? newProductData : null}
                onProductAdded={() => {
                  setShowNewProductDialog(false);
                  setCurrentSectionId(null);
                  setNewProductData({
                    product_code: '',
                    product_name: '',
                    width: '',
                    length: '',
                    height: '',
                    depth: '',
                    qty: '',
                    lead_time: '',
                    brand: '',
                    color: '',
                    finish: '',
                    material: '',
                    supplier: '',
                    status: 'Draft'
                  });
                }}
              />
            ))
          )}
        </div>

        {/* New Section Dialog */}
        <Dialog open={showNewSectionDialog} onOpenChange={setShowNewSectionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="section-name">Section Name</Label>
                <Input
                  id="section-name"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g., Windows, Doors, etc."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewSectionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSection}>Create Section</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Product Dialog */}
        <Dialog open={showNewProductDialog} onOpenChange={setShowNewProductDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Product Code */}
              <div className="space-y-2">
                <Label htmlFor="product_code">Product Code</Label>
                <Input
                  id="product_code"
                  value={newProductData.product_code}
                  onChange={(e) => setNewProductData({ ...newProductData, product_code: e.target.value })}
                  placeholder="Enter product code"
                />
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name</Label>
                <Input
                  id="product_name"
                  value={newProductData.product_name}
                  onChange={(e) => setNewProductData({ ...newProductData, product_name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={newProductData.brand}
                  onChange={(e) => setNewProductData({ ...newProductData, brand: e.target.value })}
                  placeholder="Enter brand"
                />
              </div>

              {/* Material */}
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={newProductData.material}
                  onChange={(e) => setNewProductData({ ...newProductData, material: e.target.value })}
                  placeholder="Enter material"
                />
              </div>

              {/* Width */}
              <div className="space-y-2">
                <Label htmlFor="width">Width (MM)</Label>
                <Input
                  id="width"
                  type="number"
                  value={newProductData.width}
                  onChange={(e) => setNewProductData({ ...newProductData, width: e.target.value })}
                  placeholder="Enter width"
                />
              </div>

              {/* Length */}
              <div className="space-y-2">
                <Label htmlFor="length">Length (MM)</Label>
                <Input
                  id="length"
                  type="number"
                  value={newProductData.length}
                  onChange={(e) => setNewProductData({ ...newProductData, length: e.target.value })}
                  placeholder="Enter length"
                />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <Label htmlFor="height">Height (MM)</Label>
                <Input
                  id="height"
                  type="number"
                  value={newProductData.height}
                  onChange={(e) => setNewProductData({ ...newProductData, height: e.target.value })}
                  placeholder="Enter height"
                />
              </div>

              {/* Depth */}
              <div className="space-y-2">
                <Label htmlFor="depth">Depth (MM)</Label>
                <Input
                  id="depth"
                  type="number"
                  value={newProductData.depth}
                  onChange={(e) => setNewProductData({ ...newProductData, depth: e.target.value })}
                  placeholder="Enter depth"
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={newProductData.color}
                  onChange={(e) => setNewProductData({ ...newProductData, color: e.target.value })}
                  placeholder="Enter color"
                />
              </div>

              {/* Finish */}
              <div className="space-y-2">
                <Label htmlFor="finish">Finish</Label>
                <Input
                  id="finish"
                  value={newProductData.finish}
                  onChange={(e) => setNewProductData({ ...newProductData, finish: e.target.value })}
                  placeholder="Enter finish"
                />
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="qty">Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  value={newProductData.qty}
                  onChange={(e) => setNewProductData({ ...newProductData, qty: e.target.value })}
                  placeholder="Enter quantity"
                />
              </div>

              {/* Lead Time */}
              <div className="space-y-2">
                <Label htmlFor="lead_time">Lead Time</Label>
                <Input
                  id="lead_time"
                  value={newProductData.lead_time}
                  onChange={(e) => setNewProductData({ ...newProductData, lead_time: e.target.value })}
                  placeholder="e.g., 2 weeks"
                />
              </div>

              {/* Supplier */}
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={newProductData.supplier}
                  onChange={(e) => setNewProductData({ ...newProductData, supplier: e.target.value })}
                  placeholder="Enter supplier name"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newProductData.status}
                  onValueChange={(value) => setNewProductData({ ...newProductData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Ordered">Ordered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewProductDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Trigger product addition by setting data, actual creation in SectionView
                setShowNewProductDialog(false);
              }}>
                Add Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Section View Component
const SectionView = ({ 
  section, 
  scheduleId,
  onOpenAddProductDialog,
  productDataToAdd,
  onProductAdded
}: { 
  section: any; 
  scheduleId: string;
  onOpenAddProductDialog: (sectionId: string) => void;
  productDataToAdd: any;
  onProductAdded: () => void;
}) => {
  const { items, loading, createItem, updateItem, deleteItem } = useScheduleItems(section.id);

  // Auto-add product when productDataToAdd changes
  useEffect(() => {
    const addProduct = async () => {
      if (productDataToAdd && Object.keys(productDataToAdd).some(key => productDataToAdd[key])) {
        await createItem(section.id, productDataToAdd);
        onProductAdded();
      }
    };
    addProduct();
  }, [productDataToAdd]);

  const handleAddProduct = async () => {
    onOpenAddProductDialog(section.id);
  };

  const handleFieldUpdate = async (itemId: string, field: string, value: string) => {
    await updateItem(itemId, { [field]: value });
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-border/30 rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      {/* Section Header */}
      <div className="px-6 py-4 border-b border-border/30 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">{section.name}</h2>
            <Badge variant="outline" className="bg-muted/50">
              {items.length}
            </Badge>
          </div>
          <Button size="sm" onClick={handleAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
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
            {loading ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="border-b border-border/30 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                          <div className="w-12 h-8 bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10 rounded" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{item.product_code || '-'}</div>
                          <div className="text-xs text-muted-foreground">PRODUCT DETAILS</div>
                        </div>
                      </div>
                      <Input 
                        placeholder="Enter Doc Code" 
                        className="text-xs h-8"
                        defaultValue={item.product_code || ''}
                        onBlur={(e) => handleFieldUpdate(item.id, 'product_code', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="space-y-2">
                      <Input 
                        placeholder="-" 
                        className="text-xs h-8"
                        defaultValue={item.product_name || ''}
                        onBlur={(e) => handleFieldUpdate(item.id, 'product_name', e.target.value)}
                      />
                      <div className="text-[10px] uppercase text-muted-foreground">PRODUCT NAME</div>
                      <Input 
                        placeholder="-" 
                        className="text-xs h-8"
                        defaultValue={item.brand || ''}
                        onBlur={(e) => handleFieldUpdate(item.id, 'brand', e.target.value)}
                      />
                      <div className="text-[10px] uppercase text-muted-foreground">BRAND</div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="space-y-2">
                      <Input 
                        placeholder="-" 
                        className="text-xs h-8"
                        defaultValue={item.width || ''}
                        onBlur={(e) => handleFieldUpdate(item.id, 'width', e.target.value)}
                      />
                      <div className="text-[10px] uppercase text-muted-foreground">WIDTH (MM)</div>
                      <Input 
                        placeholder="-" 
                        className="text-xs h-8"
                        defaultValue={item.color || ''}
                        onBlur={(e) => handleFieldUpdate(item.id, 'color', e.target.value)}
                      />
                      <div className="text-[10px] uppercase text-muted-foreground">COLOUR</div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="space-y-2">
                      <Input 
                        placeholder="-" 
                        className="text-xs h-8"
                        defaultValue={item.length || ''}
                        onBlur={(e) => handleFieldUpdate(item.id, 'length', e.target.value)}
                      />
                      <div className="text-[10px] uppercase text-muted-foreground">LENGTH (MM)</div>
                      <Input 
                        placeholder="-" 
                        className="text-xs h-8"
                        defaultValue={item.finish || ''}
                        onBlur={(e) => handleFieldUpdate(item.id, 'finish', e.target.value)}
                      />
                      <div className="text-[10px] uppercase text-muted-foreground">FINISH</div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="space-y-2">
                      <Input 
                        placeholder="-" 
                        className="text-xs h-8"
                        defaultValue={item.height || ''}
                        onBlur={(e) => handleFieldUpdate(item.id, 'height', e.target.value)}
                      />
                      <div className="text-[10px] uppercase text-muted-foreground">HEIGHT (MM)</div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="space-y-2">
                      <Input 
                        placeholder="-" 
                        className="text-xs h-8"
                        defaultValue={item.depth || ''}
                        onBlur={(e) => handleFieldUpdate(item.id, 'depth', e.target.value)}
                      />
                      <div className="text-[10px] uppercase text-muted-foreground">DEPTH (MM)</div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="space-y-2">
                      <Input 
                        placeholder="-" 
                        className="text-xs h-8"
                        defaultValue={item.qty || ''}
                        onBlur={(e) => handleFieldUpdate(item.id, 'qty', e.target.value)}
                      />
                      <div className="text-[10px] uppercase text-muted-foreground">QTY</div>
                      <div className="text-xs text-foreground">Options: {item.material || '-'}</div>
                      <div className="text-[10px] uppercase text-muted-foreground">MATERIAL</div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="space-y-2">
                      <Input 
                        placeholder="-" 
                        className="text-xs h-8"
                        defaultValue={item.lead_time || ''}
                        onBlur={(e) => handleFieldUpdate(item.id, 'lead_time', e.target.value)}
                      />
                      <div className="text-[10px] uppercase text-muted-foreground">LEAD TIME</div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Supplier</div>
                      <Input 
                        placeholder="Click to add supplier" 
                        className="text-xs h-8"
                        defaultValue={item.supplier || ''}
                        onBlur={(e) => handleFieldUpdate(item.id, 'supplier', e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <Select 
                      defaultValue={item.status || 'Draft'}
                      onValueChange={(value) => handleFieldUpdate(item.id, 'status', value)}
                    >
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
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteItem(item.id)}
                          >
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
                  No items in this section yet. Click "Add Product" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
