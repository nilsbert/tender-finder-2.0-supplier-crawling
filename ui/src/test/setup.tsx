import { expect } from 'vitest'
import { vi } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with @testing-library/jest-dom matchers
expect.extend(matchers)

// Mock IntersectionObserver
class IntersectionObserverMock {
  root = null;
  rootMargin = "";
  thresholds = [];
  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn();
  unobserve = vi.fn();
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

// Explicitly mock the components used in the app
vi.mock('@porsche-design-system/components-react', () => ({
  PButton: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
  PHeading: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  PText: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  PIcon: ({ name, ...props }: any) => <span data-testid="p-icon" data-name={name} {...props} />,
  PDivider: (props: any) => <hr {...props} />,
  PSpinner: () => <div data-testid="p-spinner">Loading...</div>,
  PFlex: ({ children, ...props }: any) => {
    const { justifyContent, alignItems, ...rest } = props;
    return <div style={{ display: 'flex', justifyContent, alignItems, ...rest.style }} {...rest}>{children}</div>
  },
  PFlexItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  PTag: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  PContentWrapper: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  PSelectWrapper: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  PTextFieldWrapper: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))
