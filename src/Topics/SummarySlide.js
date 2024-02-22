import React, { useState, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  ImageBackground,
  ScrollView,
  StatusBar,
  TouchableHighlight,
  Modal,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { color } from 'react-native-reanimated'
import { shadow } from 'react-native-paper'
import { ScreenWidth } from 'react-native-elements/dist/helpers'
import Constants from '../constants'
import { useSelector, useDispatch } from 'react-redux'
import { awsSignIn, authData } from '../redux/auth/authSlice'
import NetInfo from '@react-native-community/netinfo'
import Amplify, { Cache, API, Auth } from 'aws-amplify'
import { CommonActions, useNavigation } from '@react-navigation/native'
import Toolbar from '../Profile/Toolbar'
import config from '../../aws-exports'
import SkeletonLoader from '../common/appSkeletonLoader'
import { AirbnbRating, Rating } from 'react-native-ratings'
import { WebView } from 'react-native-webview'
import Pdf from 'react-native-pdf'

const backIcon = require('../Assets/Images/back.png')

export default function SummarySlideScreen(props) {
  const { navigation, onDismissLoadingCallback, route } = props
  const { sessionData } = route.params
  const dispatch = useDispatch()
  let userDetails = useSelector(authData)

  const networkStatusRef = useRef(true)
  const [loading, setLoading] = useState(false)
  const [spinner, setSpinner] = useState(true)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    console.log(JSON.stringify(sessionData))
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    const listners = [navigation.addListener('willFocus', () => checkFocus())]
    StatusBar.setHidden(false)
    SummarySlideScreen.navListener = navigation.addListener('didFocus', () => {
      StatusBar.setBarStyle('dark-content')
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(Constants.app_statusbar_color)
        StatusBar.setTranslucent(true)
      }
    })
    return () => {
      unsubscribe()
      listners.forEach((listner) => {
        unsubscribe()
      })
    }
  }, [])

  function handleConnectivityChange(isConnected) {
    if (isConnected === false) {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      })
      networkStatusRef.current = false
      setSpinner(false)
    } else {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      })
      networkStatusRef.current = true
      // fetchMytopicsDataset();
    }
  }

  function hideSpinn() {
    setVisible(false)
  }

  function showSpinn() {
    setVisible(true)
  }

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack())
  }

  function viewSummarySlide() {
    if (Platform.OS === 'android') {
      return loadPdfView()
    } else {
      return loadMultimediaView()
    }
  }

  function loadMultimediaView() {
    // alert(sessionData?.sData?.slide_tname)
    return (
        <WebView
          source={{
            uri: `https://${
              Constants.DOMAIN
            }/${config.aws_org_id.toLowerCase()}-resources/documents/session-documents/${
              sessionData?.sData?.slide_tname
            }`,
          }}
          // sharedCookiesEnabled
          style={{
            flex: 1,
            // marginTop: 5,
            marginLeft: 10,
            marginRight: 10,
            marginBottom: 5,
            height: Constants.app_height,
            width: Constants.app_width - 20,
          }}
          // onLoadStart={() => showSpinn()}
          // onLoad={() => hideSpinn()}
          // scalesPageToFit
          // javaScriptEnabled
        />
    )
  }

  function loadPdfView(objUrl) {
    return (
      <View style={{ height: '100%' }}>
        {/* <ScrollView style={{ marginBottom: 30 }}> */}
        <Pdf
          source={{
            uri: `https://${
              Constants.DOMAIN
            }/${config.aws_org_id.toLowerCase()}-resources/documents/session-documents/${
              sessionData?.sData?.slide_tname
            }`,
            cache: true,
          }}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`number of pages: ${numberOfPages}`)
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`current page: ${page}`)
          }}
          onError={(error) => {
            console.log(error)
          }}
          onPressLink={(uri) => {
            console.log(`Link presse: ${uri}`)
          }}
          style={styles.pdf}
        />
        {/* </ScrollView> */}
      </View>
    )
  }

  return (
    <View
      style={styles.container}
      pointerEvents={!networkStatusRef.current ? 'none' : 'auto'}
    >
      <View style={styles.statusBar}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Constants.app_statusbar_color}
          translucent
        />
      </View>
      <Toolbar
        left={
          <View style={styles.toolBarHolder}>
            <TouchableHighlight
              underlayColor="transparent"
              onPress={() => onBackPressed()}
            >
              <Image source={backIcon} style={styles.backButton} />
            </TouchableHighlight>

            <View>
              <Text numberOfLines={1} style={styles.headerStyle}>
                {sessionData.sData.sn}
              </Text>
            </View>
          </View>
        }
      />
      <ScrollView style={{ marginBottom: 50 }}>{viewSummarySlide()}</ScrollView>
    </View>
  )
}
const styles = StyleSheet.create({
  toolBarHolder: {
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        marginTop: -35,
      },
      android: {
        marginTop: -40,
      },
    }),
  },
  backButton: {
    width: 25,
    height: 25,
    tintColor: '#000000',
    alignSelf: 'center',
  },
  headerStyle: {
    marginLeft: 12,
    width: Constants.app_width - 70,
    fontWeight: '700',
    ...Platform.select({
      ios: {
        fontSize: 16,
        marginTop: 2,
        justifyContent: 'center',
      },
      android: {
        marginTop: 0,
        fontSize: 16,
        justifyContent: 'center',
      },
    }),
    color: Constants.app_text_color,
  },
  container: {
    flex: 1,
  },
  screenstyle: {
    width: '100%',
    height: '100%',
  },
  appFontFamily: {
    fontFamily: Constants.app_font_family_regular,
  },
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight,
      },
    }),
  },
  requiredIcon: {
    height: 22,
    width: 22,
    marginTop: -2,
  },
  input: {
    borderWidth: 0.5,
    borderColor: 'black',
    borderRadius: 5,
    height: 35,
    marginVertical: 10,
    width: '100%',
  },
})
