export interface AuditLog {
  id: number;
  user_id: string | null;
  user_role_id: number | null;
  school_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: any | null;
  new_values: any | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  username?: string;
  role?: string;
  user_roles?: {
    username: string;
    role: string;
  };
} 