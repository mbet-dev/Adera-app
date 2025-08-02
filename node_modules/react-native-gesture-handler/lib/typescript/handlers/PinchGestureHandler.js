import createHandler from './createHandler';
import { baseGestureHandlerProps, } from './gestureHandlerCommon';
export const pinchHandlerName = 'PinchGestureHandler';
/**
 * @deprecated PinchGestureHandler will be removed in the future version of Gesture Handler. Use `Gesture.Pinch()` instead.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- backward compatibility; see description on the top of gestureHandlerCommon.ts file
export const PinchGestureHandler = createHandler({
    name: pinchHandlerName,
    allowedProps: baseGestureHandlerProps,
    config: {},
});
