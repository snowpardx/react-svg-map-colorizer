import * as React from "react";
import { SvgPrimitiveMetadata } from "../SvgPrimitiveMetadata";
import { SvgPrimitiveEventHandlers } from "../SvgPrimitiveEventHandlers";

/**
 * Describes the component which able to deal with particular svg element creation and work with react svg element to get props in unified format.
 */
interface SvgPrimitiveDesription
{
	/**
	 * Id of element (the same as in gif supplied).
	 */
	readonly id: string;
	/**
	 * The color of rendered element.
	 */
	readonly initialColor: string;
	/**
	 * Creates new VDOM element based on props.
	 */
	createElement: (color: string, eventHandlers: SvgPrimitiveEventHandlers) => React.ReactSVGElement;
	/**
	 * Gets the unified metadata from VDOM element (particular element need to be the one which created by createElement on this object)
	 */
	getMetadata: (domElement: React.ReactSVGElement) => SvgPrimitiveMetadata;
}

/**
 * Function which attempt to create the primitive description based on real dom node.
 * If function cannot create one, it should return null.
 */
type Parser = (element: SVGElement) => SvgPrimitiveDesription;

export {
	SvgPrimitiveDesription,
	Parser
}