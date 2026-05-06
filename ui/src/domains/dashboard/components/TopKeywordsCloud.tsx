import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {PHeading, PText} from '@porsche-design-system/components-react';
import { dashboardApi } from '../api';

interface KeywordStat {
    term: string;
    count: number;
    category: string;
}

import { useTranslation } from 'react-i18next';

export const TopKeywordsCloud: FC = () => {
    const { t } = useTranslation();
    const [keywords, setKeywords] = useState<KeywordStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await dashboardApi.getTopKeywords(30);
                setKeywords(data);
            } catch (error) {
                console.error("Failed to fetch top keywords", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div style={{ padding: '0px' }}>
            <PHeading size="medium" style={{ marginBottom: '1rem' }}>{t('dashboard.top_keywords.title')}</PHeading>

            {loading ? (
                <PText>{t('dashboard.top_keywords.loading')}</PText>
            ) : (!keywords || keywords.length === 0) ? (
                <PText color="contrast-medium">{t('dashboard.top_keywords.no_data')}</PText>
            ) : (
                <>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px',
                        background: '#f9f9f9',
                        borderRadius: '8px',
                        minHeight: '200px'
                    }}>
                        {keywords.map((kw, idx) => {
                            const size = getSize(kw.count);
                            const color = getCategoryColor(kw.category || 'Unknown');

                            return (
                                <div
                                    key={idx}
                                    title={`${kw.term}\nMatches: ${kw.count}\nCategory: ${kw.category}`}
                                    style={{
                                        fontSize: `${size}px`,
                                        fontWeight: kw.count > (maxCount * 0.7) ? 'bold' : 'normal',
                                        color: color,
                                        cursor: 'help',
                                        transition: 'all 0.2s ease',
                                        padding: '4px 8px',
                                        userSelect: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        e.currentTarget.style.zIndex = '10';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.zIndex = '1';
                                    }}
                                >
                                    {kw.term}
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {/* Legend (Top 5 categories) */}
                        {Array.from(new Set(keywords.map(k => k.category || 'Unknown'))).slice(0, 5).map(cat => (
                            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getCategoryColor(cat) }} />
                                <PText size="x-small" color="contrast-medium">{cat}</PText>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
