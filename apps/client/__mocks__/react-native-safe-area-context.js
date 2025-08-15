const inset = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

module.exports = {
  SafeAreaProvider: ({ children }) => children,
  SafeAreaConsumer: ({ children }) => children(inset),
  useSafeAreaInsets: () => inset,
  SafeAreaView: ({ children }) => children,
};