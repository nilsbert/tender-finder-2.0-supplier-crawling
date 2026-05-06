'use strict';

var jsxRuntime = require('react/jsx-runtime');

const NoResultsOption = () => {
    return (jsxRuntime.jsxs("div", { className: "no-results", "aria-live": "polite", role: "option", children: [jsxRuntime.jsx("span", { "aria-hidden": "true", children: "\u2013" }), jsxRuntime.jsx("span", { className: "sr-only", children: "No results found" })] }));
};

exports.NoResultsOption = NoResultsOption;
