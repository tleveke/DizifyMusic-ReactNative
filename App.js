import React from 'react'
import { Provider as PaperProvider } from 'react-native-paper'

import Authentification from './src/screens/Authentification'
import AppContainer from './src/navigation/AppContainer'
import { theme } from './src/styles'

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <AppContainer />
    </PaperProvider>
  )
}

export default App
