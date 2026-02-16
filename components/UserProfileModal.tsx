
import React, { useState, useEffect, useRef } from 'react';
import XIcon from './XIcon';
import CheckIcon from './CheckIcon';
import Loader from './Loader';
import TeamLogo from './TeamLogo';
import CameraIcon from './CameraIcon';
import { useProfile } from '../hooks/useProfile';
import { TEAMS_CONFIG, ADMIN_EMAILS } from '../constants';
import { IdentityRole } from '../types';
import AdminDashboard from './AdminDashboard'; // Import AdminDashboard

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onLogout: () => void;
    onLoadGame: (gameId: string, asOwner: boolean) => void;
}

// Solo mostramos roles de identidad al usuario
const IDENTITY_ROLES: { value: IdentityRole; label: string; emoji: string }[] = [
    { value: 'jugador', label: 'Jugador/a', emoji: '🏃' },
    { value: 'entrenador', label: 'Entrenador/a', emoji: '📋' },
    { value: 'dirigente', label: 'Delegado / Mesa', emoji: '⏱️' },
    { value: 'hincha', label: 'Hincha / Familiar', emoji: '🥁' },
    { value: 'periodista', label: 'Prensa', emoji: '🎙️' },
    { value: 'otro', label: 'Otro', emoji: '🏐' },
];

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, user, onLogout, onLoadGame }) => {
    const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useProfile();
    
    // Form State
    const [fullName, setFullName] = useState('');
    const [favoriteClub, setFavoriteClub] = useState<string>('');
    const [role, setRole] = useState<IdentityRole | ''>('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    
    // UI State
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    
    // Admin State
    const [showAdmin, setShowAdmin] = useState(false);
    
    // File Input Ref
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Check Permissions
    const normalizedEmail = user.email ? user.email.toLowerCase().trim() : '';
    const isOwner = ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(normalizedEmail);
    // Access to full Admin Dashboard: Owner OR Permission='admin' (Fixture Manager excluded here)
    const canAccessAdminPanel = isOwner || profile?.permission_role === 'admin';

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setFavoriteClub(profile.favorite_club || '');
            setRole(profile.role || '');
            setAvatarUrl(profile.avatar_url || null);
        }
    }, [profile]);

    const handleSave = async () => {
        setIsSaving(true);
        const success = await updateProfile({
            full_name: fullName,
            favorite_club: favoriteClub,
            role: role as IdentityRole
        });
        
        setIsSaving(false);
        if (success) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const file = event.target.files[0];
        
        // Basic validation
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            alert("La imagen es demasiado grande. Máximo 2MB.");
            return;
        }

        setIsUploading(true);
        const newUrl = await uploadAvatar(file);
        setIsUploading(false);
        
        if (newUrl) {
            setAvatarUrl(newUrl);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
                <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-slate-700 overflow-hidden relative">
                    
                    {/* Header Profile Card Style */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 flex flex-col items-center border-b border-slate-700 relative">
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" aria-label="Cerrar">
                            <XIcon />
                        </button>

                        <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept="image/*" 
                                className="hidden" 
                            />
                            
                            <div className="w-24 h-24 rounded-full bg-cyan-600 border-4 border-slate-800 flex items-center justify-center text-white font-bold text-4xl uppercase shadow-lg overflow-hidden relative">
                                {isUploading ? (
                                    <Loader className="h-8 w-8 text-white" />
                                ) : avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    user.email?.charAt(0) || 'U'
                                )}
                                
                                {/* Overlay for Edit */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CameraIcon className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            
                            {/* Club Badge */}
                            {favoriteClub && (
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700 shadow-md">
                                    <TeamLogo teamName={favoriteClub} className="h-7 w-7" />
                                </div>
                            )}
                        </div>
                        
                        <h2 className="mt-4 text-xl font-bold text-white text-center">
                            {fullName || 'Usuario de Cesto Tracker'}
                        </h2>
                        <p className="text-sm text-slate-400">{user.email}</p>
                        
                        {role && (
                            <span className="mt-2 px-3 py-1 rounded-full bg-cyan-900/30 text-cyan-400 text-xs font-bold border border-cyan-500/30 uppercase tracking-wide flex items-center gap-1">
                                {IDENTITY_ROLES.find(r => r.value === role)?.emoji} {IDENTITY_ROLES.find(r => r.value === role)?.label || role}
                            </span>
                        )}
                        {/* Internal Permission Badge (only visible to self if special) */}
                        {profile?.permission_role && (
                            <span className="mt-1 text-[10px] text-slate-500 uppercase tracking-widest border border-slate-700 px-2 rounded">
                                {profile.permission_role.replace('_', ' ')}
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 bg-slate-900">
                        
                        {/* Identity */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Nombre Completo</label>
                            <input 
                                type="text" 
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="Ej: Juan Pérez"
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors"
                            />
                        </div>

                        {/* Cestoball Identity */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Club Favorito ❤️</label>
                                <select
                                    value={favoriteClub}
                                    onChange={e => setFavoriteClub(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors appearance-none"
                                >
                                    <option value="">Seleccionar...</option>
                                    {TEAMS_CONFIG.map(team => (
                                        <option key={team.name} value={team.name}>{team.name}</option>
                                    ))}
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Rol</label>
                                <select
                                    value={role}
                                    onChange={e => setRole(e.target.value as IdentityRole)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors appearance-none"
                                >
                                    <option value="">Seleccionar...</option>
                                    {IDENTITY_ROLES.map(r => (
                                        <option key={r.value} value={r.value}>{r.emoji} {r.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving || profileLoading}
                            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                                saveSuccess 
                                ? 'bg-green-600 text-white' 
                                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                            }`}
                        >
                            {isSaving ? <Loader className="h-5 w-5 text-white" /> : (
                                saveSuccess ? <><CheckIcon className="h-5 w-5" /> Guardado</> : 'Guardar Perfil'
                            )}
                        </button>

                        {/* Admin Button (Secret - Visible for Owner and Admins) */}
                        {canAccessAdminPanel && (
                            <button
                                onClick={() => setShowAdmin(true)}
                                className="w-full py-2 bg-red-900/20 border border-red-900/50 text-red-400 hover:text-white hover:bg-red-900/50 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors"
                            >
                                🛡️ Abrir Panel Admin {isOwner ? '(Owner)' : ''}
                            </button>
                        )}

                        <div className="border-t border-slate-800 pt-4 mt-2">
                            <button 
                                onClick={onLogout}
                                className="w-full py-2 text-sm text-red-400 hover:text-red-300 font-semibold hover:bg-red-900/10 rounded-lg transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Render Admin Dashboard on top if active, passing isOwner prop */}
            <AdminDashboard 
                isOpen={showAdmin} 
                onClose={() => setShowAdmin(false)} 
                isOwner={isOwner} 
                onLoadGame={(id, asOwner) => {
                    // Close both modals and trigger load
                    setShowAdmin(false);
                    onClose();
                    onLoadGame(id, asOwner);
                }}
            />
        </>
    );
};

export default UserProfileModal;
