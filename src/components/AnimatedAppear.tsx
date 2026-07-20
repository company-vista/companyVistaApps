import { type ReactNode } from 'react';
import Animated, { FadeInDown} from 'react-native-reanimated';

type AnimatedAppearProps = {
  children: ReactNode;
  index?: number;
  duration?: number;
  delayPerItem?: number;
};

function AnimatedAppear({
  children,
  index = 0,
  duration = 400,
  delayPerItem = 100,
}: AnimatedAppearProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * delayPerItem)
        .duration(duration)
        .withInitialValues({ opacity: 0, translateY: -20 })}
    >
      {children}
    </Animated.View>
  );
}

export default AnimatedAppear;
