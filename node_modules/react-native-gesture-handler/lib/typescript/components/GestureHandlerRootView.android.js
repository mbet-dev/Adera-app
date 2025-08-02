import * as React from 'react';
import { StyleSheet } from 'react-native';
import { maybeInitializeFabric } from '../init';
import GestureHandlerRootViewContext from '../GestureHandlerRootViewContext';
import GestureHandlerRootViewNativeComponent from '../specs/RNGestureHandlerRootViewNativeComponent';
export default function GestureHandlerRootView({ style, ...rest }) {
    // Try initialize fabric on the first render, at this point we can
    // reliably check if fabric is enabled (the function contains a flag
    // to make sure it's called only once)
    maybeInitializeFabric();
    return (<GestureHandlerRootViewContext.Provider value>
      <GestureHandlerRootViewNativeComponent style={style ?? styles.container} {...rest}/>
    </GestureHandlerRootViewContext.Provider>);
}
const styles = StyleSheet.create({
    container: { flex: 1 },
});
