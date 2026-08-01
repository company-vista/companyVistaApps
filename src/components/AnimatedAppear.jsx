import Animated, { FadeInDown } from 'react-native-reanimated';
function AnimatedAppear({ children, index = 0, duration = 400, delayPerItem = 100, }) {
    return (<Animated.View entering={FadeInDown.delay(index * delayPerItem)
            .duration(duration)
            .withInitialValues({ opacity: 0, translateY: -20 })}>
      {children}
    </Animated.View>);
}
export default AnimatedAppear;
