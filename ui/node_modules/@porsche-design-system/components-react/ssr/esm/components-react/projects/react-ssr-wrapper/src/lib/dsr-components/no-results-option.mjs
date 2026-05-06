import { jsxs, jsx } from 'react/jsx-runtime';

const NoResultsOption = () => {
    return (jsxs("div", { className: "no-results", "aria-live": "polite", role: "option", children: [jsx("span", { "aria-hidden": "true", children: "\u2013" }), jsx("span", { className: "sr-only", children: "No results found" })] }));
};

export { NoResultsOption };
