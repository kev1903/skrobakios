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
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Owners Added</h3>
          <p className="text-gray-500 mb-4">Add project owners to track contact details and information</p>
          <Button onClick={onAddOwner}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add First Owner
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {owners.map((owner, index) => (
            <div key={owner.id} className="border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-black">Owner {index + 1}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditOwner(owner)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteOwner(owner.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
                <div>
                  <div className="font-bold text-gray-700 uppercase text-xs mb-1">NAME</div>
                  <div className="text-black font-medium">{owner.name}</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 uppercase text-xs mb-1">MOBILE</div>
                  <div className="text-black">{owner.mobile || '-'}</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 uppercase text-xs mb-1">ADDRESS</div>
                  <div className="text-black">{owner.address}</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 uppercase text-xs mb-1">EMAIL</div>
                  <div className="text-black break-all">{owner.email || '-'}</div>
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-4">
                  <div>
                    <div className="font-bold text-gray-700 uppercase text-xs mb-1">SUBURB</div>
                    <div className="text-black">{owner.suburb}</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-700 uppercase text-xs mb-1">STATE</div>
                    <div className="text-black">{owner.state}</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-700 uppercase text-xs mb-1">POSTCODE</div>
                    <div className="text-black">{owner.postcode}</div>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 uppercase text-xs mb-1">ABN</div>
                  <div className="text-black">{owner.abn || '-'}</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 uppercase text-xs mb-1">ACN</div>
                  <div className="text-black">{owner.acn || '-'}</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 uppercase text-xs mb-1">WORK</div>
                  <div className="text-black">{owner.work_phone || '-'}</div>
                </div>
                <div>
                  <div className="font-bold text-gray-700 uppercase text-xs mb-1">HOME</div>
                  <div className="text-black">{owner.home_phone || '-'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
