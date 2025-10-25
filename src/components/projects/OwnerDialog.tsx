import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Owner {
  id?: string;
  name: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  abn: string;
  acn: string;
  work_phone: string;
  home_phone: string;
  mobile: string;
  email: string;
}

interface OwnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner: Owner | null;
  onOwnerChange: (owner: Owner) => void;
  onSave: () => void;
}

const australianStates = [
  'Victoria',
  'New South Wales',
  'Queensland',
  'Western Australia',
  'South Australia',
  'Tasmania',
  'Australian Capital Territory',
  'Northern Territory'
];

export const OwnerDialog = ({ open, onOpenChange, owner, onOwnerChange, onSave }: OwnerDialogProps) => {
  if (!owner) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{owner.id ? 'Edit Owner' : 'Add New Owner'}</DialogTitle>
          <DialogDescription>
            Enter the owner's details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="col-span-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={owner.name}
              onChange={(e) => onOwnerChange({...owner, name: e.target.value})}
              placeholder="John Smith"
              className="mt-1"
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={owner.address}
              onChange={(e) => onOwnerChange({...owner, address: e.target.value})}
              placeholder="123 Main Street"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="suburb">Suburb *</Label>
            <Input
              id="suburb"
              value={owner.suburb}
              onChange={(e) => onOwnerChange({...owner, suburb: e.target.value})}
              placeholder="Suburb"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="state">State *</Label>
            <Select value={owner.state} onValueChange={(value) => onOwnerChange({...owner, state: value})}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {australianStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="postcode">Postcode *</Label>
            <Input
              id="postcode"
              value={owner.postcode}
              onChange={(e) => onOwnerChange({...owner, postcode: e.target.value})}
              placeholder="3000"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="mobile">Mobile *</Label>
            <Input
              id="mobile"
              value={owner.mobile}
              onChange={(e) => onOwnerChange({...owner, mobile: e.target.value})}
              placeholder="04XX XXX XXX"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={owner.email}
              onChange={(e) => onOwnerChange({...owner, email: e.target.value})}
              placeholder="owner@example.com"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="work_phone">Work Phone</Label>
            <Input
              id="work_phone"
              value={owner.work_phone}
              onChange={(e) => onOwnerChange({...owner, work_phone: e.target.value})}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="home_phone">Home Phone</Label>
            <Input
              id="home_phone"
              value={owner.home_phone}
              onChange={(e) => onOwnerChange({...owner, home_phone: e.target.value})}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="abn">ABN</Label>
            <Input
              id="abn"
              value={owner.abn}
              onChange={(e) => onOwnerChange({...owner, abn: e.target.value})}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="acn">ACN</Label>
            <Input
              id="acn"
              value={owner.acn}
              onChange={(e) => onOwnerChange({...owner, acn: e.target.value})}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {owner.id ? 'Update Owner' : 'Add Owner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
