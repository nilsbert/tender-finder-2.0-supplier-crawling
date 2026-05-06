import type { FC } from 'react';
import {PHeading, PText} from '@porsche-design-system/components-react';
import { CrawlerKPIs } from './components/CrawlerKPIs';
import { FunnelSankeyChart } from './components/FunnelSankeyChart';
import { TopTenders } from './components/TopTenders';
import { ContextFilters } from './components/ContextFilters';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useURLState } from '../../hooks/useURLState';

const DashboardView: FC = () => {
    const { t } = useTranslation();
    const [sourceFilter, setSourceFilter] = useURLState<'all' | 'manual' | 'crawled'>('dashboard_source', 'all');
    const [searchInputValue, setSearchInputValue] = useURLState('dashboard_search', '');
    const [debouncedSearchText, setDebouncedSearchText] = useState('');

    // Context Filters
    const [officeIds, setOfficeIds] = useURLState<string[]>('dashboard_offices', []);
    const [sectorIds, setSectorIds] = useURLState<string[]>('dashboard_sectors', []);
    const [serviceIds, setServiceIds] = useURLState<string[]>('dashboard_services', []);
    const [statusFilter, setStatusFilter] = useURLState('dashboard_ai_status', 'open');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchInputValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInputValue]);

    return (
        <div className="p-content-wrapper">
            <div style={{ padding: '2rem 0' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <PHeading size="large">{t('dashboard.title')}</PHeading>
                    <PText color="contrast-medium">{t('dashboard.subtitle')}</PText>
                </div>


                {/* Context Filters Section */}
                <ContextFilters
                    officeIds={officeIds}
                    setOfficeIds={setOfficeIds}
                    sectorIds={sectorIds}
                    setSectorIds={setSectorIds}
                    serviceIds={serviceIds}
                    setServiceIds={setServiceIds}
                    sourceFilter={sourceFilter}
                    setSourceFilter={setSourceFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                <CrawlerKPIs />
                <FunnelSankeyChart />

                <div style={{ marginBottom: '2rem', maxWidth: '400px' }}>
                    <PHeading size="medium" style={{ marginBottom: '1rem' }}>Search</PHeading>
                    <input
                        type="text"
                        placeholder=""
                        value={searchInputValue}
                        onChange={(e) => setSearchInputValue(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            fontSize: '1rem'
                        }}
                    />
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <TopTenders
                        source={sourceFilter === 'all' ? undefined : sourceFilter}
                        searchText={debouncedSearchText || undefined}
                        officeIds={officeIds.length > 0 ? officeIds : undefined}
                        sectorIds={sectorIds.length > 0 ? sectorIds : undefined}
                        serviceIds={serviceIds.length > 0 ? serviceIds : undefined}
                        statusFilter={statusFilter}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
