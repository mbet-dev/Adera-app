import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import GestureHandlerRootViewContext from '../GestureHandlerRootViewContext';
export default function GestureHandlerRootView({ style, ...rest }) {
    return (<GestureHandlerRootViewContext.Provider value>
      <View style={style ?? styles.container} {...rest}/>
    </GestureHandlerRootViewContext.Provider>);
}
const styles = StyleSheet.create({
    container: { flex: 1 },
});
