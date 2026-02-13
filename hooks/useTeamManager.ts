
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { SavedTeam, RosterPlayer } from '../types';

export const useTeamManager = () => {
    const [teams, setTeams] = useState<SavedTeam[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTeams = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setTeams([]);
                return;
            }

            const { data, error } = await supabase
                .from('saved_teams')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            // Supabase returns JSON columns as any, we cast it
            const parsedTeams: SavedTeam[] = (data || []).map((t: any) => ({
                id: t.id,
                name: t.name,
                players: t.players as RosterPlayer[],
                category: t.category,
                created_at: t.created_at
            }));

            setTeams(parsedTeams);
        } catch (err: any) {
            console.error(err);
            setError('Error al cargar equipos.');
        } finally {
            setLoading(false);
        }
    };

    const saveTeam = async (name: string, players: RosterPlayer[], category?: string) => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Debes iniciar sesión');

            const payload = {
                user_id: user.id,
                name,
                players, // JSONB
                category
            };

            const { data, error } = await supabase
                .from('saved_teams')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;

            const newTeam: SavedTeam = {
                id: data.id,
                name: data.name,
                players: data.players,
                category: data.category,
                created_at: data.created_at
            };

            setTeams(prev => [newTeam, ...prev]);
            return newTeam;

        } catch (err: any) {
            console.error(err);
            setError('Error al guardar el equipo.');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteTeam = async (id: string) => {
        try {
            const { error } = await supabase
                .from('saved_teams')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setTeams(prev => prev.filter(t => t.id !== id));
        } catch (err: any) {
            console.error(err);
            setError('Error al borrar el equipo.');
        }
    };

    return {
        teams,
        loading,
        error,
        fetchTeams,
        saveTeam,
        deleteTeam
    };
};
