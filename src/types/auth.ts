// 인증 관련 타입 정의

export interface UserAuth {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  is_verified: boolean;
  is_active: boolean;
  terms_agreed: boolean;
  privacy_agreed: boolean;
  collection_agreed: boolean;
  third_party_agreed: boolean;
  agreed_at?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface KakaoUserInfo {
  id: number;
  connected_at: string;
  properties: {
    nickname: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account: {
    profile_needs_agreement: boolean;
    profile: {
      nickname: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
      is_default_image: boolean;
    };
    email_needs_agreement: boolean;
    is_email_valid: boolean;
    is_email_verified: boolean;
    email?: string;
    age_range_needs_agreement: boolean;
    age_range?: string;
    birthday_needs_agreement: boolean;
    birthday?: string;
    gender_needs_agreement: boolean;
    gender?: string;
    phone_number_needs_agreement: boolean;
    phone_number?: string;
    ci_needs_agreement: boolean;
    ci?: string;
    ci_authenticated_at?: string;
  };
}

export interface KakaoAuthResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  terms_agreed: boolean;
  privacy_agreed: boolean;
  collection_agreed: boolean;
  third_party_agreed: boolean;
}

export interface SignInData {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: UserAuth;
  token?: string;
  error?: string;
}
