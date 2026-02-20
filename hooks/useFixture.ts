
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
    season?: string;
    category?: string;
    gender?: string;
    round?: string;
    matchUrl?: string;
    location?: string;
    isRest?: boolean; // Para identificar fecha libre
    stageGroup?: string;
}

export interface TournamentOption {
    id: string;
    name: string;
    status: 'active' | 'finished';
}

// Función auxiliar para normalizar fechas de Excel (DD/MM/YYYY) a ISO (YYYY-MM-DD)
const normalizeDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    
    // Si viene con barras (ej: 18/07/2018), asumimos formato Latino DD/MM/YYYY
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
        }
    }
    
    return dateStr;
};

const PAGE_SIZE = 10;

export const useFixture = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [tournaments, setTournaments] = useState<TournamentOption[]>([]);
    const [loading, setLoading] = useState(true);
    // Estado para controlar qué temporada se está viendo. Default: 2025
    const [activeSeason, setActiveSeason] = useState<string>('2025');
    
    // Estados de paginación
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchMatches = async (seasonToFetch: string = activeSeason, isLoadMore: boolean = false) => {
        setLoading(true);
        
        // Si no es "Cargar más", reseteamos la página a 0
        const currentPage = isLoadMore ? page + 1 : 0;
        const from = currentPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
            .from('fixture')
            .select('*')
            .order('date', { ascending: false }); // Siempre ordenamos por fecha descendente

        // Filtrar por rango de fechas (Asegura que cargue aunque la columna 'season' este vacía)
        const startOfYear = `${seasonToFetch}-01-01`;
        const endOfYear = `${seasonToFetch}-12-31`;
        
        query = query.gte('date', startOfYear).lte('date', endOfYear);

        // Aplicar Paginación (Rango)
        query = query.range(from, to);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching fixture:', error);
        } else if (data) {
            const mappedMatches: Match[] = data.map((m: any) => ({
                id: m.id,
                tournament: m.tournament,
                date: normalizeDate(m.date), 
                time: m.time || '00:00',
                homeTeam: m.home_team || '',       
                awayTeam: m.away_team || '',       
                scoreHome: m.score_home === null ? '' : m.score_home, 
                scoreAway: m.score_away === null ? '' : m.score_away, 
                status: m.status || 'finished',
                season: m.season ? String(m.season) : '', 
                category: m.category,
                gender: m.gender,
                round: m.round,
                matchUrl: m.match_url,       
                location: m.location,
                // Soporte robusto para booleanos o strings ('SI', 'TRUE')
                isRest: m.is_rest === true || m.is_rest === 'SI' || m.is_rest === 'true' || m.is_rest === 'TRUE',  
                stageGroup: m.stage_group    
            }));

            if (isLoadMore) {
                // Si es cargar más, añadimos al final
                setMatches(prev => {
                    // Filtrar duplicados por ID por seguridad (si hubo updates en tiempo real)
                    const existingIds = new Set(prev.map(m => m.id));
                    const uniqueNewMatches = mappedMatches.filter(m => !existingIds.has(m.id));
                    return [...prev, ...uniqueNewMatches].sort((a, b) => {
                        // Re-ordenar localmente para asegurar consistencia
                        if (a.date < b.date) return 1;
                        if (a.date > b.date) return -1;
                        return 0;
                    });
                });
            } else {
                // Si es nueva búsqueda o refresh, reemplazamos
                setMatches(mappedMatches);
            }

            // Si trajimos menos registros que el tamaño de página, no hay más datos
            setHasMore(data.length === PAGE_SIZE);
            setPage(currentPage);
        }
        setLoading(false);
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchMatches(activeSeason, true);
        }
    };

    const fetchTournaments = async () => {
        const { data, error } = await supabase
            .from('tournaments')
            .select('id, name, status')
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            const mappedTournaments: TournamentOption[] = data.map((t: any) => ({
                id: t.id,
                name: t.name,
                status: t.status || 'active'
            }));
            setTournaments(mappedTournaments);
        }
    };

    const addMatch = async (matchData: Omit<Match, 'id' | 'status' | 'scoreHome' | 'scoreAway'>) => {
        const season = new Date().getFullYear().toString();
        const { error } = await supabase
            .from('fixture')
            .insert([{
                tournament: matchData.tournament,
                date: matchData.date,
                time: matchData.time,
                home_team: matchData.homeTeam,
                away_team: matchData.awayTeam,
                status: 'scheduled',
                season: season
            }]);

        if (error) {
            console.error("Error creating match:", error);
            alert("Error al crear partido: " + error.message);
        } else {
            // Si agregamos un partido y estamos viendo esa temporada, refrescamos desde cero
            if (activeSeason === season) {
                fetchMatches(activeSeason, false);
            }
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
            setMatches(prev => prev.filter(m => m.id !== id));
        }
    };

    const updateMatch = async (id: string, updates: Partial<Match>) => {
        setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));

        const dbUpdates: any = {};
        if (updates.scoreHome !== undefined) dbUpdates.score_home = updates.scoreHome === '' ? null : updates.scoreHome;
        if (updates.scoreAway !== undefined) dbUpdates.score_away = updates.scoreAway === '' ? null : updates.scoreAway;
        if (updates.time !== undefined) dbUpdates.time = updates.time;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.matchUrl !== undefined) dbUpdates.match_url = updates.matchUrl;

        const { error } = await supabase
            .from('fixture')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error("Error updating match:", error);
        }
    };

    // Cambiar temporada y recargar desde página 0
    const changeSeason = (season: string) => {
        setActiveSeason(season);
        fetchMatches(season, false);
    };

    useEffect(() => {
        fetchMatches(activeSeason, false); // Fetch inicial
        fetchTournaments();

        const subscription = supabase
            .channel('public:fixture')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fixture' }, () => {
                // Si hay cambios externos, refrescamos la vista actual
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    return {
        matches,
        tournaments,
        loading,
        addMatch,
        updateMatch,
        deleteMatch,
        refresh: () => fetchMatches(activeSeason, false),
        activeSeason,
        changeSeason,
        loadMore,
        hasMore
    };
};
