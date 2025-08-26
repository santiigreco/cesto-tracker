
import React, { useMemo } from 'react';
import { Shot } from '../types';

// --- HELPER COMPONENT: ZoneChart ---
type VisualZone = 'ARO' | 'FONDO' | 'CENTRO' | 'MEDIA_DISTANCIA' | 'TRIPLE' | 'IZQUIERDA' | 'DERECHA';

// Classifier function to bucket shots into one of the 7 granular zones, ensuring no overlaps.
const getVisualZoneForShot = (shot: Shot): VisualZone => {
    const { x, y } = shot.position;
    const basketCenter = { x: 10, y: 11 };
    // The distortion factor of the court container (aspect-[4/5]) vs the SVG viewbox (20x16)
    // To calculate distance in a visually circular way, we must scale the y-distance.
    const aspectRatioDistortion = (16 / 20) / (5 / 4); // (viewbox H/W) / (container H/W)
    const distToBasket = Math.sqrt(Math.pow(x - basketCenter.x, 2) + Math.pow((y - basketCenter.y) / aspectRatioDistortion, 2));
    const aroRadius = 2.5;

    // Highest priority: Aro (perfect circle as requested)
    if (distToBasket <= aroRadius) return 'ARO';

    // Then, check by vertical position (y-axis) to partition the rest of the court
    if (y < 1) return 'TRIPLE'; // Three-point area
    if (y < 6) return 'MEDIA_DISTANCIA'; // Full width between 3pt line and free throw line
    if (y > 11) return 'FONDO'; // Baseline zone

    // Remaining area is y between 6 and 11 (free-throw line up to basket area)
    // Partition this area horizontally
    if (x < 7) return 'IZQUIERDA';  // Left side
    if (x > 13) return 'DERECHA';   // Right side
    
    // The central rectangle is the Centro zone
    return 'CENTRO'; // x is between 7 and 13
};


// Configuration for each zone's name and label position (in SVG coordinates)
const zonesConfig: Record<VisualZone, { labelPos: { x: number; y: number }; name: string }> = {
    ARO: { labelPos: { x: 10, y: 5 }, name: "Aro" },
    FONDO: { labelPos: { x: 3.5, y: 2.5 }, name: "Fondo" },
    CENTRO: { labelPos: { x: 10, y: 7.5 }, name: "Centro" },
    MEDIA_DISTANCIA: { labelPos: { x: 10, y: 12.5 }, name: "Media Distancia" },
    TRIPLE: { labelPos: { x: 10, y: 14.8 }, name: "Triple" },
    IZQUIERDA: { labelPos: { x: 3.5, y: 7.5 }, name: "Izquierda" },
    DERECHA: { labelPos: { x: 16.5, y: 7.5 }, name: "Derecha" },
};


const getZoneColor = (goles: number, total: number) => {
    if (total === 0) return 'rgba(107, 114, 128, 0.2)'; // gray-500 for empty
    const percentage = (goles / total); // value from 0 to 1

    // Map the percentage (0-1) to a hue value in the HSL color space.
    // 0 -> Red (Hue: 0)
    // 0.5 -> Yellow (Hue: 60)
    // 1 -> Green (Hue: 120)
    // The mapping is linear: hue = percentage * 120
    const hue = percentage * 120;
    const saturation = 90; // Keep it vibrant
    const lightness = 50;  // Good brightness
    const alpha = 0.6;     // A good level of transparency

    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
};

