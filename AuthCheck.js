import React, { useEffect, useState } from 'react'
import { View, Linking } from 'react-native'
import { CommonActions } from '@react-navigation/native'
import { Cache, API } from 'aws-amplify'
import SInfo from 'react-native-sensitive-info'
// import PushNotification from '@aws-amplify/pushnotification'
import config from './aws-exports'
import Constants from './src/constants'
import { authData, awsSignOut } from './src/redux/auth/authSlice'
import { useSelector, useDispatch } from 'react-redux'

export default function AuthCheckScreen(props) {
  const { navigation } = props
  let userDetails = useSelector(authData)
  const [spinner, setSpinner] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    handleInitialURL(userDetails)

    loginToAWS()
    getUserDetails(userDetails)

    // PushNotification.onNotification((notification) => {
    //   Cache.removeItem(`${config.aws_org_id_E}_notifications`)
    // })

    // PushNotification.onRegister(async (token) => {
    //   Constants.app_device_token = token
    //   console.log('TTToken ', token)
    //   await SInfo.setItem('device_token', token, {})
    //   Cache.setItem('device_token', token)
    // })

    // PushNotification.onNotificationOpened((notification) => {
    //   Cache.setItem('isnotificationClicked', true)
    //   console.log(
    //     'PinpointNotificationData ' + JSON.stringify(notification.data)
    //   )
    //   navigation.navigate('Notifications')
    // })
  }, [userDetails, navigation])

  const handleInitialURL = async (userDetails) => {
    try {
      const url = await Linking.getInitialURL()
      console.log('Initial deep link URL:', url)

      if (url) {
        console.log(`Opened from initial deep link: ${url}`)
        const courseIdMatch = url.match(/course\?id=([^&]+)/)
        if (
          userDetails === undefined ||
          userDetails === 0 ||
          userDetails === null
        ) {
          navigation.navigate('SignInNavigator')
        } else if (courseIdMatch) {
          const courseId = courseIdMatch[1]
          navigation.navigate('CourseView', {
            courseId: courseId,
          })
        } else {
          console.log('No Id found for course')
          navigation.navigate('HomeScreenNavigator')
        }
      } else {
        console.log('No deep link found')
        navigateToAppropriateScreen(userDetails)
      }
    } catch (error) {
      console.error('Error handling initial URL:', error)
    }
  }

  const navigateToAppropriateScreen = (userDetails) => {
    if (
      userDetails === undefined ||
      userDetails === 0 ||
      userDetails === null
    ) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'SignInNavigator' }],
        })
      )
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'HomeScreenNavigator' }],
        })
      )
    }
  }

  const getUserDetails = async (userDetails) => {
    setSpinner(true)
    const bodyParam = {
      body: {
        emailid: userDetails.email,
        uid: userDetails.uData.uid,
        schema: config.aws_schema,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }

    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getUserDetails',
        bodyParam
      )
      if (response === null) {
        dispatch(awsSignOut())
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            key: null,
            routes: [{ name: 'SignInNavigator' }],
          })
        )
      }
      if (response?.confirmation_status === null) {
        dispatch(awsSignOut())
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            key: null,
            routes: [{ name: 'SignInNavigator' }],
          })
        )
      }
      setSpinner(false)
    } catch (err) {
      setSpinner(false)
      console.error(err)
    }
  }

  const url = Linking.getInitialURL()

  async function loginToAWS() {
    if (
      userDetails === undefined ||
      userDetails === 0 ||
      userDetails === null
    ) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          key: null,
          routes: [{ name: 'SignInNavigator' }],
        })
      )
    } else if (url !== null) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          key: null,
          routes: [{ name: 'CourseView', params: { courseId, courseTitle } }],
        })
      )
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          key: null,
          routes: [{ name: 'HomeScreenNavigator' }],
        })
      )
    }
  }
  return <View />
}
