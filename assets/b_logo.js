import * as React from "react"
import Svg, { Path, G, Defs } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const BLOGO = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" fill="none" {...props} viewBox="0 0 1900 2300">
    <Path
      fill="#A7C7E7"
      d="M665 196H211L9 372.5v824l202 185h454l319.5 252V19.5L665 196ZM1085.5 1633.5V19.5L1455 196h446l168 176.5v824l-168 185h-446l-369.5 252Z"
    />
    <Path
      stroke="#41C0E0"
      strokeWidth={18}
      d="M665 196H211L9 372.5v824l202 185h454l319.5 252V19.5L665 196ZM1085.5 1633.5V19.5L1455 196h446l168 176.5v824l-168 185h-446l-369.5 252Z"
    />
    <G fill="#AEE1D9" filter="url(#a)">
      <Path d="M994 826 556.5 557 10 826v378.5l202 185h462.5L994 1633V826ZM1433.5 191l-344-176v811l448 190.5L2067 826V376l-163.5-185h-470Z" />
    </G>
    <Path
      stroke="#41C0E0"
      strokeWidth={18}
      d="M994 826 556.5 557 10 826v378.5l202 185h462.5L994 1633V826ZM1433.5 191l-344-176v811l448 190.5L2067 826V376l-163.5-185h-470Z"
    />
    <Defs></Defs>
  </Svg>
)
export default BLOGO ;
