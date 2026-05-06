'use strict';

var jsxRuntime = require('react/jsx-runtime');
var splitChildren = require('../../splitChildren.cjs');
var react = require('react');
var minifyCss = require('../../minifyCss.cjs');
var stylesEntry = require('../../../../../../components/dist/styles/esm/styles-entry.cjs');
var utilsEntry = require('../../../../../../components/dist/utils/esm/utils-entry.cjs');

/**
 * @slot {"name": "", "description": "Default slot to render the link label." }
 *
 * @experimental
 */
class DSRDrilldownLink extends react.Component {
    host;
    render() {
        splitChildren.splitChildren(this.props.children);
        const hasSlottedAnchor = this.props.href === undefined;
        const style = minifyCss.minifyCss(stylesEntry.getDrilldownLinkCss(hasSlottedAnchor, this.props.active));
        return (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsxs("template", { shadowroot: "open", shadowrootmode: "open", shadowrootdelegatesfocus: "true", children: [jsxRuntime.jsx("style", { dangerouslySetInnerHTML: { __html: style } }), jsxRuntime.jsx(jsxRuntime.Fragment, { children: hasSlottedAnchor ? (jsxRuntime.jsx("slot", {})) : (jsxRuntime.jsx("a", { href: this.props.href, target: this.props.target, download: this.props.download, rel: this.props.rel, "aria-current": this.props.active ? 'true' : 'false', ...utilsEntry.parseAndGetAriaAttributes(this.props.aria), children: jsxRuntime.jsx("slot", {}) })) })] }), this.props.children] }));
    }
}

exports.DSRDrilldownLink = DSRDrilldownLink;
