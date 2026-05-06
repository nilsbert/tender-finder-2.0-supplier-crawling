import type { DOMAttributes, HTMLAttributes } from 'react';
export type BaseProps = Omit<DOMAttributes<{}>, 'onChange' | 'onInput' | 'onToggle'> & Pick<HTMLAttributes<{}>, 'suppressHydrationWarning' | 'autoFocus' | 'className' | 'dir' | 'hidden' | 'id' | 'inert' | 'lang' | 'slot' | 'style' | 'tabIndex' | 'title' | 'translate' | 'role'>;
