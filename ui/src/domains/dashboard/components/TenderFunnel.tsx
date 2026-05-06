import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {PHeading, PText} from '@porsche-design-system/components-react';
import { dashboardApi } from '../api';
import type { FunnelResponse } from '../api';

import { useTranslation } from 'react-i18next';

export const TenderFunnel: FC = () => {
    const { t } = useTranslation();
    const [data, setData] = useState<FunnelResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await dashboardApi.getFunnelStats(7);
                setData(result);
            } catch (e) {
                console.error("Failed to fetch funnel stats", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const funnel = data?.funnel;

    return (
        <div style={{ marginTop: '2rem' }}>
            <PHeading size="medium" style={{ marginBottom: '1rem' }}>{t('dashboard.funnel.title')}</PHeading>

            {loading ? (
                <PText>{t('dashboard.funnel.loading')}</PText>
            ) : !funnel ? (
                <PText color="contrast-medium">{t('dashboard.funnel.no_data')}</PText>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '24px',
                    background: '#f9f9f9',
                    borderRadius: '8px'
                }}>
                    {/* Simplified funnel bars */}
                    {[
                        { label: t('dashboard.funnel.scraped'), count: funnel.scraped, color: '#E0E0E0' },
                        { label: t('dashboard.funnel.analyzed'), count: funnel.analyzed, color: '#BDBDBD' },
                        { label: t('dashboard.funnel.interesting'), count: funnel.interesting, color: '#90CAF9' },
                        { label: t('dashboard.funnel.bidding'), count: funnel.bidding, color: '#4CAF50' },
                        { label: t('dashboard.funnel.won'), count: funnel.won, color: '#FFD700' }
                    ].map((step, idx) => {
                        const maxCount = Math.max(funnel.scraped, 1);
                        const width = `${Math.max((step.count / maxCount) * 100, 5)}%`;

                        return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '100px' }}>
                                    <PText size="x-small" style={{ fontWeight: 'bold' }}>{step.label}</PText>
                                </div>
                                <div style={{ flex: 1, height: '24px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: width,
                                        height: '100%',
                                        background: step.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0 8px',
                                        transition: 'width 0.5s ease'
                                    }}>
                                        <PText size="x-small" style={{ color: '#000', fontWeight: 'bold' }}>{step.count}</PText>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
