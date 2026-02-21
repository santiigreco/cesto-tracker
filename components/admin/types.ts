
import React from 'react';
import { IdentityRole, PermissionRole } from '../../types';

export type AdminTab = 'dashboard' | 'users' | 'tournaments' | 'games' | 'fixture';

export interface AdminProfile {
    id: string;
    email?: string; // Puede venir de auth o joined query
    full_name: string | null;
    role: IdentityRole | null;
    permission_role: PermissionRole;
    favorite_club: string | null;
    created_at: string;
    updated_at: string;
}

export interface AdminTournament {
    id: string;
    name: string;
    created_at: string;
}

export interface AdminGame {
    id: string;
    created_at: string;
    game_mode: string;
    settings: {
        gameName?: string;
        myTeam?: string;
    };
    user_id: string;
    profiles?: {
        email: string | null;
        full_name: string | null;
    } | null;
}

export interface AdminStat {
    label: string;
    value: number | string;
    color: string; // Tailwind class subset (e.g. 'text-cyan-400')
    icon: React.ReactNode;
}
