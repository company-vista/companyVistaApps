import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from '../features/auth/navigation/AuthStack';
import MainStack from './MainStack';
import { useAppSelector } from '../store/hooks';
const Stack = createNativeStackNavigator();
const appTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        card: '#0f172a',
        background: '#0f172a',
    },
};
export default function RootStack() {
    const { isAuthenticated, redirectToLogin } = useAppSelector(state => state.auth);
    // Login ke baad sabhi authenticated users Main (HomeScreen) pe jayenge
    // Dashboard block / ReviewSubmitScreen ka logic HomeScreen me handle hota hai (isCompleteRegistration === false pe auto-overlay)
    const canAccessDashboard = isAuthenticated;
    return (<NavigationContainer theme={appTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f172a' } }}>
        {canAccessDashboard ? (<Stack.Screen name="Main" component={MainStack}/>) : (<Stack.Screen key={redirectToLogin ? 'auth-login' : 'auth-onboarding'} name="Auth" component={AuthStack}/>)}
      </Stack.Navigator>
    </NavigationContainer>);
}
