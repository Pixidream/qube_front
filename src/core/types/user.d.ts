export interface User {
  id: string;
  email: string;
  profile_picture?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  job_title?: string;
  phone_number?: string;
  last_login?: Date;
  is_active: boolean;
  totp_enabled: boolean;
  email_verified?: Date;
}
