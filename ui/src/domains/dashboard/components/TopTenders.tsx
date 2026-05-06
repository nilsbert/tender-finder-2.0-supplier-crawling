import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {PHeading, PText, PGrid, PGridItem, PTag} from '@porsche-design-system/components-react';
import { dashboardApi } from '../api';
import type { TopTendersResponse } from '../api';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

export interface TopTendersProps {
    source?: string;
    searchText?: string;
    officeIds?: string[];
    sectorIds?: string[];
    serviceIds?: string[];
    statusFilter?: string;
}

export const TopTenders: FC<TopTendersProps> = ({
    source,
    searchText,
    officeIds,
    sectorIds,
    serviceIds,
    statusFilter
}) => {
    const { t } = useTranslation();
    const [data, setData] = useState<TopTendersResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await dashboardApi.getTopTenders(
                    source,
                    searchText,
                    officeIds,
                    sectorIds,
                    serviceIds,
                    statusFilter
                );
                setData(result);
            } catch (e) {
                console.error("Failed to fetch top tenders", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [source, searchText, officeIds, sectorIds, serviceIds, statusFilter]);

    if (loading) return <PText>{t('dashboard.top_tenders.loading')}</PText>;
    if (!data) return <PText>{t('dashboard.top_tenders.no_data')}</PText>;

    const TenderList = ({ tenders = [], title }: { tenders: any[], title: string }) => (
        <div style={{ height: '100%' }}>
            <PHeading size="medium" style={{ marginBottom: '1rem' }}>{title}</PHeading>
            {!tenders || tenders.length === 0 ? (
                <PText color="contrast-medium">{t('dashboard.top_tenders.no_tenders')}</PText>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tenders.map((tender) => (
                        <Link
                            key={tender.id}
                            to={`/tenders/${tender.id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <div style={{
                                padding: '12px',
                                background: '#fff',
                                border: '1px solid #e0e0e0',
                                borderRadius: '4px',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <PTag color="notification-info-soft" icon="calendar">{new Date(tender.published || tender.crawl_time).toLocaleDateString()}</PTag>
                                    <PText weight="bold" color="notification-success">{Math.round(tender.rating_total)} Scoring</PText>
                                </div>
                                <PText weight="semi-bold" style={{ marginBottom: '4px' }}>{tender.headline}</PText>
                                <PText size="small" color="contrast-medium">{tender.caller || tender.name_website}</PText>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <PGrid>
            <PGridItem size={4}>
                <TenderList tenders={data.top_today} title={t('dashboard.top_tenders.top_10_today')} />
            </PGridItem>
            <PGridItem size={4}>
                <TenderList tenders={data.top_week} title={t('dashboard.top_tenders.top_10_week')} />
            </PGridItem>
            <PGridItem size={4}>
                <TenderList tenders={data.top_month} title={t('dashboard.top_tenders.top_10_month')} />
            </PGridItem>
        </PGrid>
    );
};
