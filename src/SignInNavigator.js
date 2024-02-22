// screens/BlogDetails.js

import React from 'react';
import { createStackNavigator, TransitionSpecs } from '@react-navigation/stack';
import LoginScreen from './Login/Login';
import SignUpScreen from './Login/SignUp';
import ResetPasswordScreen from './Login/ResetPassword';
import ConfirmSignUpScreen from './Login/ConfirmSignUp';
import ActivationScreen from './Login/Activation';
import ForgotPasswordScreen from './Login/ForgotPassword';
import ConfirmForgotPasswordScreen from './Login/ConfirmForgotPassword';

const Stack = createStackNavigator();

function SignInStack() {
  return (
     <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#621FF7',
          },
          headerTintColor: '#fff',
          headerTitleStyle :{
            fontWeight: 'bold',
          },
          transitionSpec: {
            open: TransitionSpecs.TransitionIOSSpec,
            close: TransitionSpecs.TransitionIOSSpec,
          },
        }}
      >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        // options={{ title: 'Blog' }}
      />
      <Stack.Screen 
       name="SignUp" 
       component={SignUpScreen} 
      //  options={{ title: 'Blog Detail' }}
      />
      <Stack.Screen 
       name="ResetPassword" 
       component={ResetPasswordScreen} 
      //  options={{ title: 'Blog Detail' }}
      />
      <Stack.Screen 
       name="ConfirmSignUp" 
       component={ConfirmSignUpScreen} 
      //  options={{ title: 'Blog Detail' }}
      />
      <Stack.Screen 
       name="ConfirmForgotPassword" 
       component={ConfirmForgotPasswordScreen} 
      //  options={{ title: 'Blog Detail' }}
      />
      <Stack.Screen 
       name="Activation" 
       component={ActivationScreen} 
      //  options={{ title: 'Blog Detail' }}
      />
      <Stack.Screen 
       name="ForgotPassword" 
       component={ForgotPasswordScreen} 
      //  options={{ title: 'Blog Detail' }}
      />
    </Stack.Navigator>
  );
}

// export default NavigationContainer(SignInNavigator);
export default function SignInNavigator() {
  return (
    // <NavigationContainer>
      <SignInStack />
    // </NavigationContainer>
  );
}