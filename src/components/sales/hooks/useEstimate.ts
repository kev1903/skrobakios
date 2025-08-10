import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trade } from './useTrades';
import type { DrawingFile } from './useMultiplePDFUpload';

export interface EstimateData {
  id?: string;
  estimate_name: string;
  estimate_number: string;
  project_type?: string;
  status: string;
  estimate_date: string;
  client_name?: string;
  client_email?: string;
  notes?: string;
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
}

export const useEstimate = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generateEstimateNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = Date.now().toString().slice(-4);
    return `EST-${year}${month}${day}-${time}`;
  };

  const saveEstimate = async (
    estimateData: Partial<EstimateData>,
    trades: Trade[],
    drawings: DrawingFile[] = []
  ) => {
    setIsSaving(true);
    try {
      // Calculate totals from trades
      const subtotal = trades.reduce((total, trade) => 
        total + trade.measurements.reduce((tradeTotal, measurement) => 
          tradeTotal + measurement.amount, 0), 0);
      
      const taxAmount = subtotal * 0.1; // 10% tax
      const totalAmount = subtotal + taxAmount;

      // Get current user's company
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: companyId, error: companyError } = await supabase
        .rpc('get_user_current_company_id');
      
      if (companyError || !companyId) {
        throw companyError ?? new Error('No active company found for current user');
      }

      // Prepare estimate data
      const estimate = {
        estimate_name: estimateData.estimate_name || 'Untitled Estimate',
        estimate_number: estimateData.estimate_number || generateEstimateNumber(),
        status: estimateData.status || 'draft',
        estimate_date: estimateData.estimate_date || new Date().toISOString().split('T')[0],
        notes: estimateData.notes || estimateData.project_type || '',
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        client_name: estimateData.client_name,
        client_email: estimateData.client_email,
        company_id: companyId,
        created_by: userData.user.id,
        last_modified_by: userData.user.id
      };

      // Save estimate
      const { data: savedEstimate, error: estimateError } = await supabase
        .from('estimates')
        .insert(estimate)
        .select()
        .single();

      if (estimateError) throw estimateError;

      // Save line items
      const lineItems = [];
      let sortOrder = 1;

      for (const trade of trades) {
        for (const measurement of trade.measurements) {
          lineItems.push({
            estimate_id: savedEstimate.id,
            item_description: `${trade.name}: ${measurement.description}`,
            quantity: measurement.quantity,
            unit_price: measurement.rate,
            sort_order: sortOrder++
          });
        }
      }

      if (lineItems.length > 0) {
        const { error: lineItemsError } = await supabase
          .from('estimate_line_items')
          .insert(lineItems);

        if (lineItemsError) throw lineItemsError;
      }
      // Persist drawings: upload files and record metadata
      if (drawings && drawings.length > 0) {
        for (const d of drawings) {
          let filePath = d.storagePath;

          if (d.file) {
            const safeName = encodeURIComponent(d.name);
            filePath = `estimates/${savedEstimate.id}/${safeName}`;
            const { error: uploadError } = await supabase
              .storage
              .from('estimate-drawings')
              .upload(filePath, d.file, { upsert: true, contentType: 'application/pdf' });
            if (uploadError && uploadError.message.indexOf('already exists') === -1) {
              throw uploadError;
            }
          }

          if (filePath) {
            const { error: metaErr } = await supabase
              .from('estimate_drawings')
              .insert({
                estimate_id: savedEstimate.id,
                name: d.name,
                file_path: filePath,
                pages: d.pages ?? 1,
                created_by: userData.user.id,
                drawing_type: d.type || null,
              });
            if (metaErr) throw metaErr;
          }
        }
      }

      return savedEstimate;
    } catch (error) {
      console.error('Error saving estimate:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const updateEstimate = async (
    estimateId: string,
    estimateData: Partial<EstimateData>,
    trades: Trade[],
    drawings: DrawingFile[] = []
  ) => {
    setIsSaving(true);
    try {
      // Calculate totals from trades
      const subtotal = trades.reduce((total, trade) => 
        total + trade.measurements.reduce((tradeTotal, measurement) => 
          tradeTotal + measurement.amount, 0), 0);
      
      const taxAmount = subtotal * 0.1; // 10% tax
      const totalAmount = subtotal + taxAmount;

      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Update estimate
      const estimate = {
        estimate_name: estimateData.estimate_name,
        notes: estimateData.notes || estimateData.project_type || '',
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        client_name: estimateData.client_name,
        client_email: estimateData.client_email,
        last_modified_by: userData.user.id,
        updated_at: new Date().toISOString()
      };

      const { data: updatedEstimate, error: estimateError } = await supabase
        .from('estimates')
        .update(estimate)
        .eq('id', estimateId)
        .select()
        .single();

      if (estimateError) throw estimateError;

      // Delete existing line items
      const { error: deleteError } = await supabase
        .from('estimate_line_items')
        .delete()
        .eq('estimate_id', estimateId);

      if (deleteError) throw deleteError;

      // Save new line items
      const lineItems = [];
      let sortOrder = 1;

      for (const trade of trades) {
        for (const measurement of trade.measurements) {
          lineItems.push({
            estimate_id: estimateId,
            item_description: `${trade.name}: ${measurement.description}`,
            quantity: measurement.quantity,
            unit_price: measurement.rate,
            sort_order: sortOrder++
          });
        }
      }

      if (lineItems.length > 0) {
        const { error: lineItemsError } = await supabase
          .from('estimate_line_items')
          .insert(lineItems);

        if (lineItemsError) throw lineItemsError;
      }
      // Sync drawings metadata/files
      // First, delete existing metadata to reflect removals
      await supabase.from('estimate_drawings').delete().eq('estimate_id', estimateId);

      if (drawings && drawings.length > 0) {
        for (const d of drawings) {
          let filePath = d.storagePath;
          if (d.file) {
            const safeName = encodeURIComponent(d.name);
            filePath = `estimates/${estimateId}/${safeName}`;
            const { error: uploadError } = await supabase
              .storage
              .from('estimate-drawings')
              .upload(filePath, d.file, { upsert: true, contentType: 'application/pdf' });
            if (uploadError && uploadError.message.indexOf('already exists') === -1) {
              throw uploadError;
            }
          }
          if (filePath) {
            const { error: metaErr } = await supabase
              .from('estimate_drawings')
              .insert({
                estimate_id: estimateId,
                name: d.name,
                file_path: filePath,
                pages: d.pages ?? 1,
                created_by: userData.user.id,
                drawing_type: d.type || null,
              });
            if (metaErr) throw metaErr;
          }
        }
      }

      return updatedEstimate;
    } catch (error) {
      console.error('Error updating estimate:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const loadEstimate = async (estimateId: string) => {
    setIsLoading(true);
    try {
      // Load estimate
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (estimateError) throw estimateError;

      // Load line items
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('estimate_line_items')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('sort_order');

      if (lineItemsError) throw lineItemsError;

      // Convert line items back to trades structure
      const tradesMap = new Map<string, Trade>();
      
      lineItems.forEach((item, index) => {
        const [tradeName, description] = item.item_description.split(': ');
        
        if (!tradesMap.has(tradeName)) {
          tradesMap.set(tradeName, {
            id: tradeName.toLowerCase().replace(/\s+/g, '-'),
            name: tradeName,
            measurements: []
          });
        }

        const trade = tradesMap.get(tradeName)!;
        trade.measurements.push({
          id: `${index + 1}`,
          type: 'M2', // Default type, could be enhanced
          description: description || item.item_description,
          quantity: Number(item.quantity),
          rate: Number(item.unit_price),
          amount: Number(item.line_total)
        });
      });

      const trades = Array.from(tradesMap.values());

      // Load drawings metadata and build accessible URLs
      const { data: drawingRows, error: drawingsError } = await supabase
        .from('estimate_drawings')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('uploaded_at', { ascending: true });

      if (drawingsError) throw drawingsError;

      const drawings: DrawingFile[] = [];
      if (drawingRows && drawingRows.length > 0) {
        for (const row of drawingRows) {
          let url = '';
          // Try to generate a signed URL (works even if bucket is private)
          const { data: signed, error: signedErr } = await supabase
            .storage
            .from('estimate-drawings')
            .createSignedUrl(row.file_path, 60 * 60);
          if (!signedErr && signed?.signedUrl) {
            url = signed.signedUrl;
          } else {
            // Fallback to public URL if bucket is public
            const { data: pub } = supabase.storage
              .from('estimate-drawings')
              .getPublicUrl(row.file_path);
            url = pub.publicUrl;
          }

          drawings.push({
            id: row.id,
            name: row.name,
            url,
            pages: row.pages ?? 1,
            uploadedAt: new Date(row.uploaded_at),
            storagePath: row.file_path,
            type: row.drawing_type || undefined,
          });
        }
      }

      return {
        estimate,
        trades,
        drawings,
      };
    } catch (error) {
      console.error('Error loading estimate:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveEstimate,
    updateEstimate,
    loadEstimate,
    isSaving,
    isLoading,
    generateEstimateNumber
  };
};