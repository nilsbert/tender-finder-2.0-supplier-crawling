import React from 'react';
import {PFlex,
    PSelectWrapper} from '@porsche-design-system/components-react';

interface RatingFilterProps {
    ratingMin: number | null;
    onRatingMinChange: (val: number | null) => void;
    typeFilter: string;
    onTypeChange: (val: string) => void;
    subTypeFilter: string;
    onSubTypeChange: (val: string) => void;
    keywordTree: Record<string, string[]>;
}

export const RatingFilter: React.FC<RatingFilterProps> = ({
    ratingMin,
    onRatingMinChange,
    typeFilter,
    onTypeChange,
    subTypeFilter,
    onSubTypeChange,
    keywordTree
}) => {
    return (
        <PFlex direction="column" style={{ width: '100%' }}>
            <PFlex style={{ gap: '24px' }} alignItems="center" wrap="wrap">
                <div style={{ width: '160px' }}>
                    <PSelectWrapper label="Min Rating Score" hideLabel>
                        <select
                            value={ratingMin ?? ''}
                            onChange={e => onRatingMinChange(e.target.value ? parseFloat(e.target.value) : null)}
                            style={{ fontSize: '14px', height: '42px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                        >
                            <option value="">Any Score</option>
                            <option value="0">Positive (0+)</option>
                            <option value="10">Targeted (10+)</option>
                            <option value="20">Strategic (20+)</option>
                            <option value="30">Priority (30+)</option>
                            <option value="50">High Value (50+)</option>
                        </select>
                    </PSelectWrapper>
                </div>

                <div style={{ width: '160px' }}>
                    <PSelectWrapper label="Tag Type" hideLabel>
                        <select
                            value={typeFilter}
                            onChange={e => onTypeChange(e.target.value)}
                            style={{ fontSize: '14px', height: '42px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                        >
                            <option value="">All Tag Types</option>
                            <option value="Service">Service</option>
                            <option value="Sector">Sector</option>
                        </select>
                    </PSelectWrapper>
                </div>

                <div style={{ width: '240px' }}>
                    <PSelectWrapper label="Sub-type / Category" hideLabel>
                        <select
                            value={subTypeFilter}
                            onChange={e => onSubTypeChange(e.target.value)}
                            style={{ fontSize: '14px', height: '42px', padding: '0 12px', border: '1px solid #ddd', borderRadius: '4px', width: '100%' }}
                        >
                            <option value="">Filter by Category...</option>
                            {Object.entries(keywordTree).sort(([a], [b]) => {
                                // Sort: Service first, then Sector, then others
                                if (a === 'Service') return -1;
                                if (b === 'Service') return 1;
                                if (a === 'Sector') return -1;
                                if (b === 'Sector') return 1;
                                return a.localeCompare(b);
                            }).map(([type, subtypes]) => (
                                <optgroup key={type} label={type === 'Service' ? 'Services' : type === 'Sector' ? 'Sectors' : type}>
                                    {subtypes.filter(st => st !== 'Unassigned').map(subtype => (
                                        <option key={`${type}-${subtype}`} value={subtype}>
                                            {subtype}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </PSelectWrapper>
                </div>
            </PFlex>
        </PFlex>
    );
};
