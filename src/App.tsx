import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store } from './store';
import Navigation from './navigation';
import { colors } from './theme/colors';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.surface}
        />
        <Navigation />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
