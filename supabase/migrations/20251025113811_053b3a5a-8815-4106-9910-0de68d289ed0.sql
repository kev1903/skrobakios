
-- Fix the calculate_invoice_total function with proper search_path
CREATE OR REPLACE FUNCTION public.calculate_invoice_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.invoices 
  SET 
    subtotal = (SELECT COALESCE(SUM(amount), 0) FROM public.invoice_items WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)),
    total = subtotal + tax,
    updated_at = now()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;
