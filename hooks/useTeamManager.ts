import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { SavedTeam, RosterPlayer } from '../types';

const TEAMS_CACHE_TTL_MS = 60_000;
let cachedTeamsByUser: { userId: string; teams: SavedTeam[]; timestamp: number } | null = null;
let inFlightTeamsPromise: Promise<SavedTeam[]> | null = null;

export const useTeamManager = () => {
    const [teams, setTeams] = useState<SavedTeam[]>(() => cachedTeamsByUser?.teams || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTeams = useCallback(async (forceRefresh = false) => {
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            if (!user) {
                cachedTeamsByUser = null;
                setTeams([]);
                return;
            }

            const now = Date.now();
            if (
                !forceRefresh &&
                cachedTeamsByUser &&
                cachedTeamsByUser.userId === user.id &&
                now - cachedTeamsByUser.timestamp < TEAMS_CACHE_TTL_MS
            ) {
                setTeams(cachedTeamsByUser.teams);
                return;
            }

            setLoading(true);

            if (!forceRefresh && inFlightTeamsPromise) {
                const shared = await inFlightTeamsPromise;
                setTeams(shared);
                return;
            }

            const requestPromise = (async () => {
                const { data, error: dbError } = await supabase
                    .from('saved_teams')
                    .select('id, name, players, category, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (dbError) throw dbError;

                const parsedTeams: SavedTeam[] = (data || []).map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    players: t.players as RosterPlayer[],
                    category: t.category,
                    created_at: t.created_at
                }));

                cachedTeamsByUser = {
                    userId: user.id,
                    teams: parsedTeams,
                    timestamp: Date.now()
                };
                return parsedTeams;
            })();

            inFlightTeamsPromise = requestPromise;
            const result = await requestPromise;
            setTeams(result);
        } catch (err: any) {
            console.error(err);
            setError('Error al cargar equipos.');
        } finally {
            inFlightTeamsPromise = null;
            setLoading(false);
        }
    }, []);

    const saveTeam = useCallback(async (name: string, players: RosterPlayer[], category?: string) => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            if (!user) throw new Error('Debes iniciar sesión');

            const payload = {
                user_id: user.id,
                name,
                players, // JSONB
                category
            };

            const { data, error: dbError } = await supabase
                .from('saved_teams')
                .insert(payload)
                .select('id, name, players, category, created_at')
                .single();

            if (dbError) throw dbError;

            const newTeam: SavedTeam = {
                id: data.id,
                name: data.name,
                players: data.players,
                category: data.category,
                created_at: data.created_at
            };

            setTeams(prev => {
                const updated = [newTeam, ...prev];
                cachedTeamsByUser = { userId: user.id, teams: updated, timestamp: Date.now() };
                return updated;
            });
            return newTeam;

        } catch (err: any) {
            console.error(err);
            setError('Error al guardar el equipo.');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTeam = useCallback(async (id: string, name: string, players: RosterPlayer[], category?: string) => {
        setLoading(true);
        try {
            const { error: dbError } = await supabase
                .from('saved_teams')
                .update({ name, players, category })
                .eq('id', id);

            if (dbError) throw dbError;
            setTeams(prev => {
                const updated = prev.map(t => (t.id === id ? { ...t, name, players, category } : t));
                if (cachedTeamsByUser) {
                    cachedTeamsByUser = { ...cachedTeamsByUser, teams: updated, timestamp: Date.now() };
                }
                return updated;
            });
            return true;
        } catch (err: any) {
            console.error(err);
            setError('Error al actualizar el equipo.');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteTeam = useCallback(async (id: string) => {
        try {
            const { error: dbError } = await supabase
                .from('saved_teams')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;
            setTeams(prev => {
                const updated = prev.filter(t => t.id !== id);
                if (cachedTeamsByUser) {
                    cachedTeamsByUser = { ...cachedTeamsByUser, teams: updated, timestamp: Date.now() };
                }
                return updated;
            });
        } catch (err: any) {
            console.error(err);
            setError('Error al borrar el equipo.');
        }
    }, []);

    return {
        teams,
        loading,
        error,
        fetchTeams,
        saveTeam,
        updateTeam,
        deleteTeam
    };
};
