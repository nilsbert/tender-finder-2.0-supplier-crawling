import React from 'react';
import {PHeading,
    PText,
    PButton,
    
    PFlex,
    PFlexItem,
    PIcon} from '@porsche-design-system/components-react';

const AccessRestricted: React.FC = () => {
    return (
        <div className="p-content-wrapper" style={{ paddingTop: '5rem', textAlign: 'center' }}>
            <PFlex direction="column" alignItems="center" style={{ gap: '24px' }}>
                <PFlexItem>
                    <PIcon name="lock" color="notification-error" size="large" />
                </PFlexItem>
                <PFlexItem>
                    <PHeading size="large" tag="h1">Access Restricted</PHeading>
                </PFlexItem>
                <PFlexItem style={{ maxWidth: '600px' }}>
                    <PText size="large" weight="semi-bold">Your account has been successfully authenticated, but you are not yet authorized to access this system.</PText>
                    <PText style={{ marginTop: '1rem' }}>We operate a strict whitelist policy. Your login request has been recorded and an administrator has been notified. They will review your request and grant access if appropriate.</PText>
                </PFlexItem>
                <PFlexItem>
                    <PFlex style={{ gap: '16px' }}>
                        <PFlexItem>
                            <PButton variant="primary" onClick={() => window.location.href = '/'}>Return to Home</PButton>
                        </PFlexItem>
                        <PFlexItem>
                            <PButton variant="tertiary" onClick={() => window.location.href = 'mailto:nilshyoma@gmail.com'}>Contact Support</PButton>
                        </PFlexItem>
                    </PFlex>
                </PFlexItem>
            </PFlex>
        </div>
    );
};

export default AccessRestricted;
