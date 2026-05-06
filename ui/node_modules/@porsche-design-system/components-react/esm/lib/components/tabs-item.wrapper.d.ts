import type { BaseProps } from '../../BaseProps';
export type PTabsItemProps = BaseProps & {
    /**
     * Defines the label used in tabs.
     */
    label: string;
};
export declare const PTabsItem: import("react").ForwardRefExoticComponent<Omit<import("react").DOMAttributes<{}>, "onChange" | "onInput" | "onToggle"> & Pick<import("react").HTMLAttributes<{}>, "suppressHydrationWarning" | "autoFocus" | "className" | "dir" | "hidden" | "id" | "inert" | "lang" | "slot" | "style" | "tabIndex" | "title" | "translate" | "role"> & {
    /**
     * Defines the label used in tabs.
     */
    label: string;
} & {
    children?: import("react").ReactNode | undefined;
} & import("react").RefAttributes<HTMLElement>>;
