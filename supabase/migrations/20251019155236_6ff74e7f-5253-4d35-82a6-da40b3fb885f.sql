-- Add reimbursement and change request tracking columns to bills table
ALTER TABLE public.bills
ADD COLUMN IF NOT EXISTS reimbursement_requested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS change_requested boolean DEFAULT false;