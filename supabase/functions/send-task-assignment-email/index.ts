import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "npm:resend@2.0.0";

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

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "SkAi <noreply@skrobaki.com>",
      to: [profile.email],
      subject: `New Task Assigned: ${task.task_name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .content {
                background: #ffffff;
                border: 1px solid #e5e7eb;
                border-top: none;
                padding: 30px;
                border-radius: 0 0 8px 8px;
              }
              .task-details {
                background: #f9fafb;
                border-left: 4px solid #667eea;
                padding: 20px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .detail-row:last-child {
                border-bottom: none;
              }
              .detail-label {
                font-weight: 600;
                color: #6b7280;
              }
              .detail-value {
                color: #111827;
              }
              .priority-high {
                color: #dc2626;
                font-weight: 600;
              }
              .priority-normal {
                color: #f59e0b;
                font-weight: 600;
              }
              .priority-low {
                color: #10b981;
                font-weight: 600;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: 600;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🎯 New Task Assigned</h1>
            </div>
            <div class="content">
              <p>Hi ${assigneeName},</p>
              <p>You have been assigned a new task by SkAi:</p>
              
              <div class="task-details">
                <h2 style="margin-top: 0; color: #111827; font-size: 20px;">${task.task_name}</h2>
                
                ${task.description ? `<p style="color: #6b7280; margin: 10px 0;">${task.description}</p>` : ''}
                
                <div class="detail-row">
                  <span class="detail-label">Project:</span>
                  <span class="detail-value">${projectId ? `${projectId} - ` : ''}${projectName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Due Date:</span>
                  <span class="detail-value">${dueDate}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Priority:</span>
                  <span class="detail-value priority-${priority.toLowerCase()}">${priority}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">${status}</span>
                </div>
                
                ${task.estimated_hours ? `
                <div class="detail-row">
                  <span class="detail-label">Estimated Hours:</span>
                  <span class="detail-value">${task.estimated_hours}h</span>
                </div>
                ` : ''}
              </div>
              
              <p style="margin-top: 20px;">
                Please review this task and update its status as you make progress.
              </p>
              
              <div class="footer">
                <p>This is an automated message from SkAi Task Management System</p>
                <p style="font-size: 12px; color: #9ca3af;">
                  If you believe this task was assigned to you in error, please contact your project manager.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
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
