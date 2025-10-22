import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "npm:resend@2.0.0";
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { TaskAssignmentEmail } from './_templates/task-assignment.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaskAssignmentRequest {
  taskId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Task assignment email function called");

    // Get task ID from request
    const { taskId }: TaskAssignmentRequest = await req.json();

    if (!taskId) {
      console.error("Task ID is missing");
      return new Response(
        JSON.stringify({ error: "Task ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Fetching task details for task ID: ${taskId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch task details
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*, projects(name, project_id)")
      .eq("id", taskId)
      .single();

    if (taskError || !task) {
      console.error("Error fetching task:", taskError);
      return new Response(
        JSON.stringify({ error: "Task not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Task found: ${task.task_name}`);

    // Check if task is assigned to a user
    if (!task.assigned_to_user_id) {
      console.log("Task is not assigned to any user");
      return new Response(
        JSON.stringify({ message: "Task is not assigned to any user" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Fetching assignee profile for user ID: ${task.assigned_to_user_id}`);

    // Fetch assignee's email from profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("user_id", task.assigned_to_user_id)
      .single();

    if (profileError || !profile || !profile.email) {
      console.error("Error fetching profile or email not found:", profileError);
      return new Response(
        JSON.stringify({ error: "Assignee email not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending email to: ${profile.email}`);

    // Format task details for email
    const assigneeName = profile.first_name 
      ? `${profile.first_name} ${profile.last_name || ''}`.trim() 
      : profile.email;
    
    const projectName = task.projects?.name || "Unknown Project";
    const projectId = task.projects?.project_id || "";
    const dueDate = task.due_date 
      ? new Date(task.due_date).toLocaleDateString("en-US", { 
          year: "numeric", 
          month: "long", 
          day: "numeric" 
        })
      : "Not set";
    
    const priority = task.priority || "Normal";
    const status = task.status || "Not Started";
    
    // Generate task link
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://app.skrobaki.com";
    const taskLink = `${frontendUrl}/?page=task-edit&taskId=${taskId}`;

    // Render the React Email template
    const emailHtml = await renderAsync(
      React.createElement(TaskAssignmentEmail, {
        assigneeName,
        taskName: task.task_name,
        projectName,
        projectCode: projectId,
        dueDate,
        priority,
        status,
        taskLink,
        description: task.description || undefined,
        estimatedHours: task.estimated_hours || undefined,
      })
    );

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "SkAi | SKROBAKI <skai@skrobaki.com>",
      to: [profile.email],
      subject: `New Task Assigned: ${task.task_name}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Task assignment email sent successfully",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-task-assignment-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
