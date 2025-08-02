import * as React from 'react';
import GenericTouchable from './GenericTouchable';
/**
 * @deprecated TouchableWithoutFeedback will be removed in the future version of Gesture Handler. Use Pressable instead.
 */
const TouchableWithoutFeedback = React.forwardRef(({ delayLongPress = 600, extraButtonProps = {
    rippleColor: 'transparent',
    exclusive: true,
}, ...rest }, ref) => (<GenericTouchable ref={ref} delayLongPress={delayLongPress} extraButtonProps={extraButtonProps} {...rest}/>));
export default TouchableWithoutFeedback;
