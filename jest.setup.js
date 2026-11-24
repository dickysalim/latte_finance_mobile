// Reanimated and Worklets need native code that Jest does not have. Screens only use
// Animated.View and the FadeInDown entering animation, so a plain View stands in.
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const chain = { duration: () => chain };
  return { __esModule: true, default: { View }, FadeInDown: chain };
});
