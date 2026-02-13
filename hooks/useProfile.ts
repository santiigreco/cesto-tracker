
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { UserProfile } from '../types';

export const useProfile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found", which is fine for new users
                throw error;
            }

            if (data) {
                setProfile(data as UserProfile);
            } else {
                // Initialize empty profile structure if none exists
                setProfile({
                    id: user.id,
                    full_name: user.user_metadata?.full_name || '',
                    favorite_club: null,
                    role: null
                });
            }
        } catch (err: any) {
            console.error('Error fetching profile:', err);
            // Don't set global error for this, fail silently or handle gracefully
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setLoading(true);
        setError(null);
        try {
            const payload = {
                id: user.id,
                ...updates,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('profiles')
                .upsert(payload);

            if (error) throw error;

            setProfile(prev => prev ? { ...prev, ...updates } : payload as UserProfile);
            return true;
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setError('No se pudo guardar el perfil.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        loading,
        error,
        updateProfile,
        refreshProfile: fetchProfile
    };
};