const ZoneChart: React.FC<{ shots: Shot[] }> = React.memo(({ shots }) => {
    const zoneStats = useMemo(() => {
        const stats: Record<VisualZone, { goles: number; total: number }> = {
            ARO: { goles: 0, total: 0 }, FONDO: { goles: 0, total: 0 }, CENTRO: { goles: 0, total: 0 },
            MEDIA_DISTANCIA: { goles: 0, total: 0 }, TRIPLE: { goles: 0, total: 0 },
            IZQUIERDA: { goles: 0, total: 0 }, DERECHA: { goles: 0, total: 0 },
        };
        shots.forEach(shot => {
            const zone = getVisualZoneForShot(shot);
            stats[zone].total++;
            if (shot.isGol) stats[zone].goles++;
        });
        return stats;
    }, [shots]);
    
    // Note: SVG y-coordinate is inverted from shot data y-coordinate.
    // Conversion: svg_y = 16 - data_y.
    const aroMaskId = "aro-mask";
    
    // To make a circle appear perfectly round in a distorted container (aspect-[4/5]),
    // we must render an ellipse that counteracts the distortion.
    // Distortion = (Container H/W) / (ViewBox H/W) = (5/4) / (16/20) = 1.25 / 0.8 = 1.5625
    // ry = rx / distortion_factor
    const rx = 2.5;
    const ry = 1.6; // 2.5 * ( (4/5) / (20/16) ) = 2.5 * (16/25) = 1.6


    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 20 16" preserveAspectRatio="none">
                <defs>
                    {/* A mask to cut out the 'Aro' ellipse from other zones */}
                    <mask id={aroMaskId}>
                        <rect x="0" y="0" width="20" height="16" fill="white" />
                        <ellipse cx="10" cy="5" rx={rx} ry={ry} fill="black" />
                    </mask>
                </defs>
                
                <g stroke="rgba(255, 255, 255, 0.5)" strokeWidth="0.05">
                    {/* Zones that do NOT need the mask (drawn first) */}
                    {/* Triple Zone (data_y: 0-1 -> svg_y: 15-16) */}
                    <rect x="0" y="15" width="20" height="1" fill={getZoneColor(zoneStats.TRIPLE.goles, zoneStats.TRIPLE.total)} />
                    {/* Media Distancia Zone (data_y: 1-6 -> svg_y: 10-15), full width */}
                    <rect x="0" y="10" width="20" height="5" fill={getZoneColor(zoneStats.MEDIA_DISTANCIA.goles, zoneStats.MEDIA_DISTANCIA.total)} />

                    {/* Masked Zones (These are all under/around the basket area) */}
                    <g mask={`url(#${aroMaskId})`}>
                        {/* Fondo Zone (data_y: 11-16 -> svg_y: 0-5) */}
                        <rect x="0" y="0" width="20" height="5" fill={getZoneColor(zoneStats.FONDO.goles, zoneStats.FONDO.total)} />
                        {/* Centro Zone (data_y: 6-11 -> svg_y: 5-10, x: 7-13) */}
                        <rect x="7" y="5" width="6" height="5" fill={getZoneColor(zoneStats.CENTRO.goles, zoneStats.CENTRO.total)} />
                        {/* Izquierda Zone (data_y: 6-11 -> svg_y: 5-10, x: 0-7) */}
                        <rect x="0" y="5" width="7" height="5" fill={getZoneColor(zoneStats.IZQUIERDA.goles, zoneStats.IZQUIERDA.total)} />
                        {/* Derecha Zone (data_y: 6-11 -> svg_y: 5-10, x: 13-20) */}
                        <rect x="13" y="5" width="7" height="5" fill={getZoneColor(zoneStats.DERECHA.goles, zoneStats.DERECHA.total)} />
                    </g>

                    {/* Aro Zone (drawn on top of everything, no mask needed) */}
                    <ellipse cx="10" cy="5" rx={rx} ry={ry} fill={getZoneColor(zoneStats.ARO.goles, zoneStats.ARO.total)} />
                </g>

                {/* Text labels (drawn last to be on top) */}
                {Object.entries(zonesConfig).map(([zoneKey, config]) => {
                    const zone = zoneKey as VisualZone;
                    const stats = zoneStats[zone];
                    const percentage = stats.total > 0 ? (stats.goles / stats.total) * 100 : 0;
                    const hasShots = stats.total > 0;
                    const isCompactZone = zone === 'CENTRO' || zone === 'MEDIA_DISTANCIA' || zone === 'FONDO' || zone === 'TRIPLE';

                    return (
                        <text
                            key={zone}
                            x={config.labelPos.x}
                            y={config.labelPos.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="white"
                            fontSize={isCompactZone ? "0.7" : "0.8"}
                            fontWeight="bold"
                            className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                        >
                            <tspan x={config.labelPos.x} dy={hasShots ? "-0.6em" : "0"}>{config.name}</tspan>
                            {hasShots && (
                                <>
                                    <tspan x={config.labelPos.x} dy="1.2em" fontSize={isCompactZone ? "0.9" : "1"} fontWeight="bold" fontFamily="monospace">
                                        {`${stats.goles}/${stats.total}`}
                                    </tspan>
                                    <tspan x={config.labelPos.x} dy="1.1em" fontSize="0.7" fill="rgba(209, 213, 219, 1)">
                                        {`${percentage.toFixed(0)}%`}
                                    </tspan>
                                </>
                            )}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
});

export default ZoneChart;