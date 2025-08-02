import * as React from 'react';
import { ScrollView as RNScrollView, Switch as RNSwitch, TextInput as RNTextInput, DrawerLayoutAndroid as RNDrawerLayoutAndroid, FlatList as RNFlatList, RefreshControl as RNRefreshControl, } from 'react-native';
import createNativeWrapper from '../handlers/createNativeWrapper';
import { nativeViewProps, } from '../handlers/NativeViewGestureHandler';
import { toArray } from '../utils';
export const RefreshControl = createNativeWrapper(RNRefreshControl, {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
});
const GHScrollView = createNativeWrapper(RNScrollView, {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
});
export const ScrollView = React.forwardRef((props, ref) => {
    const refreshControlGestureRef = React.useRef(null);
    const { refreshControl, waitFor, ...rest } = props;
    return (<GHScrollView {...rest} 
    // @ts-ignore `ref` exists on `GHScrollView`
    ref={ref} waitFor={[...toArray(waitFor ?? []), refreshControlGestureRef]} 
    // @ts-ignore we don't pass `refreshing` prop as we only want to override the ref
    refreshControl={refreshControl
            ? React.cloneElement(refreshControl, {
                // @ts-ignore for reasons unknown to me, `ref` doesn't exist on the type inferred by TS
                ref: refreshControlGestureRef,
            })
            : undefined}/>);
});
export const Switch = createNativeWrapper(RNSwitch, {
    shouldCancelWhenOutside: false,
    shouldActivateOnStart: true,
    disallowInterruption: true,
});
export const TextInput = createNativeWrapper(RNTextInput);
export const DrawerLayoutAndroid = createNativeWrapper(RNDrawerLayoutAndroid, { disallowInterruption: true });
export const FlatList = React.forwardRef((props, ref) => {
    const refreshControlGestureRef = React.useRef(null);
    const { waitFor, refreshControl, ...rest } = props;
    const flatListProps = {};
    const scrollViewProps = {};
    for (const [propName, value] of Object.entries(rest)) {
        // https://github.com/microsoft/TypeScript/issues/26255
        if (nativeViewProps.includes(propName)) {
            // @ts-ignore - this function cannot have generic type so we have to ignore this error
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            scrollViewProps[propName] = value;
        }
        else {
            // @ts-ignore - this function cannot have generic type so we have to ignore this error
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            flatListProps[propName] = value;
        }
    }
    return (
    // @ts-ignore - this function cannot have generic type so we have to ignore this error
    <RNFlatList ref={ref} {...flatListProps} renderScrollComponent={(scrollProps) => (<ScrollView {...{
            ...scrollProps,
            ...scrollViewProps,
            waitFor: [...toArray(waitFor ?? []), refreshControlGestureRef],
        }}/>)} 
    // @ts-ignore we don't pass `refreshing` prop as we only want to override the ref
    refreshControl={refreshControl
            ? React.cloneElement(refreshControl, {
                // @ts-ignore for reasons unknown to me, `ref` doesn't exist on the type inferred by TS
                ref: refreshControlGestureRef,
            })
            : undefined}/>);
});
