# What is the react-svg-map-colorizer?
This is React component which allows to use SVG maps. 

SVG maps are special SVG images which consists of elements with provided id, so when loaded to DOM as `<svg>` element it possible to select the particular element and set it `fill` or `stroke` property to highlight this element on resulted image.

The `react-svg-map-colorizer` not just hide DOM manipulations on SVG element within beauty Component interface but indeed utilizes React for rendering the entire DOM subtree, so benefit from power of VDOM and batched DOM updates which the React does.

# When to use this component?
1. If you have React based app, you likely want just declare you layout and not worry about underlying DOM manipulations like loading SVG not to `<img>` but to `<svg>` which support per element changes.
2. If you image contains a lot of elements and it expected to update a lot doing this directly per element basis could be slow. The component can do batched updates, so works good enough even when updating thousands of elements. So it might worth to include the component (and React dependencies) for such task even to non React app, so that avoid mess of manually tackling with diffs and batch updates.

# What are the limitations?
1. Currently there is support for highlighting the specified primitives with one color and filling left with another color.

2. Implementation requires the place for `mounting` the React tree. So SVG image format is restricted to one, where all primitives which need updates should be included into `<g id="data">` svg group. It also expected that aforementioned group will contain only supported primitives.
   1. Here is the list of supported primitives
      1. polygon
	  2. rect
	  3. circle
	  4. ellipse
	  5. line
	  6. polyline
	  7. path

3. For lines colorization happen for `stroke` property and for shapes for `fill` property, path is special case as can be both, so whether alter `stroke` or `fill` decided based on initial value for `fill` (if visible than it would `fill`).

# How to use the component?
### Within React app
```tsx
import * as React from "react";
import { Svg } from "react-svg-map-colorizer";


function MyComponentNeedSvg {
	const svgProps = {
		svgUrl: "svgUrl",
		idColorMap: {
			elementId1: "yellow",
			elementId2: "red",
			"*": "green"
		},
		onPrimitiveClick: (id) => console.log(id),
	};

	return  <Svg {...svgProps} />;
}
```
### Within non React app

```ts
import * as ReactDom from "react-dom";
import * as React from "react";
import { Svg } from "react-svg-map-colorizer";

// The place for rendering react svg component.
const svgContainer = document.getElementById("containerId");

// To mount and update component.
function RenderColoredSvg {
	const svgProps = {
		svgUrl: "svgUrl",
		idColorMap: {
			elementId1: "yellow",
			elementId2: "red",
			"*": "green"
		},
		onPrimitiveClick: (id) => console.log(id),
	};


	// it fine to call this each time update needed.
	ReactDom.render(React.createElement(Svg, svgProps), svgContainer);
}

// When you done with svg and need remove container this 
// method should be called to properly cleanup.
function unmountSvgComponent () {
	ReactDom.unmountComponentAtNode(svgContainer);
}
```

### Svg Props description
| Property | Description |
|----------| ----------- |
|`svgUrl`  | The url to svg image. If you have file, you can create one with ` URL.createObjectUrl(file);`, please note to keep the url same for the same image, otherwise new component would created inside which would cause performance degradation for render.|
|`idColorMap`| Dictionary where keys are primitive ids to highlight and values are color, elements which are not listed here would be filled with initial color. The initial color can be overriden by adding special `*` key.|
|`onPrimitiveClick`| The optional callback you may pass to svg. It would be called with primitive id when primitive clicked and related mouse event.|
|`onPrimitiveEnter`| The optional callback which would be called with primitive id and mouse event when mouse enter into primitive.|
|`onPrimitiveLeave`| The optional callback which would be called with primitive id and mouse event when mouse leaves primitive.|
|`onPrimitiveMove`| The optional callback which would be called with primitive id and mouse event when mouse moves in primitive.|
|`onSvgMounted`| The optional callback which called once underlying SVG mounted to the DOM. The component works outside of normal React lifecycle and just provides eventually consistent view representation so in case you need some time dependent work (e.g. use library which manipulated the DOM directly) this is the place to hook.|
