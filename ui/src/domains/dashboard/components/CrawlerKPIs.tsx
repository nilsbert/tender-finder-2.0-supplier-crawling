import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {PGrid, PGridItem, PHeading, PText} from '@porsche-design-system/components-react';
import { dashboardApi } from '../api';
import type { FunnelResponse } from '../api';
import { useTranslation } from 'react-i18next';

export const CrawlerKPIs: FC = () => {
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

    if (loading) return <PText>{t('dashboard.kpis.loading')}</PText>;
    if (!data) return <PText>{t('dashboard.kpis.no_data')}</PText>;

    const { funnel } = data;
    const totalCrawled = (funnel.scraped || 0) + (funnel.manual || 0);

    return (
        <div style={{ marginBottom: '2rem' }}>
            <PHeading size="medium" style={{ marginBottom: '1rem' }}>{t('dashboard.kpis.title')}</PHeading>
            <PGrid>
                <PGridItem size={2}>
                    <div style={{ padding: '1rem', background: '#fff', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                        <PText size="small" color="contrast-medium">Numbers of crawled tenders</PText>
                        <PHeading size="large">{totalCrawled}</PHeading>
                    </div>
                </PGridItem>
                <PGridItem size={2}>
                    <div style={{ padding: '1rem', background: '#fff', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                        <PText size="small" color="contrast-medium">Rated</PText>
                        <PHeading size="large">{funnel.rated}</PHeading>
                    </div>
                </PGridItem>
                <PGridItem size={2}>
                    <div style={{ padding: '1rem', background: '#fff', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                        <PText size="small" color="contrast-medium">Enriched</PText>
                        <PHeading size="large">{funnel.enriched}</PHeading>
                    </div>
                </PGridItem>
                <PGridItem size={2}>
                    <div style={{ padding: '1rem', background: '#fff', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                        <PText size="small" color="contrast-medium">Claimed</PText>
                        <PHeading size="large">{funnel.claimed}</PHeading>
                    </div>
                </PGridItem>
                <PGridItem size={2}>
                    <div style={{ padding: '1rem', background: '#fff', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                        <PText size="small" color="contrast-medium">Bidding</PText>
                        <PHeading size="large">{funnel.bidding}</PHeading>
                    </div>
                </PGridItem>
                <PGridItem size={2}>
                    <div style={{ padding: '1rem', background: '#fff', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                        <PText size="small" color="contrast-medium">Won</PText>
                        <PHeading size="large" style={{ color: '#2E7D32' }}>{funnel.won}</PHeading>
                    </div>
                </PGridItem>
            </PGrid>
        </div>
    );
};
