'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useAuth } from './authContext';

interface UserProfile {
  id: string;
  user_auth_id: string;
  profile_title: string;
  company_name?: string;
  business_registration_file?: string;
  phone: string;
  email: string;
  contact_person_name: string;
  fax_number?: string;
  is_default: boolean;
  is_public_institution?: boolean;
  is_company?: boolean;
  created_at: string;
}

interface ProfileContextType {
  profiles: UserProfile[];
  setProfiles: (profiles: UserProfile[]) => void;
  updateProfile: (profileId: string, updates: Partial<UserProfile>) => void;
  getProfileById: (profileId: string) => UserProfile | undefined;
  refreshProfiles: () => Promise<void>;
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// localStorage 키
const PROFILES_STORAGE_KEY = 'hansung_user_profiles';
const PROFILES_USER_ID_KEY = 'hansung_profiles_user_id';

// localStorage에서 프로필 로드
const loadProfilesFromStorage = (authUserId: string): UserProfile[] | null => {
  if (typeof window === 'undefined') return null;

  try {
    // hansung_profiles_user_id에는 기본 프로필 ID가 저장되어 있음
    // 하지만 auth_user_id로 사용자 확인은 여전히 필요
    // auth_user_id는 별도로 저장하지 않고, 프로필 배열의 user_auth_id로 확인
    const stored = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!stored) return null;

    const profiles = JSON.parse(stored) as UserProfile[];

    // 프로필 배열의 첫 번째 프로필의 user_auth_id로 사용자 확인
    if (profiles.length > 0 && profiles[0].user_auth_id !== authUserId) {
      // 다른 사용자의 프로필이면 무시
      return null;
    }

    console.log('🔍 [ProfileContext] localStorage에서 프로필 복원:', {
      count: profiles.length,
      authUserId,
      defaultProfileId: localStorage.getItem(PROFILES_USER_ID_KEY),
    });
    return profiles;
  } catch (error) {
    console.error('🔍 [ProfileContext] localStorage 복원 실패:', error);
    return null;
  }
};

// localStorage에 프로필 저장
const saveProfilesToStorage = (profiles: UserProfile[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));

    // 기본 프로필 ID 찾기 (is_default = true인 프로필만 사용)
    const defaultProfile = profiles.find((profile) => profile.is_default);
    const defaultProfileId = defaultProfile?.id;

    if (defaultProfileId) {
      localStorage.setItem(PROFILES_USER_ID_KEY, defaultProfileId);
      console.log('🔍 [ProfileContext] localStorage에 프로필 저장:', {
        count: profiles.length,
        defaultProfileId,
        defaultProfileTitle: defaultProfile.profile_title,
      });
    } else {
      console.warn(
        '🔍 [ProfileContext] ⚠️ 기본 프로필을 찾을 수 없어 localStorage에 저장하지 않음'
      );
    }
  } catch (error) {
    console.error('🔍 [ProfileContext] localStorage 저장 실패:', error);
  }
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profiles, setProfilesState] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // 프로필 상태 변경 시 localStorage에 저장
  const setProfiles = (newProfiles: UserProfile[]) => {
    setProfilesState(newProfiles);
    if (newProfiles.length > 0) {
      // 기본 프로필 ID를 찾아서 localStorage에 저장
      saveProfilesToStorage(newProfiles);
    }
  };

  // API에서 프로필 가져오기
  const fetchProfiles = async (userId: string): Promise<UserProfile[]> => {
    try {
      console.log('🔍 [ProfileContext] 프로필 API 호출:', userId);
      const response = await fetch(`/api/user-profiles?userId=${userId}`);
      const data = await response.json();

      if (data.success && data.data) {
        const profilesWithDefaults = data.data.map((profile: UserProfile) => ({
          ...profile,
          is_public_institution: profile.is_public_institution ?? false,
          is_company: profile.is_company ?? false,
        }));
        console.log('🔍 [ProfileContext] 프로필 API 응답:', {
          count: profilesWithDefaults.length,
          profiles: profilesWithDefaults.map((p: UserProfile) => ({
            id: p.id,
            title: p.profile_title,
            is_default: p.is_default,
          })),
        });
        return profilesWithDefaults;
      } else {
        console.error('🔍 [ProfileContext] 프로필 API 실패:', data.error);
        return [];
      }
    } catch (error) {
      console.error('🔍 [ProfileContext] 프로필 API 오류:', error);
      return [];
    }
  };

  // 프로필 새로고침
  const refreshProfiles = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const fetchedProfiles = await fetchProfiles(user.id);
      setProfiles(fetchedProfiles);
    } finally {
      setLoading(false);
    }
  };

  // 로그인 시 프로필 자동 로드
  useEffect(() => {
    if (!user?.id) {
      // 로그아웃 시 프로필 초기화
      setProfilesState([]);
      localStorage.removeItem(PROFILES_STORAGE_KEY);
      localStorage.removeItem(PROFILES_USER_ID_KEY);
      return;
    }

    const loadProfiles = async () => {
      setLoading(true);
      try {
        // 먼저 localStorage에서 확인
        const cachedProfiles = loadProfilesFromStorage(user.id);
        if (cachedProfiles && cachedProfiles.length > 0) {
          console.log('🔍 [ProfileContext] localStorage에서 프로필 사용');
          setProfilesState(cachedProfiles);
          // 백그라운드에서 최신 데이터 가져오기
          fetchProfiles(user.id).then((fetchedProfiles) => {
            if (fetchedProfiles.length > 0) {
              setProfiles(fetchedProfiles);
            }
          });
        } else {
          // localStorage에 없으면 API 호출
          console.log('🔍 [ProfileContext] API에서 프로필 가져오기');
          const fetchedProfiles = await fetchProfiles(user.id);
          setProfiles(fetchedProfiles);
        }
      } catch (error) {
        console.error('🔍 [ProfileContext] 프로필 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, [user?.id]);

  const updateProfile = (profileId: string, updates: Partial<UserProfile>) => {
    const updatedProfiles = profiles.map((profile) =>
      profile.id === profileId ? { ...profile, ...updates } : profile
    );
    setProfiles(updatedProfiles);
  };

  const getProfileById = (profileId: string) => {
    return profiles.find((profile) => profile.id === profileId);
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        setProfiles,
        updateProfile,
        getProfileById,
        refreshProfiles,
        loading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
