'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);

  const updateProfile = (profileId: string, updates: Partial<UserProfile>) => {
    setProfiles((prevProfiles) =>
      prevProfiles.map((profile) =>
        profile.id === profileId ? { ...profile, ...updates } : profile
      )
    );
  };

  const getProfileById = (profileId: string) => {
    return profiles.find((profile) => profile.id === profileId);
  };

  return (
    <ProfileContext.Provider
      value={{ profiles, setProfiles, updateProfile, getProfileById }}
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
