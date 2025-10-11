import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const requestBody = await req.json().catch(() => ({}));
    console.log('Starting knowledge sync...', requestBody);

    // Check if this is a manual sync request
    if (requestBody.projectId && requestBody.companyId) {
      console.log('Manual sync requested for project:', requestBody.projectId);
      
      // Check if analyzing a single document
      if (requestBody.documentId) {
        console.log('Analyzing single document:', requestBody.documentId);
        
        // Create job for specific document only
        const { error: insertError } = await supabase
          .from('knowledge_sync_jobs')
          .insert({
            project_id: requestBody.projectId,
            company_id: requestBody.companyId,
            job_type: 'document',
            source_id: requestBody.documentId,
            status: 'pending'
          });
        
        if (insertError) throw insertError;
        
        // Update document status to 'processing'
        await supabase
          .from('project_documents')
          .update({ processing_status: 'processing' })
          .eq('id', requestBody.documentId);
        
        return new Response(JSON.stringify({ 
          message: 'Single document analysis started',
          jobs_created: 1 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Otherwise, create jobs for all documents with valid categories
      const { data: docs, error: docsError } = await supabase
        .from('project_documents')
        .select('id, processing_status, document_type')
        .eq('project_id', requestBody.projectId)
        .in('processing_status', ['pending', 'completed'])
        .in('document_type', ['architectural', 'structural']);

      if (docsError) throw docsError;

      if (!docs || docs.length === 0) {
        return new Response(JSON.stringify({ 
          message: 'No documents to process',
          processed: 0 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Create jobs for each document
      let jobsCreated = 0;
      for (const doc of docs) {
        const { error: insertError } = await supabase
          .from('knowledge_sync_jobs')
          .insert({
            project_id: requestBody.projectId,
            company_id: requestBody.companyId,
            job_type: 'document',
            source_id: doc.id,
            status: 'pending'
          });
        
        if (!insertError) {
          jobsCreated++;
          // Update document status to 'processing'
          await supabase
            .from('project_documents')
            .update({ processing_status: 'processing' })
            .eq('id', doc.id);
        }
      }

      console.log(`Created ${jobsCreated} sync jobs`);

      return new Response(JSON.stringify({ 
        message: 'Manual sync jobs created',
        jobs_created: jobsCreated 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Otherwise, process pending jobs from queue
    const { data: pendingJobs, error: jobsError } = await supabase
      .from('knowledge_sync_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5);

    if (jobsError) {
      console.error('Error fetching pending jobs:', jobsError);
      throw jobsError;
    }

    if (!pendingJobs || pendingJobs.length === 0) {
      console.log('No pending jobs found');
      return new Response(JSON.stringify({ 
        message: 'No pending jobs',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${pendingJobs.length} pending jobs`);
    const results = [];

    for (const job of pendingJobs) {
      console.log(`Processing job ${job.id} (type: ${job.job_type})`);
      
      // Mark as processing
      await supabase
        .from('knowledge_sync_jobs')
        .update({ 
          status: 'processing',
          started_at: new Date().toISOString()
        })
        .eq('id', job.id);

      try {
        const result = await processJob(supabase, job);
        results.push(result);
        
        // Mark as completed
        await supabase
          .from('knowledge_sync_jobs')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id);

        console.log(`Job ${job.id} completed successfully`);
        
        // Update document status to 'completed'
        if (job.job_type === 'document' && job.source_id) {
          await supabase
            .from('project_documents')
            .update({ processing_status: 'completed' })
            .eq('id', job.source_id);
        }
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        
        // Update retry count
        const newRetryCount = (job.retry_count || 0) + 1;
        const maxRetries = 3;
        
        await supabase
          .from('knowledge_sync_jobs')
          .update({ 
            status: newRetryCount >= maxRetries ? 'failed' : 'pending',
            retry_count: newRetryCount,
            error_message: error.message,
            completed_at: newRetryCount >= maxRetries ? new Date().toISOString() : null
          })
          .eq('id', job.id);
        
        // Update document status to 'failed'
        if (newRetryCount >= maxRetries && job.job_type === 'document' && job.source_id) {
          await supabase
            .from('project_documents')
            .update({ 
              processing_status: 'failed',
              error_message: error.message 
            })
            .eq('id', job.source_id);
        }
      }
    }

    return new Response(JSON.stringify({ 
      message: 'Jobs processed',
      processed: results.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-project-knowledge:', error);
    return new Response(
      JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processJob(supabase: any, job: any) {
  const startTime = Date.now();

  // Fetch source data based on job type
  let sourceData;
  let projectName = '';

  if (job.job_type === 'document') {
    const { data: doc, error: docError } = await supabase
      .from('project_documents')
      .select('*, projects(name, company_id)')
      .eq('id', job.source_id)
      .single();

    if (docError) throw docError;
    sourceData = doc;
    projectName = doc.projects?.name || 'Unknown Project';
  } else {
    throw new Error(`Unsupported job type: ${job.job_type}`);
  }

  // Call AI knowledge extractor
  const extractorUrl = `${SUPABASE_URL}/functions/v1/ai-knowledge-extractor`;
  const { data: { session } } = await supabase.auth.getSession();
  
  const extractorResponse = await fetch(extractorUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      type: job.job_type,
      projectId: job.project_id,
      projectName: projectName,
      data: {
        file_url: sourceData.file_url,
        content_type: sourceData.content_type,
        extracted_text: sourceData.extracted_text,
        name: sourceData.name,
        document_type: sourceData.document_type
      }
    })
  });

  if (!extractorResponse.ok) {
    const errorText = await extractorResponse.text();
    throw new Error(`AI extractor failed: ${errorText}`);
  }

  const extraction = await extractorResponse.json();

  // Upsert knowledge to skai_knowledge table
  const knowledgeEntry = {
    type: 'project',
    title: `${projectName} - ${extraction.category}`,
    content: extraction.knowledge_content,
    tags: [extraction.category, job.job_type],
    company_id: job.company_id,
    metadata: {
      project_id: job.project_id,
      project_name: projectName,
      sources: [job.job_type],
      document_count: job.job_type === 'document' ? 1 : 0,
      last_document_id: job.job_type === 'document' ? job.source_id : null,
      extraction_method: 'ai',
      ai_confidence: extraction.confidence,
      ...extraction.metadata
    },
    ai_confidence: extraction.confidence,
    processing_status: 'completed',
    last_processed_at: new Date().toISOString(),
    source_ids: [job.source_id]
  };

  // Check if knowledge entry exists for this project and category
  const { data: existing } = await supabase
    .from('skai_knowledge')
    .select('id, content, metadata, source_ids')
    .eq('company_id', job.company_id)
    .eq('type', 'project')
    .contains('metadata', { project_id: job.project_id })
    .contains('tags', [extraction.category])
    .single();

  if (existing) {
    // Merge with existing knowledge
    const mergedContent = `${existing.content}\n\n---\n\n## Latest Update\n\n${extraction.knowledge_content}`;
    const mergedMetadata = {
      ...existing.metadata,
      document_count: (existing.metadata?.document_count || 0) + 1,
      last_document_id: job.source_id,
      ai_confidence: Math.max(existing.metadata?.ai_confidence || 0, extraction.confidence),
      sources: [...new Set([...(existing.metadata?.sources || []), job.job_type])],
      key_insights: [...new Set([
        ...(existing.metadata?.key_insights || []),
        ...(extraction.metadata?.key_insights || [])
      ])].slice(0, 20)
    };
    const mergedSourceIds = [...new Set([...(existing.source_ids || []), job.source_id])];

    await supabase
      .from('skai_knowledge')
      .update({
        content: mergedContent,
        metadata: mergedMetadata,
        source_ids: mergedSourceIds,
        ai_confidence: mergedMetadata.ai_confidence,
        last_processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);

    console.log(`Updated existing knowledge entry ${existing.id}`);
  } else {
    // Create new knowledge entry
    await supabase
      .from('skai_knowledge')
      .insert(knowledgeEntry);

    console.log('Created new knowledge entry');
  }

  const processingTime = Date.now() - startTime;
  
  return {
    job_id: job.id,
    success: true,
    processing_time_ms: processingTime,
    confidence: extraction.confidence
  };
}
