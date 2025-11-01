import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Trash2 } from 'lucide-react';

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

interface OwnersDetailsTabProps {
  owners: Owner[];
  onAddOwner: () => void;
  onEditOwner: (owner: Owner) => void;
  onDeleteOwner: (ownerId: string) => void;
}

export const OwnersDetailsTab = ({ owners, onAddOwner, onEditOwner, onDeleteOwner }: OwnersDetailsTabProps) => {
  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button 
          className="flex items-center gap-2"
          onClick={onAddOwner}
        >
          <UserPlus className="h-4 w-4" />
          Add Owner
        </Button>
      </div>

      {/* Owners Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-1">Owners</h2>
        <p className="text-sm italic text-gray-600 border-b border-gray-300 pb-3">
          If the Owner is a company, a Director's Guarantee must be signed before this Contract is signed. See Deed of Guarantee and Indemnity
        </p>
      </div>

      {/* Owners List */}
      {owners.length === 0 ? (
        <div className="text-center py-12 backdrop-blur-xl bg-white/80 rounded-2xl border border-border/30">
          <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold mb-2">No Owners Added</h3>
          <p className="text-sm text-muted-foreground mb-4">Add project owners to track contact details</p>
          <Button onClick={onAddOwner}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add First Owner
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {owners.map((owner, index) => (
            <div key={owner.id} className="backdrop-blur-xl bg-white/80 border border-border/30 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider">Owner {index + 1}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => onEditOwner(owner)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => onDeleteOwner(owner.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Name</div>
                  <div className="font-medium">{owner.name}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Mobile</div>
                  <div>{owner.mobile || '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Email</div>
                  <div className="truncate">{owner.email || '-'}</div>
                </div>
                <div className="md:col-span-3">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Address</div>
                  <div>{owner.address}, {owner.suburb} {owner.state} {owner.postcode}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">ABN</div>
                  <div>{owner.abn || '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">ACN</div>
                  <div>{owner.acn || '-'}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Phone</div>
                  <div className="flex gap-3">
                    {owner.work_phone && <span>W: {owner.work_phone}</span>}
                    {owner.home_phone && <span>H: {owner.home_phone}</span>}
                    {!owner.work_phone && !owner.home_phone && '-'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
