import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FileText, Download, Edit, X, Save, Check, ChevronsUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/useProjects";

interface ExpenseRecord {
  id: string;
  date: string;
  vendor: string;
  project: string;
  description: string;
  amount: number;
  method: string;
  status: "paid" | "pending";
  account_code?: string;
  account_name?: string;
  invoiceNumber?: string;
  notes?: string;
  attachments?: string[];
}

interface ExpenseDetailsDrawerProps {
  record: ExpenseRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export const ExpenseDetailsDrawer = ({ record, open, onOpenChange, onUpdate }: ExpenseDetailsDrawerProps) => {
  const { toast } = useToast();
  const { getProjects } = useProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState<ExpenseRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [projectComboboxOpen, setProjectComboboxOpen] = useState(false);
  const [accounts, setAccounts] = useState<Array<{ account_code: string; account_name: string }>>([]);
  const [accountComboboxOpen, setAccountComboboxOpen] = useState(false);

  // Fetch projects and accounts when drawer opens
  useEffect(() => {
    if (open) {
      fetchProjects();
      fetchAccounts();
    }
  }, [open]);

  const fetchProjects = async () => {
    try {
      const projectsData = await getProjects();
      setProjects(projectsData.map(p => ({ id: p.id, name: p.name })));
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: companyMember } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (!companyMember) return;

      const { data } = await supabase
        .from('expense_accounts')
        .select('account_code, account_name')
        .eq('company_id', companyMember.company_id)
        .eq('is_active', true)
        .order('account_code');

      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  if (!record) return null;

  const handleEdit = () => {
    setEditedRecord({ ...record });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedRecord(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedRecord) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('expense_transactions')
        .update({
          transaction_date: editedRecord.date,
          vendor_supplier: editedRecord.vendor,
          project_name: editedRecord.project,
          description: editedRecord.description,
          amount: editedRecord.amount,
          payment_method: editedRecord.method,
          account_code: editedRecord.account_code || null,
          status: editedRecord.status,
          invoice_number: editedRecord.invoiceNumber || null,
          notes: editedRecord.notes || null,
        })
        .eq('id', editedRecord.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense transaction updated successfully",
      });

      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentRecord = isEditing && editedRecord ? editedRecord : record;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Expense Details</SheetTitle>
          <SheetDescription>
            {isEditing ? "Edit expense transaction details" : "View and manage expense transaction details"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Badge and Action Buttons */}
          <div className="flex items-center justify-between">
            {isEditing ? (
              <Select
                value={currentRecord.status}
                onValueChange={(value: "paid" | "pending") => 
                  setEditedRecord(prev => prev ? { ...prev, status: value } : null)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">✓ Paid</SelectItem>
                  <SelectItem value="pending">◆ Pending</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge
                variant={currentRecord.status === "paid" ? "default" : "secondary"}
                className={
                  currentRecord.status === "paid"
                    ? "bg-green-500/10 text-green-600"
                    : "bg-orange-500/10 text-orange-600"
                }
              >
                {currentRecord.status === "paid" ? "✓ Paid" : "◆ Pending"}
              </Badge>
            )}
            
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          <Separator />

          {/* Main Details */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Date</Label>
              {isEditing ? (
                <div className="mt-1">
                  <DatePicker
                    date={new Date(currentRecord.date)}
                    onDateChange={(date) => 
                      setEditedRecord(prev => prev ? { ...prev, date: date?.toISOString().split('T')[0] || prev.date } : null)
                    }
                    className="w-full h-10"
                    formatString="d MMMM yyyy"
                  />
                </div>
              ) : (
                <p className="text-base mt-1">
                  {new Date(currentRecord.date).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Vendor / Supplier</Label>
              {isEditing ? (
                <Input
                  value={currentRecord.vendor}
                  onChange={(e) => setEditedRecord(prev => prev ? { ...prev, vendor: e.target.value } : null)}
                  className="mt-1"
                />
              ) : (
                <p className="text-base font-medium mt-1">{currentRecord.vendor}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Project</Label>
              {isEditing ? (
                <div className="relative mt-1">
                  <Input
                    value={currentRecord.project}
                    onChange={(e) => setEditedRecord(prev => prev ? { ...prev, project: e.target.value } : null)}
                    placeholder="Type or select project..."
                    className="pr-10"
                  />
                  <Popover open={projectComboboxOpen} onOpenChange={setProjectComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        type="button"
                      >
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover" align="start">
                      <Command className="bg-popover">
                        <CommandInput placeholder="Search projects..." />
                        <CommandList>
                          <CommandEmpty>No project found. Type to create a custom entry.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="—"
                              onSelect={() => {
                                setEditedRecord(prev => prev ? { ...prev, project: '—' } : null);
                                setProjectComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  currentRecord.project === '—' ? "opacity-100" : "opacity-0"
                                )}
                              />
                              None
                            </CommandItem>
                            {projects.map((project) => (
                              <CommandItem
                                key={project.id}
                                value={project.name}
                                onSelect={() => {
                                  setEditedRecord(prev => prev ? { ...prev, project: project.name } : null);
                                  setProjectComboboxOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    currentRecord.project === project.name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {project.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                <p className="text-base mt-1">{currentRecord.project}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Description</Label>
              {isEditing ? (
                <Input
                  value={currentRecord.description}
                  onChange={(e) => setEditedRecord(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="mt-1"
                />
              ) : (
                <p className="text-base mt-1">{currentRecord.description}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={currentRecord.amount}
                  onChange={(e) => setEditedRecord(prev => prev ? { ...prev, amount: parseFloat(e.target.value) || 0 } : null)}
                  className="mt-1"
                />
              ) : (
                <p className="text-2xl font-bold mt-1">
                  ${currentRecord.amount.toLocaleString("en-AU", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Payment Method</Label>
              {isEditing ? (
                <Select
                  value={currentRecord.method}
                  onValueChange={(value) => setEditedRecord(prev => prev ? { ...prev, method: value } : null)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fast Transfer">Fast Transfer</SelectItem>
                    <SelectItem value="Direct Credit">Direct Credit</SelectItem>
                    <SelectItem value="NetBank">NetBank</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-base mt-1">{currentRecord.method}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Account</Label>
              {isEditing ? (
                <Popover open={accountComboboxOpen} onOpenChange={setAccountComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between mt-1"
                    >
                      {currentRecord.account_code ? (
                        <div className="flex flex-col items-start">
                          <span className="font-mono text-xs">{currentRecord.account_code}</span>
                          <span className="text-sm">{currentRecord.account_name}</span>
                        </div>
                      ) : (
                        <span>Select account...</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0 bg-popover">
                    <Command className="bg-popover">
                      <CommandInput placeholder="Search accounts..." />
                      <CommandList>
                        <CommandEmpty>No account found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="none"
                            onSelect={() => {
                              setEditedRecord(prev => prev ? { ...prev, account_code: undefined, account_name: undefined } : null);
                              setAccountComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !currentRecord.account_code ? "opacity-100" : "opacity-0"
                              )}
                            />
                            None
                          </CommandItem>
                          {accounts.map((account) => (
                            <CommandItem
                              key={account.account_code}
                              value={`${account.account_code} ${account.account_name}`}
                              onSelect={() => {
                                setEditedRecord(prev => prev ? { 
                                  ...prev, 
                                  account_code: account.account_code,
                                  account_name: account.account_name
                                } : null);
                                setAccountComboboxOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  currentRecord.account_code === account.account_code ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-mono text-xs text-muted-foreground">{account.account_code}</span>
                                <span>{account.account_name}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : (
                currentRecord.account_code ? (
                  <div className="mt-1">
                    <p className="font-mono text-xs text-muted-foreground">{currentRecord.account_code}</p>
                    <p className="text-base">{currentRecord.account_name}</p>
                  </div>
                ) : (
                  <p className="text-base mt-1 text-muted-foreground">—</p>
                )
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Invoice Number</Label>
              {isEditing ? (
                <Input
                  value={currentRecord.invoiceNumber || ''}
                  onChange={(e) => setEditedRecord(prev => prev ? { ...prev, invoiceNumber: e.target.value } : null)}
                  className="mt-1"
                  placeholder="Optional"
                />
              ) : (
                currentRecord.invoiceNumber && (
                  <p className="text-base mt-1">{currentRecord.invoiceNumber}</p>
                )
              )}
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
            {isEditing ? (
              <Textarea
                value={currentRecord.notes || ''}
                onChange={(e) => setEditedRecord(prev => prev ? { ...prev, notes: e.target.value } : null)}
                className="mt-2"
                placeholder="Add notes..."
                rows={3}
              />
            ) : (
              currentRecord.notes && (
                <p className="text-sm mt-2 p-3 bg-muted/50 rounded-md">{currentRecord.notes}</p>
              )
            )}
          </div>

          {!isEditing && (
            <>
              {/* Attachments */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-3 block">
                  Attachments
                </label>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Invoice.pdf
                    <Download className="h-4 w-4 ml-auto" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  View Invoice
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
