import * as React from "react";
import * as ReactDom from "react-dom";
import { SvgPrimitiveRenderer } from "./SvgPrimitiveRenderer";
import { SvgPrimitiveDesription } from "./Parser/ParserInterfaces";
import { parseSvgGroup } from "./Parser/SvgBaseElementsParser";

/**
 * Describes the SvgRenderer props.
 */
interface SvgRendererProps
{
    /**
     * Url for svg to be loaded into DOM and managed with React.
     */
    svgUrl: string;
    /**
     * List of svg primitive IDs we want to be highlighted with SelectedColor.
     */
    selectedIds?: string[];
    /**
     * Color for elements listed in selectedIds.
     */
    selectedColor: string;
    /**
     * Color for elements which are not listed in selectedIds.
     */
    defaultColor: string;
    /**
     * Allows to specify on click handler for primitive.
     * For performance reason it better keep the ref if behaves the same.
     */
    onPrimitiveClick?: (id: string) => any;
}

/**
 * Helper class needed to load svg as svgElement and manage its content with React.
 */
class SvgRenderer extends React.Component<SvgRendererProps, {}>
{
    /**
     * Reference to svg element which is the root of DOM tree for this component.
     */
    private svgRef = React.createRef<SVGSVGElement>();
    /**
     * DOM <g> svg group where we expect real updates happened on primitives color.
     */
    private primitivesGroup: SVGGElement;
    /**
     * Parsed from real svg metadata which describes the primitive. Needed to provide this info to React.
     */
    private primitives: SvgPrimitiveDesription[] = [];

    render()
    {
        // setting dangerouslySetInnerHTML helps avoid React look into container https://github.com/facebook/react/issues/10923#issuecomment-338715787
        // basically we just render the root and going to manage content in separate lifecycle methods.
        return <svg ref={this.svgRef} dangerouslySetInnerHTML={{ __html: "" }}></svg>
    }

    componentDidUpdate()
    {
        // Searching in object is O(1) while in array is O(n) so we remap to increase the scripting performance of underlying SvgPrimitiveRenderer.
        let selectedIds = {};
        if (this.props.selectedIds)
        {
            this.props.selectedIds.forEach(id => selectedIds[id] = true);
        }
        ReactDom.render(<SvgPrimitiveRenderer
            primitives={this.primitives}
            fillSelected={this.props.selectedColor}
            fillNonSelected={this.props.defaultColor}
            selectedIds={selectedIds}
            onPrimitiveClick={this.props.onPrimitiveClick}
        />, this.primitivesGroup);
    }

    componentDidMount()
    {
        fetch(this.props.svgUrl)
            .then(svgResp => svgResp.text())
            .then(svg =>
            {
                this.populateSvgToDom(svg);
                this.fillSvgMetadata();
                // at this point we have SVG in DOM and attaching React to svg primitives part so that
                // update it further with nice React syntax.
                ReactDom.hydrate(<SvgPrimitiveRenderer
                    primitives={this.primitives}
                    fillSelected={this.props.selectedColor}
                    fillNonSelected={this.props.defaultColor}
                    selectedIds={{}}
                    onPrimitiveClick={this.props.onPrimitiveClick}
                />, this.primitivesGroup);

                this.forceUpdate(); // Triggerring update so that populate exact colors to svg based on our props.
            });
    }

    /**
     * Populates the svg string to DOM with help of vanila js.
     * This is preparation step needed before we can color primitives with react.
     * The reason to have the whole SVG populated, so that keep all other fancy
     * svg staff like images still on the page when only care about primitives updates.
     * @param svg string containing the content for SVG image.
     */
    private populateSvgToDom(svg: string)
    {
        const svgElement = this.htmlToElement(svg);
        const currentElement = this.svgRef.current;
        const attrs = svgElement.attributes;
        for (let i = 0; i < attrs.length; i++)
        {
            currentElement.setAttribute(attrs[i].name, attrs[i].value);
        }

        currentElement.innerHTML = svgElement.innerHTML;
    }

    /**
     * Based on initially loaded svg, it fill the primitives metadata array to be further managed with React.
     */
    private fillSvgMetadata()
    {
        this.primitivesGroup = this.svgRef.current.querySelector("g[id='data']"); // WLOG: all SVGs are expected contain named primitives in <g id="data"> element.
        this.primitives = parseSvgGroup(this.primitivesGroup);
    }

    // Helper function needed to convert the html string to element, so that delegate parsing.
    private htmlToElement(html: string)
    {
        const template = document.createElement("template");
        template.innerHTML = html;
        return template.content.firstElementChild;
    }
}

export
{
    SvgRendererProps,
    SvgRenderer,
}