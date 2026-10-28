import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from '../features/auth/navigation/AuthStack';
import MainStack from './MainStack';
import AdminStack from '../features/admin/navigation/AdminStack';
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
    const { isAuthenticated, redirectToLogin, isAdmin } = useAppSelector(state => state.auth);
    // Login ke baad role ke hisaab se dashboard decide hoga - admin alag stack par jayega
    const canAccessDashboard = isAuthenticated;
    // Auth screen ka key logout/cold-start par change hota hai taaki AuthStack naya mount ho.
    // Bina key ke React same position ka Stack.Screen reuse kar leta hai aur AuthStack
    // purane route (Onboarding/deep signup) par atak jata hai - Login kabhi nahi khulta.
    return (<NavigationContainer theme={appTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0f172a' } }}>
        {canAccessDashboard ? (<Stack.Screen name={isAdmin ? 'Admin' : 'Main'} component={isAdmin ? AdminStack : MainStack}/>) : (<Stack.Screen key={redirectToLogin ? 'auth-login' : 'auth-onboarding'} name="Auth" component={AuthStack}/>)}
      </Stack.Navigator>
    </NavigationContainer>);
}
