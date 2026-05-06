import { type FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProcessHeader } from '../../components/ProcessHeader';
import { BidDecisionsView } from './BidDecisionsView';
import ClaimedTendersView from './ClaimedTendersView';
import { BidReviewView } from './BidReviewView';
import { StandardSubNavigation, StandardSubNavigationItem } from '../../components/StandardSubNavigation';
import { featureFlags } from '../../config/featureFlags';

export const BidGovernanceApp: FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine active tab based on path
    const getActiveTab = () => {
        if (location.pathname.includes('/review')) return 'review';
        if (location.pathname.includes('/claimed')) return 'claimed';
        // Default behavior if we just hit /bid-governance/
        return 'review';
    };

    const activeTab = getActiveTab();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <ProcessHeader
                activeItem="governance"
                dbMode="cosmos"
            />
            <StandardSubNavigation>
                <StandardSubNavigationItem
                    label="Review Stream"
                    active={activeTab === 'review'}
                    onClick={() => navigate('/bid-governance/review')}
                />
                {featureFlags.governanceClaimedTenders && (
                    <StandardSubNavigationItem
                        label="Claimed Tenders"
                        active={activeTab === 'claimed'}
                        onClick={() => navigate('/bid-governance/claimed')}
                    />
                )}
            </StandardSubNavigation>

            {activeTab === 'review' && <BidReviewView />}
            {activeTab === 'claimed' && featureFlags.governanceClaimedTenders && <ClaimedTendersView />}
        </div>
    );
};
