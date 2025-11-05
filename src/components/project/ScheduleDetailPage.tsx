import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, MoreHorizontal, Trash2, Edit, Loader2, ExternalLink } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScheduleDetailPageProps {
  scheduleId: string;
  scheduleName: string;
  onBack: () => void;
}

export const ScheduleDetailPage = ({ scheduleId, scheduleName, onBack }: ScheduleDetailPageProps) => {
  const { sections, loading: sectionsLoading, createSection } = useScheduleSections(scheduleId);
  const { toast } = useToast();
  const [showNewProductDialog, setShowNewProductDialog] = useState(false);
  const [showNewSectionDialog, setShowNewSectionDialog] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [productUrl, setProductUrl] = useState('');
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);

  const handleOpenAddProductDialog = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    setProductUrl('');
    setPastedImage(null);
    setExtractedData(null);
    setShowPreview(false);
    setIsAnalyzing(false);
    setImageFileName('');
    setShowNewProductDialog(true);
  };

  const handleAnalyzeProduct = async () => {
    if (!productUrl && !pastedImage) return;
    
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-product-details', {
        body: { 
          url: productUrl || null,
          imageBase64: pastedImage || null
        }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Analysis failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data.success && data.productData) {
        // Ensure quantity defaults to "1" and include URL
        const productData = {
          ...data.productData,
          qty: data.productData.qty || "1",
          url: data.productData.url || productUrl // Use extracted URL or fallback to input URL
        };
        setExtractedData(productData);
        setShowPreview(true);
        toast({
          title: "Analysis complete",
          description: "Review and edit the extracted product details before saving.",
        });
      } else {
        throw new Error("Failed to extract product details");
      }
    } catch (error: any) {
      console.error('Error analyzing product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to analyze product",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!currentSectionId || !extractedData) return;
    
    try {
      // Upload image if there's one
      let imageUrl = null;
      if (uploadedImageFile) {
        imageUrl = await uploadProductImage(uploadedImageFile);
        if (!imageUrl) {
          toast({
            title: "Warning",
            description: "Failed to upload product image, but product will be saved without image.",
            variant: "destructive",
          });
        }
      }

      // Save to database
      const { data, error } = await supabase
        .from('schedule_items')
        .insert({
          section_id: currentSectionId,
          product_code: extractedData.product_code,
          product_name: extractedData.product_name,
          brand: extractedData.brand,
          material: extractedData.material,
          width: extractedData.width,
          length: extractedData.length,
          height: extractedData.height,
          depth: extractedData.depth,
          color: extractedData.color,
          finish: extractedData.finish,
          qty: extractedData.qty,
          lead_time: extractedData.lead_time,
          supplier: extractedData.supplier,
          url: extractedData.url,
          image_url: imageUrl,
          status: 'Draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Product saved",
        description: "Product has been added to the schedule successfully.",
      });
      
      // Trigger refresh of sections
      setRefreshKey(prev => prev + 1);
      
      // Close dialog and reset states
      setShowNewProductDialog(false);
      setShowPreview(false);
      setExtractedData(null);
      setProductUrl('');
      setPastedImage(null);
      setImageFileName('');
      setUploadedImageFile(null);
      setCurrentSectionId(null);
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast({
        title: "Error saving product",
        description: error.message || "Failed to save product to schedule",
        variant: "destructive",
      });
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      
      for (const item of clipboardItems) {
        // Check for image
        const imageTypes = item.types.filter(type => type.startsWith('image/'));
        if (imageTypes.length > 0) {
          const blob = await item.getType(imageTypes[0]);
          const reader = new FileReader();
          reader.onloadend = () => {
            setPastedImage(reader.result as string);
            setProductUrl('');
            setImageFileName('Pasted Image');
          };
          reader.readAsDataURL(blob);
          return;
        }
        
        // Check for text/URL
        if (item.types.includes('text/plain')) {
          const blob = await item.getType('text/plain');
          const text = await blob.text();
          setProductUrl(text.trim());
          setPastedImage(null);
          setImageFileName('');
          return;
        }
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      toast({
        title: "Paste failed",
        description: "Could not read from clipboard. Please try uploading a file instead.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if it's a JPG/JPEG file
    if (!file.type.match(/^image\/(jpeg|jpg)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG or JPEG image.",
        variant: "destructive",
      });
      return;
    }
    
    // Store the file for later upload
    setUploadedImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPastedImage(reader.result as string);
      setProductUrl('');
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const uploadProductImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
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
                key={`${section.id}-${refreshKey}`}
                section={section} 
                scheduleId={scheduleId}
                onOpenAddProductDialog={handleOpenAddProductDialog}
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            {!showPreview ? (
              <div className="space-y-6 py-6">
                {/* URL Input */}
                <div className="space-y-3">
                  <Label htmlFor="product-url">Product URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="product-url"
                      value={productUrl}
                      onChange={(e) => {
                        setProductUrl(e.target.value);
                        setPastedImage(null);
                        setImageFileName('');
                      }}
                      placeholder="Paste product URL here"
                      className="flex-1"
                      disabled={isAnalyzing || !!pastedImage}
                    />
                    <Button 
                      type="button" 
                      onClick={handlePasteFromClipboard}
                      variant="outline"
                      className="px-6"
                      disabled={isAnalyzing}
                    >
                      PASTE
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste a product URL from your clipboard
                  </p>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/30" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">OR</span>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-3">
                  <Label htmlFor="product-image">Upload Product Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="product-image"
                      type="file"
                      accept="image/jpeg,image/jpg"
                      onChange={handleFileUpload}
                      className="flex-1"
                      disabled={isAnalyzing || !!productUrl}
                    />
                    <Button 
                      type="button" 
                      onClick={handlePasteFromClipboard}
                      variant="outline"
                      className="px-6"
                      disabled={isAnalyzing || !!productUrl}
                    >
                      PASTE IMAGE
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload or paste a JPG/JPEG image from your clipboard
                  </p>
                </div>

                {/* Preview Area */}
                {pastedImage && (
                  <div className="space-y-2">
                    <Label>Image Preview {imageFileName && `- ${imageFileName}`}</Label>
                    <div className="border border-border/30 rounded-lg p-4 bg-muted/20">
                      <img 
                        src={pastedImage} 
                        alt="Product" 
                        className="max-w-full h-auto max-h-64 mx-auto rounded"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPastedImage(null);
                        setImageFileName('');
                      }}
                      className="w-full"
                    >
                      Clear Image
                    </Button>
                  </div>
                )}

                {productUrl && !pastedImage && (
                  <div className="space-y-2">
                    <Label>Product URL</Label>
                    <div className="border border-border/30 rounded-lg p-4 bg-muted/20">
                      <p className="text-sm break-all">{productUrl}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setProductUrl('')}
                      className="w-full"
                    >
                      Clear URL
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 py-6">
                <div className="bg-luxury-gold/10 border border-luxury-gold/30 rounded-lg p-6">
                  <h3 className="font-semibold text-sm mb-6 text-luxury-gold">Extracted Product Details</h3>
                  
                  {/* Basic Information */}
                  <div className="space-y-4 mb-6">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Product Code / SKU</Label>
                        <Input
                          value={extractedData?.product_code || ''}
                          onChange={(e) => setExtractedData({
                            ...extractedData,
                            product_code: e.target.value
                          })}
                          placeholder="Enter product code"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-xs">Product Name *</Label>
                        <Input
                          value={extractedData?.product_name || ''}
                          onChange={(e) => setExtractedData({
                            ...extractedData,
                            product_name: e.target.value
                          })}
                          placeholder="Enter product name"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label className="text-xs">Product URL</Label>
                        <Input
                          value={extractedData?.url || ''}
                          onChange={(e) => setExtractedData({
                            ...extractedData,
                            url: e.target.value
                          })}
                          placeholder="https://example.com/product"
                          type="url"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Brand</Label>
                        <Input
                          value={extractedData?.brand || ''}
                          onChange={(e) => setExtractedData({
                            ...extractedData,
                            brand: e.target.value
                          })}
                          placeholder="Enter brand"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Supplier</Label>
                        <Input
                          value={extractedData?.supplier || ''}
                          onChange={(e) => setExtractedData({
                            ...extractedData,
                            supplier: e.target.value
                          })}
                          placeholder="Enter supplier"
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div className="space-y-4 mb-6">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dimensions (mm)</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Width</Label>
                        <Input
                          value={extractedData?.width || ''}
                          onChange={(e) => setExtractedData({
                            ...extractedData,
                            width: e.target.value
                          })}
                          placeholder="Width"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Length</Label>
                        <Input
                          value={extractedData?.length || ''}
                          onChange={(e) => setExtractedData({
                            ...extractedData,
                            length: e.target.value
                          })}
                          placeholder="Length"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Height</Label>
                        <Input
                          value={extractedData?.height || ''}
                          onChange={(e) => setExtractedData({
                            ...extractedData,
                            height: e.target.value
                          })}
                          placeholder="Height"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Depth</Label>
                        <Input
                          value={extractedData?.depth || ''}
                          onChange={(e) => setExtractedData({
                            ...extractedData,
                            depth: e.target.value
                          })}
                          placeholder="Depth"
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Material & Finish */}
                  <div className="space-y-4 mb-6">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Material & Finish</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Material</Label>
                        <Input
                          value={extractedData?.material || ''}
                          onChange={(e) => setExtractedData({
                            ...extractedData,
                            material: e.target.value
                          })}
                          placeholder="Enter material"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Color</Label>
                        <Input
                          value={extractedData?.color || ''}
                          onChange={(e) => setExtractedData({
                            ...extractedData,
                            color: e.target.value
                          })}
                          placeholder="Enter color"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Finish</Label>
                        <Input
                          value={extractedData?.finish || ''}
                          onChange={(e) => setExtractedData({
                            ...extractedData,
                            finish: e.target.value
                          })}
                          placeholder="Enter finish"
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Lead Time */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          value={extractedData?.qty || ''}
                          onChange={(e) => setExtractedData({
                            ...extractedData,
                            qty: e.target.value
                          })}
                          placeholder="Enter quantity"
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Lead Time</Label>
                        <Input
                          value={extractedData?.lead_time || ''}
                          onChange={(e) => setExtractedData({
                            ...extractedData,
                            lead_time: e.target.value
                          })}
                          placeholder="Enter lead time"
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNewProductDialog(false);
                  setShowPreview(false);
                  setExtractedData(null);
                }}
              >
                Cancel
              </Button>
              {!showPreview ? (
                <Button 
                  onClick={handleAnalyzeProduct}
                  disabled={(!productUrl && !pastedImage) || isAnalyzing}
                >
                  {isAnalyzing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isAnalyzing ? 'Analyzing...' : 'Import'}
                </Button>
              ) : (
                <Button onClick={handleSaveProduct}>
                  Save
                </Button>
              )}
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
}: { 
  section: any; 
  scheduleId: string;
  onOpenAddProductDialog: (sectionId: string) => void;
}) => {
  const { items, loading, createItem, updateItem, deleteItem } = useScheduleItems(section.id);

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
              <th className="px-4 py-3 text-left min-w-[140px]">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Product Details
                </div>
              </th>
              <th className="px-4 py-3 text-left min-w-[180px]">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Product Name / Brand
                </div>
              </th>
              <th className="px-4 py-3 text-left min-w-[100px]">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Dimensions
                </div>
              </th>
              <th className="px-4 py-3 text-left min-w-[120px]">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Finish / Material
                </div>
              </th>
              <th className="px-4 py-3 text-left w-[80px]">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  QTY
                </div>
              </th>
              <th className="px-4 py-3 text-left w-[100px]">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Price
                </div>
              </th>
              <th className="px-4 py-3 text-left min-w-[120px]">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Supplier
                </div>
              </th>
              <th className="px-4 py-3 text-left w-[100px]">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Status
                </div>
              </th>
              <th className="px-4 py-3 w-[100px]"></th>
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
                  {/* Product Details */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.product_name || 'Product'} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-6 bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10 rounded" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Input 
                            placeholder="Product Code" 
                            className="text-sm h-8 mb-1 flex-1"
                            defaultValue={item.product_code || ''}
                            onBlur={(e) => handleFieldUpdate(item.id, 'product_code', e.target.value)}
                          />
                          {item.url && (
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-shrink-0 p-1.5 hover:bg-accent rounded transition-colors"
                              title="View product page"
                            >
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </a>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase">Code</div>
                      </div>
                    </div>
                  </td>

                  {/* Product Name / Brand */}
                  <td className="px-4 py-3">
                    <Input 
                      placeholder="Product name" 
                      className="text-sm h-8 mb-1"
                      defaultValue={item.product_name || ''}
                      onBlur={(e) => handleFieldUpdate(item.id, 'product_name', e.target.value)}
                    />
                    <Input 
                      placeholder="Brand" 
                      className="text-xs h-7"
                      defaultValue={item.brand || ''}
                      onBlur={(e) => handleFieldUpdate(item.id, 'brand', e.target.value)}
                    />
                  </td>

                  {/* Dimensions */}
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Input 
                          placeholder="W" 
                          className="text-xs h-7 w-16"
                          defaultValue={item.width || ''}
                          onBlur={(e) => handleFieldUpdate(item.id, 'width', e.target.value)}
                        />
                        <span className="text-xs text-muted-foreground">×</span>
                        <Input 
                          placeholder="L" 
                          className="text-xs h-7 w-16"
                          defaultValue={item.length || ''}
                          onBlur={(e) => handleFieldUpdate(item.id, 'length', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Input 
                          placeholder="H" 
                          className="text-xs h-7 w-16"
                          defaultValue={item.height || ''}
                          onBlur={(e) => handleFieldUpdate(item.id, 'height', e.target.value)}
                        />
                        <span className="text-xs text-muted-foreground">×</span>
                        <Input 
                          placeholder="D" 
                          className="text-xs h-7 w-16"
                          defaultValue={item.depth || ''}
                          onBlur={(e) => handleFieldUpdate(item.id, 'depth', e.target.value)}
                        />
                      </div>
                      <div className="text-[10px] text-muted-foreground">W×L / H×D (mm)</div>
                    </div>
                  </td>

                  {/* Finish / Material */}
                  <td className="px-4 py-3">
                    <Input 
                      placeholder="Color" 
                      className="text-xs h-7 mb-1"
                      defaultValue={item.color || ''}
                      onBlur={(e) => handleFieldUpdate(item.id, 'color', e.target.value)}
                    />
                    <Input 
                      placeholder="Finish" 
                      className="text-xs h-7 mb-1"
                      defaultValue={item.finish || ''}
                      onBlur={(e) => handleFieldUpdate(item.id, 'finish', e.target.value)}
                    />
                    <div className="text-[10px] text-muted-foreground truncate" title={item.material || ''}>
                      {item.material || 'Material'}
                    </div>
                  </td>

                  {/* QTY */}
                  <td className="px-4 py-3">
                    <Input 
                      placeholder="0" 
                      type="number"
                      className="text-sm h-8 w-20"
                      defaultValue={item.qty || ''}
                      onBlur={(e) => handleFieldUpdate(item.id, 'qty', e.target.value)}
                    />
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3">
                    <Input 
                      placeholder="0.00" 
                      type="number"
                      step="0.01"
                      className="text-sm h-8"
                      defaultValue={item.price || ''}
                      onBlur={(e) => handleFieldUpdate(item.id, 'price', e.target.value)}
                    />
                  </td>

                  {/* Supplier */}
                  <td className="px-4 py-3">
                    <Input 
                      placeholder="Supplier" 
                      className="text-sm h-8"
                      defaultValue={item.supplier || ''}
                      onBlur={(e) => handleFieldUpdate(item.id, 'supplier', e.target.value)}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <Select 
                      defaultValue={item.status || 'Draft'}
                      onValueChange={(value) => handleFieldUpdate(item.id, 'status', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Ordered">Ordered</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
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
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
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
