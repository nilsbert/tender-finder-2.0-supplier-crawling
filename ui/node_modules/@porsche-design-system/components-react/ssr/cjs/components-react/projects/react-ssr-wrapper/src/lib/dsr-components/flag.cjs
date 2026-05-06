'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var minifyCss = require('../../minifyCss.cjs');
var stylesEntry = require('../../../../../../components/dist/styles/esm/styles-entry.cjs');
var utilsEntry = require('../../../../../../components/dist/utils/esm/utils-entry.cjs');

class DSRFlag extends react.Component {
    host;
    render() {
        const style = minifyCss.minifyCss(stylesEntry.getFlagCss(this.props.size));
        return (jsxRuntime.jsx(jsxRuntime.Fragment, { children: jsxRuntime.jsxs("template", { shadowroot: "open", shadowrootmode: "open", children: [jsxRuntime.jsx("style", { dangerouslySetInnerHTML: { __html: style } }), jsxRuntime.jsx("img", { src: utilsEntry.buildFlagUrl(this.props.name), width: 24, height: 24, loading: "lazy", alt: utilsEntry.parseAndGetAriaAttributes(this.props.aria)?.['aria-label'] ?? '' })] }) }));
    }
}

exports.DSRFlag = DSRFlag;
