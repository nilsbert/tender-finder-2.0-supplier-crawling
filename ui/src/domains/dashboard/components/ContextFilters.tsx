import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {PFlex, PText, PTag, PIcon, PHeading, PButton} from '@porsche-design-system/components-react';
import { distributingApi } from '../../distributing/api/distributingApi';
import type { DistributionOffice } from '../../distributing/api/distributingApi';
import { taxonomyApi, Label } from '../../taxonomy/taxonomyApi';
import { useTranslation } from 'react-i18next';

export interface ContextFiltersProps {
    officeIds: string[];
    setOfficeIds: (ids: string[]) => void;
    sectorIds: string[];
    setSectorIds: (ids: string[]) => void;
    serviceIds: string[];
    setServiceIds: (ids: string[]) => void;
    sourceFilter: 'all' | 'manual' | 'crawled';
    setSourceFilter: (source: 'all' | 'manual' | 'crawled') => void;
    statusFilter?: string;
    setStatusFilter?: (status: string) => void;
}

export const ContextFilters: FC<ContextFiltersProps> = ({
    officeIds, setOfficeIds,
    sectorIds, setSectorIds,
    serviceIds, setServiceIds,
    sourceFilter, setSourceFilter,
    statusFilter, setStatusFilter
}) => {
    const { t } = useTranslation();
    const [offices, setOffices] = useState<DistributionOffice[]>([]);
    const [labels, setLabels] = useState<Label[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const fetchMetadata = async () => {
            setLoading(true);
            try {
                const [officesRes, labelsRes] = await Promise.all([
                    distributingApi.getOffices(),
                    taxonomyApi.getLabels(true)
                ]);
                setOffices(officesRes || []);
                setLabels(labelsRes || []);
            } catch (e) {
                console.error("Failed to fetch filter metadata", e);
            } finally {
                setLoading(false);
            }
        };
        fetchMetadata();
    }, []);

    const toggleId = (currentIds: string[], setId: (ids: string[]) => void, id: string) => {
        if (currentIds.includes(id)) {
            setId(currentIds.filter(i => i !== id));
        } else {
            setId([...currentIds, id]);
        }
    };

    if (loading) return null;

    const FilterSection = ({
        title,
        items,
        selectedIds,
        onToggle,
        icon
    }: {
        title: string,
        items: { id: string, name: string }[],
        selectedIds: string[],
        onToggle: (id: string) => void,
        icon: any
    }) => (
        <div style={{ marginBottom: '1.5rem' }}>
            <PFlex alignItems="center" style={{ marginBottom: '0.5rem', gap: '8px' }}>
                <PIcon name={icon} size="small" />
                <PText weight="bold" size="small">{title}</PText>
            </PFlex>
            <PFlex wrap="wrap" style={{ gap: '8px' }}>
                {items.length === 0 && <PText size="x-small" color="contrast-medium">No options available</PText>}
                {items.map(item => (
                    <PTag
                        key={item.id}
                        color={selectedIds.includes(item.id) ? 'primary' : 'background-surface'}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => onToggle(item.id)}
                    >
                        {item.name}
                    </PTag>
                ))}
            </PFlex>
        </div>
    );

    const sectors = labels.filter(l => l.type === 'SECTOR' && l.active);
    const services = labels.filter(l => l.type === 'SERVICE' && l.active);
    const activeOffices = offices.filter(o => o.active);

    // Get active filter names
    const activeOfficeNames = activeOffices.filter(o => officeIds.includes(o.id)).map(o => o.name);
    const activeSectorNames = sectors.filter(s => sectorIds.includes(s.id)).map(s => s.name);
    const activeServiceNames = services.filter(s => serviceIds.includes(s.id)).map(s => s.name);

    // For source filter badges: only show if one specific source is selected (not both)
    const activeSourceName = sourceFilter !== 'all' ? t(`common.${sourceFilter}`) : null;

    let activeStatusName = null;
    if (statusFilter === 'open') activeStatusName = t('dashboard.filters.status_open');
    if (statusFilter === 'contract_information') activeStatusName = t('dashboard.filters.status_closed');
    if (statusFilter === 'all') activeStatusName = t('dashboard.filters.status_all');

    const hasActiveFilters = officeIds.length > 0 || sectorIds.length > 0 || serviceIds.length > 0 || !!activeStatusName;

    return (
        <div style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            marginBottom: '2rem'
        }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: isExpanded ? '1.5rem' : '0',
                    cursor: 'pointer'
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <PFlex alignItems="center" style={{ gap: '12px', flexWrap: 'wrap' }}>
                    <PFlex alignItems="center" style={{ gap: '8px' }}>
                        <PHeading size="small">{t('dashboard.filters.context_title') || 'Context Filters'}</PHeading>
                        <PIcon name={isExpanded ? 'arrow-head-up' : 'arrow-head-down'} size="small" />
                    </PFlex>
                    {!isExpanded && hasActiveFilters && (
                        <PFlex wrap="wrap" style={{ gap: '6px' }}>
                            {activeOfficeNames.map(name => (
                                <PTag key={name} color="primary">{name}</PTag>
                            ))}
                            {activeSectorNames.map(name => (
                                <PTag key={name} color="primary">{name}</PTag>
                            ))}
                            {activeServiceNames.map(name => (
                                <PTag key={name} color="primary">{name}</PTag>
                            ))}
                            {activeSourceName && (
                                <PTag color="primary">{activeSourceName}</PTag>
                            )}
                            {activeStatusName && (
                                <PTag color="primary">{activeStatusName}</PTag>
                            )}
                        </PFlex>
                    )}
                </PFlex>
            </div>

            {isExpanded && (
                <>
                    {statusFilter && setStatusFilter && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <PFlex alignItems="center" style={{ marginBottom: '0.5rem', gap: '8px' }}>
                                <PIcon name="information" size="small" />
                                <PText weight="bold" size="small">{t('dashboard.filters.status') || 'Status'}</PText>
                            </PFlex>
                            <PFlex wrap="wrap" style={{ gap: '8px' }}>
                                <PTag
                                    color={statusFilter === 'open' ? 'primary' : 'background-surface'}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                    onClick={() => setStatusFilter('open')}
                                >
                                    {t('dashboard.filters.status_open')}
                                </PTag>
                                <PTag
                                    color={statusFilter === 'contract_information' ? 'primary' : 'background-surface'}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                    onClick={() => setStatusFilter('contract_information')}
                                >
                                    {t('dashboard.filters.status_closed')}
                                </PTag>
                                <PTag
                                    color={statusFilter === 'all' ? 'primary' : 'background-surface'}
                                    style={{ cursor: 'pointer', userSelect: 'none' }}
                                    onClick={() => setStatusFilter('all')}
                                >
                                    {t('dashboard.filters.status_all')}
                                </PTag>
                            </PFlex>
                        </div>
                    )}

                    <FilterSection
                        title={t('dashboard.filters.offices') || 'Offices'}
                        items={activeOffices}
                        selectedIds={officeIds}
                        onToggle={(id) => toggleId(officeIds, setOfficeIds, id)}
                        icon="location"
                    />

                    <FilterSection
                        title={t('dashboard.filters.sectors') || 'Sectors'}
                        items={sectors}
                        selectedIds={sectorIds}
                        onToggle={(id) => toggleId(sectorIds, setSectorIds, id)}
                        icon="tools"
                    />

                    <FilterSection
                        title={t('dashboard.filters.services') || 'Services'}
                        items={services}
                        selectedIds={serviceIds}
                        onToggle={(id) => toggleId(serviceIds, setServiceIds, id)}
                        icon="tag"
                    />

                    <div style={{ marginBottom: '1.5rem' }}>
                        <PFlex alignItems="center" style={{ marginBottom: '0.5rem', gap: '8px' }}>
                            <PIcon name="list" size="small" />
                            <PText weight="bold" size="small">{t('dashboard.filters.source') || 'Source'}</PText>
                        </PFlex>
                        <PFlex wrap="wrap" style={{ gap: '8px' }}>
                            <PTag
                                color={sourceFilter === 'manual' ? 'primary' : 'background-surface'}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                onClick={() => setSourceFilter('manual')}
                            >
                                {t('common.manual')}
                            </PTag>
                            <PTag
                                color={sourceFilter === 'crawled' ? 'primary' : 'background-surface'}
                                style={{ cursor: 'pointer', userSelect: 'none' }}
                                onClick={() => setSourceFilter('crawled')}
                            >
                                {t('common.crawled')}
                            </PTag>
                        </PFlex>
                    </div>

                    {hasActiveFilters && (
                        <PButton
                            variant="tertiary"
                            icon="reset"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOfficeIds([]);
                                setSectorIds([]);
                                setServiceIds([]);
                                if (setStatusFilter) setStatusFilter('open');
                            }}
                            style={{ marginTop: '0.5rem' }}
                        >
                            {t('common.reset_filters') || 'Reset Context Filters'}
                        </PButton>
                    )}
                </>
            )}
        </div>
    );
};
