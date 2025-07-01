import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

export const TaskTableHeader = () => {
  return (
    <TableHeader>
      <TableRow className="bg-gray-50">
        <TableHead className="w-12">
          <Checkbox />
        </TableHead>
        <TableHead>Task ID</TableHead>
        <TableHead>Task Name</TableHead>
        <TableHead>Priority</TableHead>
        <TableHead>Assigned To</TableHead>
        <TableHead>Due Date</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Progress</TableHead>
        <TableHead>Action</TableHead>
      </TableRow>
    </TableHeader>
  );
};