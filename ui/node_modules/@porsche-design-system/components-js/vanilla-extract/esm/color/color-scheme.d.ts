export declare const colorSchemeStyles: ({
    selector: string;
    rule: {
        colorScheme: string;
        '@supports'?: undefined;
    };
} | {
    selector: string;
    rule: {
        '@supports': {
            'not (color: light-dark(white, black))': {
                '--_color-focus': string;
                '--_color-canvas': string;
                '--_color-surface': string;
                '--_color-frosted': string;
                '--_color-frosted-soft': string;
                '--_color-frosted-strong': string;
                '--_color-backdrop': string;
                '--_color-contrast-lower': string;
                '--_color-contrast-low': string;
                '--_color-contrast-medium': string;
                '--_color-contrast-high': string;
                '--_color-contrast-higher': string;
                '--_color-primary': string;
                '--_color-success': string;
                '--_color-success-low': string;
                '--_color-success-medium': string;
                '--_color-success-frosted': string;
                '--_color-success-frosted-soft': string;
                '--_color-warning': string;
                '--_color-warning-low': string;
                '--_color-warning-medium': string;
                '--_color-warning-frosted': string;
                '--_color-warning-frosted-soft': string;
                '--_color-error': string;
                '--_color-error-low': string;
                '--_color-error-medium': string;
                '--_color-error-frosted': string;
                '--_color-error-frosted-soft': string;
                '--_color-info': string;
                '--_color-info-low': string;
                '--_color-info-medium': string;
                '--_color-info-frosted': string;
                '--_color-info-frosted-soft': string;
            };
        };
        colorScheme?: undefined;
    };
} | {
    selector: string;
    rule: {
        '@supports': {
            'not (color: light-dark(white, black))': {
                '@media': {
                    '(prefers-color-scheme: dark)': {
                        '--_color-focus': string;
                        '--_color-canvas': string;
                        '--_color-surface': string;
                        '--_color-frosted': string;
                        '--_color-frosted-soft': string;
                        '--_color-frosted-strong': string;
                        '--_color-backdrop': string;
                        '--_color-contrast-lower': string;
                        '--_color-contrast-low': string;
                        '--_color-contrast-medium': string;
                        '--_color-contrast-high': string;
                        '--_color-contrast-higher': string;
                        '--_color-primary': string;
                        '--_color-success': string;
                        '--_color-success-low': string;
                        '--_color-success-medium': string;
                        '--_color-success-frosted': string;
                        '--_color-success-frosted-soft': string;
                        '--_color-warning': string;
                        '--_color-warning-low': string;
                        '--_color-warning-medium': string;
                        '--_color-warning-frosted': string;
                        '--_color-warning-frosted-soft': string;
                        '--_color-error': string;
                        '--_color-error-low': string;
                        '--_color-error-medium': string;
                        '--_color-error-frosted': string;
                        '--_color-error-frosted-soft': string;
                        '--_color-info': string;
                        '--_color-info-low': string;
                        '--_color-info-medium': string;
                        '--_color-info-frosted': string;
                        '--_color-info-frosted-soft': string;
                    };
                };
            };
        };
        colorScheme?: undefined;
    };
})[];
