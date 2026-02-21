
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { UserProfile } from '../types';

export const useProfile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }
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
                // Initialize empty profile structure if none exists AND save it to DB
                // This ensures the user appears in the Admin Dashboard immediately
                const newProfile: UserProfile = {
                    id: user.id,
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
                    favorite_club: null,
                    role: 'jugador', // Default identity role
                    permission_role: null, // Default permission (none)
                    is_admin: false, // Default: not admin
                    avatar_url: user.user_metadata?.avatar_url || null,
                    updated_at: new Date().toISOString()
                };

                setProfile(newProfile);

                // Auto-create in DB
                await supabase.from('profiles').upsert(newProfile);
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

    const uploadAvatar = async (file: File) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        setLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update profile with new URL
            await updateProfile({ avatar_url: publicUrl });

            return publicUrl;
        } catch (err: any) {
            console.error("Error uploading avatar:", err);
            setError('Error al subir la imagen.');
            return null;
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
        uploadAvatar,
        refreshProfile: fetchProfile
    };
};
