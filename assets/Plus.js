import * as React from "react"
import Svg, { G, Circle, Path, Defs } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: filter */

const SvgComponent = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" fill="none" {...props} viewBox="0 0 163 163">
    <G filter="url(#a)">
      <Circle cx={50} cy={50} r={50} fill="#ECB039" />
    </G>
    <Circle cx={50} cy={50} r={49.5} stroke="#000" />
    <Path
      fill="#000"
      d="M51.008 23.094a2.54 2.54 0 0 1 2.539 2.539v21.836h21.836a2.54 2.54 0 0 1 0 5.078H53.547v21.836a2.539 2.539 0 0 1-5.078 0V52.547H26.633a2.539 2.539 0 0 1 0-5.078h21.836V25.633a2.54 2.54 0 0 1 2.539-2.54Z"
    />
    <Defs></Defs>
  </Svg>
)
export default SvgComponent
