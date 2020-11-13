import { DefaultTheme } from 'react-native-paper'

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#42ab9e',
    accent: '#42ab9e',
    divider: '#494949'
  }
}

export { theme }
