
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';

export const useProfile = () => {
    const {
        profile,
        profileLoading,
        profileError,
        updateProfile,
        uploadAvatar,
        refreshProfile,
        isOwner,
        canAccessAdmin
    } = useAuth();

    return {
        profile,
        loading: profileLoading,
        error: profileError,
        updateProfile,
        uploadAvatar,
        refreshProfile,
        isOwner,
        canAccessAdmin
    };
};

