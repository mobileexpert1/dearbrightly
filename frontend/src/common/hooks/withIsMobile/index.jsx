import React from "react"
import useDeviceDetect from "../useDeviceDetect";

export const withIsMobile = (Component) => {
  return function WrappedComponent(props) {
     const { isMobile } = useDeviceDetect();
    return <Component {...props} isMobile={isMobile} />;
  }
}