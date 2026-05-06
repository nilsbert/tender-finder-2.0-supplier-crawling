import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock i18n globally for all tests
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));
