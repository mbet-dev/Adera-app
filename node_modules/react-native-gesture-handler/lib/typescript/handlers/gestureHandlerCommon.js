const commonProps = [
    'id',
    'enabled',
    'shouldCancelWhenOutside',
    'hitSlop',
    'cancelsTouchesInView',
    'userSelect',
    'activeCursor',
    'mouseButton',
    'enableContextMenu',
    'touchAction',
];
const componentInteractionProps = [
    'waitFor',
    'simultaneousHandlers',
    'blocksHandlers',
];
export const baseGestureHandlerProps = [
    ...commonProps,
    ...componentInteractionProps,
    'onBegan',
    'onFailed',
    'onCancelled',
    'onActivated',
    'onEnded',
    'onGestureEvent',
    'onHandlerStateChange',
];
export const baseGestureHandlerWithDetectorProps = [
    ...commonProps,
    'needsPointerData',
    'manualActivation',
];
export var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["LEFT"] = 1] = "LEFT";
    MouseButton[MouseButton["RIGHT"] = 2] = "RIGHT";
    MouseButton[MouseButton["MIDDLE"] = 4] = "MIDDLE";
    MouseButton[MouseButton["BUTTON_4"] = 8] = "BUTTON_4";
    MouseButton[MouseButton["BUTTON_5"] = 16] = "BUTTON_5";
    MouseButton[MouseButton["ALL"] = 31] = "ALL";
})(MouseButton || (MouseButton = {}));
