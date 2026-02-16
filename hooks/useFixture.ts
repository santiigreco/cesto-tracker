
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export interface Match {
    id: string;
    tournament: string;
    date: string;
    time: string;
    homeTeam: string;
    awayTeam: string;
    scoreHome?: number | '';
    scoreAway?: number | '';
    status: 'scheduled' | 'live' | 'finished';
}

export const useFixture = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMatches = async () => {
        const { data, error } = await supabase
            .from('fixture')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching fixture:', error);
        } else if (data) {
            // Mapear de snake_case (DB) a camelCase (App)
            const mappedMatches: Match[] = data.map((m: any) => ({
                id: m.id,
                tournament: m.tournament,
                date: m.date,
                time: m.time,
                homeTeam: m.home_team,
                awayTeam: m.away_team,
                scoreHome: m.score_home === null ? '' : m.score_home,
                scoreAway: m.score_away === null ? '' : m.score_away,
                status: m.status
            }));
            setMatches(mappedMatches);
        }
        setLoading(false);
    };

    const addMatch = async (matchData: Omit<Match, 'id' | 'status' | 'scoreHome' | 'scoreAway'>) => {
        const { error } = await supabase
            .from('fixture')
            .insert([{
                tournament: matchData.tournament,
                date: matchData.date,
                time: matchData.time,
                home_team: matchData.homeTeam,
                away_team: matchData.awayTeam,
                status: 'scheduled'
            }]);

        if (error) {
            console.error("Error creating match:", error);
            alert("Error al crear partido: " + error.message);
        } else {
            fetchMatches(); // Recargar inmediatamente
        }
    };

    const deleteMatch = async (id: string) => {
        const { error } = await supabase
            .from('fixture')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting match:", error);
            alert("Error al eliminar partido");
        } else {
            // Optimistic update
            setMatches(prev => prev.filter(m => m.id !== id));
        }
    };

    // Actualizar un partido en la DB
    const updateMatch = async (id: string, updates: Partial<Match>) => {
        // Optimistic update (actualizar UI antes de que el server responda para que se sienta rápido)
        setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

        // Convertir camelCase a snake_case para la DB
        const dbUpdates: any = {};
        if (updates.scoreHome !== undefined) dbUpdates.score_home = updates.scoreHome === '' ? null : updates.scoreHome;
        if (updates.scoreAway !== undefined) dbUpdates.score_away = updates.scoreAway === '' ? null : updates.scoreAway;
        if (updates.time !== undefined) dbUpdates.time = updates.time;
        if (updates.status !== undefined) dbUpdates.status = updates.status;

        const { error } = await supabase
            .from('fixture')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error("Error updating match:", error);
            // Revertir en caso de error (opcional, por simplicidad lo omitimos aquí)
        }
    };

    useEffect(() => {
        fetchMatches();

        // SUSCRIPCIÓN REALTIME (Estilo Promiedos)
        const subscription = supabase
            .channel('public:fixture')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fixture' }, (payload) => {
                console.log('Cambio en fixture recibido!', payload);
                fetchMatches(); // Recargar datos cuando alguien más edita
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    return {
        matches,
        loading,
        addMatch,
        updateMatch,
        deleteMatch,
        refresh: fetchMatches
    };
};
