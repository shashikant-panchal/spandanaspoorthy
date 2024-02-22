import React, { useEffect, useState } from 'react'
import { Modal, StyleSheet, Text, View, Linking } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import HomeNavigator from './src/HomeNavigator'
import SignInNavigator from './src/SignInNavigator'
import AuthCheckScreen from './AuthCheck'
import { Provider } from 'react-redux'
import store from './src/redux/redux_store/store'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import SplashScreen from 'react-native-splash-screen'
import { checkVersion } from 'react-native-check-version'
import CourseViewScreen from './src/Topics/CourseView'
import CoursePlayerScreen from './src/Topics/CoursePlayer'

const Stack = createStackNavigator()
let persistor = persistStore(store)

function NavStack() {
  return (
    <Stack.Navigator
      initialRouteName="AuthCheck"
      screenOptions={{
        headerShown: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#621FF7',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="AuthCheck" component={AuthCheckScreen} />
      <Stack.Screen name="CourseView" component={CourseViewScreen} />
      <Stack.Screen name="SignInNavigator" component={SignInNavigator} />
      <Stack.Screen name="HomeScreenNavigator" component={HomeNavigator} />
      <Stack.Screen name="CoursePlayer" component={CoursePlayerScreen} />
    </Stack.Navigator>
  )
}

export default function App() {
  const [modalVisible, setModalVisible] = useState(false)
  const [updateversion, setUpdateVersion] = useState('')

  useEffect(() => {
    SplashScreen.hide()
    versionCheck()
  })

  async function versionCheck() {
    const version = await checkVersion()
    setUpdateVersion(version)
    if (version.needsUpdate) {
      setModalVisible(true)
      console.log(`App has a ${version.updateType} update pending.`)
    }
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <NavStack />
        </NavigationContainer>
      </PersistGate>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View
              style={{
                flex: 1,
                width: '80%',
                alignSelf: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={styles.modalText}>Please Update your App</Text>
              <Text style={styles.modalText}>
                You will have to update your app to the latest version to
                continue using.
              </Text>
              <Text
                onPress={() => Linking.openURL(`${updateversion.url}`)}
                style={[styles.buttonText, { fontWeight: '700' }]}
              >
                Click here to Update the App!
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </Provider>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    alignItems: 'center',
    fontSize: 15,
  },
  buttonText: {
    color: 'blue',
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 15,
    fontFamily: Constants.app_font_family_regular,
    textDecorationLine: 'underline',
  },
})




