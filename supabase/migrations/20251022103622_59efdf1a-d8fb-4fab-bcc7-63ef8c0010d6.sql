-- Fix RLS policies for tables with correct column names
-- This resolves the "Failed to load digital objects" error for all users

-- =====================================================
-- 1. BILL_APPROVALS - Allow users to manage approvals for bills they can access
-- =====================================================
CREATE POLICY "Users can view bill approvals for their company bills"
ON public.bill_approvals
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bills b
    INNER JOIN public.projects p ON b.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE b.id = bill_approvals.bill_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage bill approvals for their company bills"
ON public.bill_approvals
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.bills b
    INNER JOIN public.projects p ON b.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE b.id = bill_approvals.bill_id
      AND cm.user_id = auth.uid()
  )
);

-- =====================================================
-- 2. BILL_ITEMS - Allow users to access bill items for their company bills
-- =====================================================
CREATE POLICY "Users can view bill items for their company bills"
ON public.bill_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bills b
    INNER JOIN public.projects p ON b.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE b.id = bill_items.bill_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage bill items for their company bills"
ON public.bill_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.bills b
    INNER JOIN public.projects p ON b.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE b.id = bill_items.bill_id
      AND cm.user_id = auth.uid()
  )
);

-- =====================================================
-- 3. BILL_PAYMENTS - Allow users to manage payments for their company bills
-- =====================================================
CREATE POLICY "Users can view bill payments for their company bills"
ON public.bill_payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bills b
    INNER JOIN public.projects p ON b.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE b.id = bill_payments.bill_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage bill payments for their company bills"
ON public.bill_payments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.bills b
    INNER JOIN public.projects p ON b.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE b.id = bill_payments.bill_id
      AND cm.user_id = auth.uid()
  )
);

-- =====================================================
-- 4. SUBTASKS - Allow users to access subtasks for their company tasks
-- Note: subtasks uses parent_task_id, not task_id
-- =====================================================
CREATE POLICY "Users can view subtasks for their company tasks"
ON public.subtasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    INNER JOIN public.projects p ON t.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE t.id = subtasks.parent_task_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage subtasks for their company tasks"
ON public.subtasks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    INNER JOIN public.projects p ON t.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE t.id = subtasks.parent_task_id
      AND cm.user_id = auth.uid()
  )
);

-- =====================================================
-- 5. TASK_ACTIVITY_LOG - Allow users to view/create activity for their company tasks
-- =====================================================
CREATE POLICY "Users can view task activity for their company tasks"
ON public.task_activity_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    INNER JOIN public.projects p ON t.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE t.id = task_activity_log.task_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create task activity for their company tasks"
ON public.task_activity_log
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t
    INNER JOIN public.projects p ON t.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE t.id = task_activity_log.task_id
      AND cm.user_id = auth.uid()
  )
);

-- =====================================================
-- 6. TASK_ATTACHMENTS - Allow users to manage attachments for their company tasks
-- =====================================================
CREATE POLICY "Users can view task attachments for their company tasks"
ON public.task_attachments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    INNER JOIN public.projects p ON t.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE t.id = task_attachments.task_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage task attachments for their company tasks"
ON public.task_attachments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    INNER JOIN public.projects p ON t.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE t.id = task_attachments.task_id
      AND cm.user_id = auth.uid()
  )
);

-- =====================================================
-- 7. TASK_COMMENTS - Allow users to manage comments on their company tasks
-- Note: task_comments doesn't have user_id column
-- =====================================================
CREATE POLICY "Users can view comments on their company tasks"
ON public.task_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    INNER JOIN public.projects p ON t.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE t.id = task_comments.task_id
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage comments on their company tasks"
ON public.task_comments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    INNER JOIN public.projects p ON t.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE t.id = task_comments.task_id
      AND cm.user_id = auth.uid()
  )
);

-- =====================================================
-- 8. TASK_DEPENDENCIES - Allow users to manage task dependencies for their company tasks
-- Note: task_dependencies uses predecessor_task_id and successor_task_id
-- =====================================================
CREATE POLICY "Users can view task dependencies for their company tasks"
ON public.task_dependencies
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    INNER JOIN public.projects p ON t.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE (t.id = task_dependencies.predecessor_task_id OR t.id = task_dependencies.successor_task_id)
      AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage task dependencies for their company tasks"
ON public.task_dependencies
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    INNER JOIN public.projects p ON t.project_id = p.id
    INNER JOIN public.company_members cm ON p.company_id = cm.company_id
    WHERE (t.id = task_dependencies.predecessor_task_id OR t.id = task_dependencies.successor_task_id)
      AND cm.user_id = auth.uid()
  )
);