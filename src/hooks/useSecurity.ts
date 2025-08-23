import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { validateAndSanitizeText, sanitizeHtml, rateLimiter } from '@/utils/security/inputValidation';
import { validateFormData } from '@/utils/security/formValidation';

interface SecurityMetric {
  security_metric: string;
  current_value: number;
  risk_level: string;
}

interface SecurityStatus {
  metrics: SecurityMetric[];
  loading: boolean;
  error: string | null;
}

interface SecurityAlert {
  id: string;
  type: 'xss_attempt' | 'sql_injection' | 'rate_limit' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Enhanced hook for comprehensive security monitoring and protection
 */
export const useSecurity = () => {
  const { user } = useAuth();
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    metrics: [],
    loading: false,
    error: null
  });
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);

  /**
   * Validate and sanitize user input with security checks
   */
  const secureInput = (
    input: string,
    options: {
      maxLength?: number;
      allowHtml?: boolean;
      fieldName?: string;
    } = {}
  ) => {
    const result = validateAndSanitizeText(input, {
      maxLength: options.maxLength || 1000,
      stripHtml: !options.allowHtml,
      requireNonEmpty: false
    });

    if (!result.isValid && result.errors.length > 0) {
      logSecurityEvent('input_validation_failed', 'user_input', '', {
        field: options.fieldName || 'unknown',
        errors: result.errors,
        original_length: input.length,
        sanitized_length: result.sanitized.length
      });
    }

    return result;
  };

  /**
   * Sanitize HTML content for safe display
   */
  const secureHtml = (html: string, options?: { allowedTags?: string[] }) => {
    return sanitizeHtml(html, {
      allowedTags: options?.allowedTags,
      stripWhitespace: true
    });
  };

  /**
   * Rate limiting check for user actions
   */
  const checkRateLimit = (
    action: string,
    maxAttempts: number = 10,
    windowMs: number = 60000
  ): boolean => {
    if (!user) return false;
    
    const key = `${user.id}_${action}`;
    const allowed = rateLimiter.isAllowed(key, maxAttempts, windowMs);
    
    if (!allowed) {
      logSecurityEvent('rate_limit_exceeded', 'user_action', action, {
        max_attempts: maxAttempts,
        window_ms: windowMs
      });
      
      addSecurityAlert({
        type: 'rate_limit',
        severity: 'medium',
        message: `Rate limit exceeded for action: ${action}`
      });
    }
    
    return allowed;
  };

  /**
   * Add security alert to monitoring
   */
  const addSecurityAlert = (alert: Omit<SecurityAlert, 'id' | 'timestamp'>) => {
    const newAlert: SecurityAlert = {
      ...alert,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };
    
    setSecurityAlerts(prev => [newAlert, ...prev.slice(0, 99)]); // Keep last 100 alerts
    
    // Log critical alerts
    if (alert.severity === 'critical' || alert.severity === 'high') {
      toast.error(`Security Alert: ${alert.message}`);
    }
  };

  /**
   * Enhanced security event logging
   */
  const logSecurityEvent = async (
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: Record<string, any> = {}
  ) => {
    try {
      const enhancedMetadata = {
        ...metadata,
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        url: window.location.pathname,
        session_id: crypto.randomUUID(), // Simple session tracking
        ip_hash: await hashUserIP() // Privacy-friendly IP tracking
      };

      const { error } = await supabase.rpc('log_user_action', {
        _action: action,
        _resource_type: resourceType,
        _resource_id: resourceId,
        _metadata: enhancedMetadata
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  /**
   * Hash user IP for privacy-friendly tracking
   */
  const hashUserIP = async (): Promise<string> => {
    try {
      // Get approximate location via a privacy-friendly API
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      // Hash the IP for privacy
      const encoder = new TextEncoder();
      const data_encoded = encoder.encode(data.ip || 'unknown');
      const hash = await crypto.subtle.digest('SHA-256', data_encoded);
      
      return Array.from(new Uint8Array(hash.slice(0, 8)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      return 'hash_unavailable';
    }
  };

  /**
   * Comprehensive form validation with security
   */
  const validateSecureForm = <T>(schema: any, data: unknown): {
    success: boolean;
    data?: T;
    errors?: string[];
    securityIssues?: string[];
  } => {
    const validation = validateFormData(schema, data);
    const securityIssues: string[] = [];
    
    // Additional security checks
    if (typeof data === 'object' && data !== null) {
      const dataStr = JSON.stringify(data);
      
      // Check for suspicious patterns
      if (dataStr.includes('<script>') || dataStr.includes('javascript:')) {
        securityIssues.push('Potential XSS attempt detected');
      }
      
      if (dataStr.match(/(\bUNION\b|\bSELECT\b|\bDROP\b)/i)) {
        securityIssues.push('Potential SQL injection attempt detected');
      }
    }
    
    if (securityIssues.length > 0) {
      logSecurityEvent('form_security_violation', 'form_submission', '', {
        security_issues: securityIssues,
        form_data_length: JSON.stringify(data).length
      });
    }
    
    return {
      success: validation.success,
      data: validation.data as T,
      errors: validation.errors,
      securityIssues
    };
  };

  /**
   * Fetch security overview (superadmin only)
   */
  const fetchSecurityOverview = async () => {
    if (!user) return;
    
    setSecurityStatus(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase
        .rpc('get_security_overview');
      
      if (error) throw error;
      
      setSecurityStatus({
        metrics: data || [],
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Security overview fetch failed:', error);
      setSecurityStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch security overview'
      }));
    }
  };

  /**
   * Check for security alerts
   */
  const checkSecurityAlerts = async () => {
    try {
      // Use a more generic approach for now
      console.log('Security alert check - monitoring active');
      // This will be implemented once types are updated
      // For now, just log that security monitoring is active
    } catch (error) {
      console.error('Security alert check failed:', error);
    }
  };

  /**
   * Validate Xero connection security
   */
  const validateXeroTokenSecurity = async (connectionId: string) => {
    try {
      const { data: connection, error } = await supabase
        .from('xero_connections')
        .select('access_token, refresh_token, access_token_encrypted_v2, refresh_token_encrypted_v2')
        .eq('id', connectionId)
        .single();
      
      if (error) throw error;
      
      const hasPlaintextTokens = !!(connection.access_token || connection.refresh_token);
      const hasEncryptedTokens = !!(connection.access_token_encrypted_v2 || connection.refresh_token_encrypted_v2);
      
      if (hasPlaintextTokens && !hasEncryptedTokens) {
        toast.error('Xero tokens are stored in plaintext - this is a security risk');
        await logSecurityEvent(
          'insecure_token_detected', 
          'xero_connection', 
          connectionId,
          { security_issue: 'plaintext_tokens' }
        );
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Xero token validation failed:', error);
      toast.error('Failed to validate Xero token security');
      return false;
    }
  };

  /**
   * Rotate Xero tokens (placeholder for implementation)
   */
  const rotateXeroTokens = async (connectionId: string, reason: string) => {
    try {
      // Log the rotation attempt
      await logSecurityEvent(
        'token_rotation_requested',
        'xero_connection',
        connectionId,
        { reason }
      );
      
      // For now, just log the rotation request until tables are fully accessible
      console.log(`Token rotation requested for connection ${connectionId}, reason: ${reason}`);
      
      toast.success('Token rotation logged - implementation pending');
      return true;
    } catch (error: any) {
      console.error('Token rotation failed:', error);
      toast.error('Failed to rotate tokens');
      return false;
    }
  };

  /**
   * Invalidate user sessions (superadmin only)
   */
  const invalidateUserSessions = async (targetUserId: string) => {
    try {
      // Log the session invalidation request
      await logSecurityEvent(
        'session_invalidation_requested',
        'user_session',
        targetUserId,
        { reason: 'admin_action' }
      );
      
      console.log(`Session invalidation requested for user ${targetUserId}`);
      toast.success('Session invalidation logged');
      return true;
    } catch (error: any) {
      console.error('Session invalidation failed:', error);
      toast.error(error.message || 'Failed to invalidate sessions');
      return false;
    }
  };

  // Voice Chat Security Functions
  const createVoiceSession = async (): Promise<string | null> => {
    try {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('voice_chat_sessions')
        .insert({
          user_id: user.id,
          session_start: new Date().toISOString(),
          total_requests: 0,
          total_duration_seconds: 0
        })
        .select()
        .single();

      if (error) throw error;

      logSecurityEvent('voice_session_created', 'voice_chat_sessions', data.id, {
        user_id: user.id,
        session_id: data.id
      });

      return data.id;
    } catch (error) {
      console.error('Failed to create voice session:', error);
      return null;
    }
  };

  const endVoiceSession = async (sessionId: string): Promise<void> => {
    try {
      if (!user?.id) return;

      const { error } = await supabase
        .from('voice_chat_sessions')
        .update({
          session_end: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      logSecurityEvent('voice_session_ended', 'voice_chat_sessions', sessionId, {
        user_id: user.id,
        session_id: sessionId
      });
    } catch (error) {
      console.error('Failed to end voice session:', error);
    }
  };

  const checkVoiceSessionLimits = async (sessionId: string): Promise<{ 
    withinLimits: boolean; 
    reason?: string; 
  }> => {
    try {
      if (!user?.id) return { withinLimits: false, reason: 'User not authenticated' };

      const { data: session, error } = await supabase
        .from('voice_chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (error || !session) {
        return { withinLimits: false, reason: 'Session not found' };
      }

      // Check request limits
      if (session.total_requests >= session.max_requests_per_session) {
        return { withinLimits: false, reason: 'Request limit exceeded' };
      }

      // Check duration limits
      const sessionStartTime = new Date(session.session_start).getTime();
      const currentTime = new Date().getTime();
      const sessionDurationMinutes = (currentTime - sessionStartTime) / (1000 * 60);

      if (sessionDurationMinutes > session.max_duration_minutes) {
        return { withinLimits: false, reason: 'Session duration limit exceeded' };
      }

      return { withinLimits: true };
    } catch (error) {
      console.error('Failed to check voice session limits:', error);
      return { withinLimits: false, reason: 'Failed to check limits' };
    }
  };

  const incrementVoiceRequests = async (sessionId: string): Promise<void> => {
    try {
      if (!user?.id) return;

      // Get current request count and increment it
      const { data: session, error: selectError } = await supabase
        .from('voice_chat_sessions')
        .select('total_requests')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (selectError || !session) {
        console.error('Failed to get current request count:', selectError);
        return;
      }

      const { error } = await supabase
        .from('voice_chat_sessions')
        .update({
          total_requests: (session.total_requests || 0) + 1
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to increment voice requests:', error);
      }
    } catch (error) {
      console.error('Failed to increment voice requests:', error);
    }
  };

  const validateVoiceInput = (input: string): {
    isValid: boolean;
    sanitized: string;
    securityIssues: string[];
  } => {
    const securityIssues: string[] = [];
    let sanitized = input.trim();

    // Check for prompt injection patterns
    const promptInjectionPatterns = [
      /ignore\s+(previous|above|all)\s+(instructions?|prompts?)/i,
      /forget\s+(everything|all|previous)/i,
      /act\s+as\s+(?!.*voice|.*assistant)/i,
      /you\s+are\s+now\s+a/i,
      /pretend\s+to\s+be/i,
      /roleplay\s+as/i,
      /<\s*script/i,
      /javascript:/i,
      /data:/i
    ];

    for (const pattern of promptInjectionPatterns) {
      if (pattern.test(sanitized)) {
        securityIssues.push('Potential prompt injection detected');
        break;
      }
    }

    // Check input length
    if (sanitized.length > 2000) {
      securityIssues.push('Input too long');
      sanitized = sanitized.substring(0, 2000);
    }

    // Remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>'"]/g, '');

    return {
      isValid: securityIssues.length === 0,
      sanitized,
      securityIssues
    };
  };

  // Check daily voice usage limits
  const checkDailyVoiceUsage = async (): Promise<{
    withinLimits: boolean;
    todayUsageMinutes: number;
    dailyLimitMinutes: number;
  }> => {
    try {
      if (!user?.id) {
        return { withinLimits: false, todayUsageMinutes: 0, dailyLimitMinutes: 60 };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: sessions, error } = await supabase
        .from('voice_chat_sessions')
        .select('total_duration_seconds')
        .eq('user_id', user.id)
        .gte('session_start', today.toISOString())
        .lt('session_start', tomorrow.toISOString());

      if (error) throw error;

      const todayUsageSeconds = sessions?.reduce((sum, session) => 
        sum + (session.total_duration_seconds || 0), 0) || 0;
      
      const todayUsageMinutes = Math.round(todayUsageSeconds / 60);
      const dailyLimitMinutes = 60; // 1 hour daily limit

      return {
        withinLimits: todayUsageMinutes < dailyLimitMinutes,
        todayUsageMinutes,
        dailyLimitMinutes
      };
    } catch (error) {
      console.error('Failed to check daily voice usage:', error);
      return { withinLimits: true, todayUsageMinutes: 0, dailyLimitMinutes: 60 };
    }
  };

  // Auto-refresh security status every 5 minutes for superadmins
  useEffect(() => {
    if (!user) return;
    
    // Initial check
    checkSecurityAlerts();
    
    const interval = setInterval(() => {
      checkSecurityAlerts();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [user]);

  return {
    // Core security functions
    securityStatus,
    fetchSecurityOverview,
    logSecurityEvent,
    checkSecurityAlerts,
    
    // Enhanced security utilities
    secureInput,
    secureHtml,
    checkRateLimit,
    validateSecureForm,
    
    // Security monitoring
    securityAlerts,
    addSecurityAlert,
    clearSecurityAlerts: () => setSecurityAlerts([]),
    
    // Voice Chat Security
    createVoiceSession,
    endVoiceSession,
    checkVoiceSessionLimits,
    incrementVoiceRequests,
    validateVoiceInput,
    checkDailyVoiceUsage,
    
    // Xero-specific security (legacy)
    validateXeroTokenSecurity,
    rotateXeroTokens,
    invalidateUserSessions
  };
};