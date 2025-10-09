import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { projectId, companyId, userId } = await req.json();
    console.log('Generating AI suggestions for:', { projectId, companyId, userId });

    // Fetch project data
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*, wbs_items(*), project_costs(*)')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    // Fetch tasks
    const { data: tasks } = await supabaseClient
      .from('wbs_items')
      .select('*')
      .eq('project_id', projectId);

    // Analyze project data
    const now = new Date();
    const suggestions: any[] = [];

    // Check for overdue tasks
    const overdueTasks = tasks?.filter(task => 
      task.due_date && new Date(task.due_date) < now && task.status !== 'completed'
    ) || [];

    if (overdueTasks.length > 0) {
      suggestions.push({
        user_id: userId,
        company_id: companyId,
        project_id: projectId,
        suggestion_type: 'alert',
        priority: overdueTasks.length > 5 ? 'critical' : 'high',
        category: 'tasks',
        title: `${overdueTasks.length} Overdue Tasks`,
        description: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} that need attention.`,
        action_items: [
          { action: 'Review overdue tasks', link: `/project-tasks?projectId=${projectId}` },
          { action: 'Reschedule or complete tasks', link: null }
        ],
        metadata: { task_count: overdueTasks.length, task_ids: overdueTasks.map(t => t.id) },
        expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours
      });
    }

    // Check for upcoming deadlines (next 7 days)
    const upcomingDeadlines = tasks?.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      const dueDate = new Date(task.due_date);
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return dueDate > now && dueDate <= sevenDaysFromNow;
    }) || [];

    if (upcomingDeadlines.length > 0) {
      suggestions.push({
        user_id: userId,
        company_id: companyId,
        project_id: projectId,
        suggestion_type: 'warning',
        priority: 'medium',
        category: 'timeline',
        title: `${upcomingDeadlines.length} Upcoming Deadlines`,
        description: `You have ${upcomingDeadlines.length} task${upcomingDeadlines.length > 1 ? 's' : ''} due within the next 7 days.`,
        action_items: [
          { action: 'Review upcoming tasks', link: `/project-tasks?projectId=${projectId}` }
        ],
        metadata: { task_count: upcomingDeadlines.length },
        expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    // Check budget if available
    const totalBudget = project.project_costs?.reduce((sum: number, cost: any) => 
      sum + (parseFloat(cost.budget_amount) || 0), 0) || 0;
    const totalActual = project.project_costs?.reduce((sum: number, cost: any) => 
      sum + (parseFloat(cost.actual_amount) || 0), 0) || 0;

    if (totalBudget > 0) {
      const budgetUtilization = (totalActual / totalBudget) * 100;
      
      if (budgetUtilization > 90) {
        suggestions.push({
          user_id: userId,
          company_id: companyId,
          project_id: projectId,
          suggestion_type: 'alert',
          priority: 'critical',
          category: 'budget',
          title: 'Budget Alert: Near Limit',
          description: `Project has used ${budgetUtilization.toFixed(1)}% of budget. Immediate review recommended.`,
          action_items: [
            { action: 'Review project costs', link: `/project-finance?projectId=${projectId}` },
            { action: 'Consider budget adjustment', link: null }
          ],
          metadata: { budget_utilization: budgetUtilization, total_budget: totalBudget, total_actual: totalActual }
        });
      } else if (budgetUtilization > 75) {
        suggestions.push({
          user_id: userId,
          company_id: companyId,
          project_id: projectId,
          suggestion_type: 'warning',
          priority: 'high',
          category: 'budget',
          title: 'Budget Warning',
          description: `Project has used ${budgetUtilization.toFixed(1)}% of budget. Monitor closely.`,
          action_items: [
            { action: 'Review spending', link: `/project-finance?projectId=${projectId}` }
          ],
          metadata: { budget_utilization: budgetUtilization }
        });
      }
    }

    // Use AI to generate additional insights
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (LOVABLE_API_KEY && tasks && tasks.length > 0) {
      try {
        const aiPrompt = `Analyze this project data and provide ONE actionable insight or suggestion:

Project: ${project.name}
Status: ${project.status}
Total Tasks: ${tasks.length}
Completed Tasks: ${tasks.filter((t: any) => t.status === 'completed').length}
In Progress: ${tasks.filter((t: any) => t.status === 'in_progress').length}
Overdue: ${overdueTasks.length}

Provide a brief, specific suggestion to improve project management. Focus on resource allocation, timeline optimization, or risk mitigation. Keep it under 100 words.`;

        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are a construction project management AI assistant. Provide brief, actionable insights.' },
              { role: 'user', content: aiPrompt }
            ],
            max_tokens: 150
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const insight = aiData.choices[0]?.message?.content;

          if (insight) {
            suggestions.push({
              user_id: userId,
              company_id: companyId,
              project_id: projectId,
              suggestion_type: 'insight',
              priority: 'medium',
              category: 'general',
              title: 'AI-Powered Insight',
              description: insight,
              action_items: [],
              metadata: { source: 'ai_analysis' },
              expires_at: new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 hours
            });
          }
        }
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
        // Continue without AI insights if it fails
      }
    }

    // Remove old suggestions for this project
    await supabaseClient
      .from('ai_suggestions')
      .delete()
      .eq('project_id', projectId)
      .eq('dismissed', false);

    // Insert new suggestions
    if (suggestions.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('ai_suggestions')
        .insert(suggestions);

      if (insertError) {
        console.error('Error inserting suggestions:', insertError);
        throw insertError;
      }
    }

    console.log(`Generated ${suggestions.length} suggestions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: suggestions.length,
        suggestions 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});