/* eslint-disable radix */
/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable no-undef */
/* eslint-disable no-nested-ternary */
import React, { useState, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Image,
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  StatusBar,
  Platform,
  BackHandler,
  RefreshControl,
  Linking,
  ImageBackground,
  Alert,
  PermissionsAndroid,
} from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import { CommonActions, useNavigation } from '@react-navigation/native'
import Amplify, { Cache, API, Auth } from 'aws-amplify'
import DeviceInfo from 'react-native-device-info'
import SInfo from 'react-native-sensitive-info'
import Toolbar from '../Profile/Toolbar'
import { ProgressBar } from '@react-native-community/progress-bar-android'
import { ProgressView } from '@react-native-community/progress-view'
import SkeletonLoader from '../common/appSkeletonLoader'
import config from '../../aws-exports'
import Constants from '../constants'
import { awsSignIn, authData } from '../redux/auth/authSlice'
import { useSelector, useDispatch } from 'react-redux'
import SwiperFlatList from 'react-native-swiper-flatlist'
import Moment from 'react-moment'
import moment from 'moment'
import { Directions } from 'react-native-gesture-handler'
import RNFetchBlob from 'rn-fetch-blob'

const myTopicsWidth = (Constants.app_width - 10) / 2 - 10
let myTopicsHeight = myTopicsWidth
let progressViewHeight = 2
if (myTopicsHeight / 2 < 80) {
  myTopicsHeight += 10
}
if (myTopicsHeight <= 155) {
  myTopicsHeight += 10
}

if (Platform.OS === 'android' && DeviceInfo.getApiLevel() <= 22) {
  progressViewHeight = 5
}
const logoWidth = 85
const logoHeight = 80
const toolbarHeight = 50
const topicsWidth = Constants.app_width - 30
const topicsHeight = Constants.app_height / 3
const exploreWidth = (Constants.app_width - 20) / 2 - 10
const exploreHeight = exploreWidth - 30
const emptyResultIcon = require('../Assets/Images/nocategory.png')
const profileIcon = require('../Assets/Images/my_profile.png')
const appLogo = require('../Assets/Images/logo.png')
const downloadIcon = require('../Assets/Images/download.png')
const backIcon = require('../Assets/Images/back.png')
const Certificate = require('../Assets/Images/Certificate-SSFL.png')

export default function CertificatesScreen(props) {
  const navigation = useNavigation()
  // const { navigation } = props;
  const [loaded, setLoaded] = useState()
  const networkStatusRef = useRef(true)
  const [refreshing, setRefreshing] = useState(false)
  const [spinner, setSpinner] = useState(true)
  const [storeCerti, setStoreCerti] = useState(true)
  const [certificate, setCertificate] = useState(false)
  const [certificateList, setCertificateList] = useState([])
  const dispatch = useDispatch()
  let userDetails = useSelector(authData)
  // let user = useSelector(state => state.user.value);

  useEffect(() => {
    // console.log('userDetails ' + JSON.stringify(userDetails.res[0].eid));
    getCertificates()
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    const listners = [navigation.addListener('willFocus', () => checkFocus())]
    netStatus()
    StatusBar.setHidden(false)

    CertificatesScreen.navListener = navigation.addListener('didFocus', () => {
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

  async function getCertificates() {
    let userdata = { ...userDetails }
    // console.log(JSON.stringify(userdata))
    const bodyParam = {
      body: {
        oid: config.aws_org_id,
        tenant: userDetails.locale,
        eid: userDetails.username,
        emailid: userDetails.email,
        ur_id: userDetails.uData.ur_id,
        schema: config.aws_schema,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    console.log(JSON.stringify(bodyParam.body))
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/listUserCerts',
        bodyParam
      )
      const { certificates } = response
      if (response.errorType === undefined) {
        setCertificate(true)
        console.log(certificates, 'certificates==')
        setCertificateList(certificates)
        const expires = new Date().getTime() + 60 * 60 * 1000
        console.log(JSON.stringify(response))
      }
      console.log('qwertyuiop ' + JSON.stringify(response))
      setSpinner(false)
    } catch (error) {
      // console.log('getMyCoursesError', error);
    }
  }

  async function generateCertificates(list) {
    const bodyParam = {
      body: {
        name:
          userDetails?.uData?.name !== undefined
            ? userDetails?.uData?.name
            : '',
        course_title: list.ttitle,
        oid: config.aws_org_id.toLowerCase(),
        course_id: list.tid,
        date: moment(list?.compdate).format('DD MMMM YYYY'),
        uid: userDetails.uData.uid,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    console.log(JSON.stringify(bodyParam.body))
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/generate-certificate',
        bodyParam
      )
      console.log('qwertyuiop ' + JSON.stringify(response))
      const hasPermission = await checkStoragePermission()
      if (hasPermission) {
        let fileUrl = `https://${Constants.DOMAIN}/${response.body}`
        downloadImage(fileUrl)
      } else {
        certiDownload(response)
      }
    } catch (error) {
      // console.log('getMyCoursesError', error);
    }
  }

  const checkStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      )
      return granted
    } catch (error) {
      console.error('Error checking storage permission:', error)
      return false
    }
  }

  async function checkFocus() {
    BackHandler.removeEventListener('hardwareBackPress', true)
    await SInfo.setItem('isnotClickable', JSON.stringify(false), {})
    window.isnotClickable = 'false'
    if (networkStatusRef.current) {
      // fetchRecentViews();
      // fetchLocalTopicProgressDetails();
      fetchLocalCertDetails()
    } else {
      handleNetworkConnection()
    }
    StatusBar.setBarStyle('dark-content')
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(Constants.app_statusbar_color)
      StatusBar.setTranslucent(true)
    }
  }

  function netStatus() {
    NetInfo.fetch().then((state) => {
      if (state.isConnected === true) {
        setLoaded(false)
        setSpinner(true)
        networkStatusRef.current = true
      } else {
        setLoaded(false)
        setSpinner(true)
        networkStatusRef.current = false
      }
    })
  }

  function onRefresh() {
    setRefreshing(true)
    getCertificates().then(() => {
      setRefreshing(false)
    })
  }

  function handleNetworkConnection() {
    setLoaded(true)
    setSpinner(false)
  }

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

  const emptyData = (
    <View style={styles.emptyData}>
      <Image
        style={{
          height: 60,
          width: 60,
        }}
        source={emptyResultIcon}
      />
      <View style={styles.emptyTitleHolder}>
        <Text numberOfLines={2} style={styles.emptyText}>
          There&apos;s nothing here, yet
        </Text>
      </View>
    </View>
  )

  function openSettings() {
    if (Platform.OS === 'android') {
      Linking.openSettings()
    }
  }

  async function certiDownload(rowData) {
    console.log(rowData.body)
    let fileUrl = `https://${Constants.DOMAIN}/${rowData.body}`
    if (Platform.OS === 'ios') {
      downloadImage(fileUrl)
    } else {
      if (Platform.Version < 30) {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission Required',
              message:
                'App needs access to your storage to download certificate',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          )
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            // Once user grant the permission start downloading
            console.log('Storage Permission Granted.')
            downloadImage(fileUrl)
          } else {
            // If permission denied then show alert
            Alert.alert('Storage Permission Not Granted')
          }
        } catch (err) {
          // To handle permission related exception
          console.log(err)
        }
      } else {
        downloadImageNew(fileUrl)
      }
    }
  }

  const downloadImage = (fileUrl) => {
    // Main function to download the image

    // To add the time suffix in filename
    let date = new Date()
    // Image URL which we want to download
    let image_URL = fileUrl
    // Getting the extention of the file
    let ext = getExtention(image_URL)
    ext = '.' + ext[0]
    // Get config and fs from RNFetchBlob
    // config: To pass the downloading related options
    // fs: Directory path where we want our image to download
    const { config, fs } = RNFetchBlob
    let PictureDir = fs.dirs.PictureDir
    let fileName =
      '/image_' + Math.floor(date.getTime() + date.getSeconds() / 2) + '.jpeg'
    let filePath = PictureDir + fileName

    let options = {
      fileCache: true,
      addAndroidDownloads: {
        // Related to the Android only
        useDownloadManager: true,
        notification: true,
        path: filePath,
        description: 'Image',
      },
    }
    config(options).fetch('GET', image_URL)
    Alert.alert('Certificate Downloaded Successfully.')
    RNFetchBlob.fs
      .cp(path, filePath)
      .then(() =>
        RNFetchBlob.android.addCompleteDownload({
          title: 'Certificate Downloaded Successfully',
          description: 'Download complete',
          mime: 'application/jpeg',
          path: filePath,
          showNotification: true,
        })
      )
      .then((res) => {
        console.log('res -> ', JSON.stringify(res))
        RNFetchBlob.fs.scanFile([{ path: filePath, mime: 'application/jpeg' }])
      })
  }

  const downloadImageNew = (fileUrl) => {
    // Main function to download the image

    // To add the time suffix in filename
    let date = new Date()
    // Image URL which we want to download
    let image_URL = fileUrl
    // Getting the extention of the file
    let ext = getExtention(image_URL)
    ext = '.' + ext[0]
    // Get config and fs from RNFetchBlob
    // config: To pass the downloading related options
    // fs: Directory path where we want our image to download
    const { config, fs } = RNFetchBlob
    let PictureDir = fs.dirs.DownloadDir
    let fileName =
      '/image_' + Math.floor(date.getTime() + date.getSeconds() / 2) + '.jpg'
    let filePath = PictureDir + fileName

    let options = {
      fileCache: true,
      addAndroidDownloads: {
        title: 'Certificate download successfully!',
        // Related to the Android only
        useDownloadManager: true,
        notification: true,
        path: filePath,
        description: 'Image',
        mime: 'image/jpg',
        mediaScannable: true,
      },
    }
    // alert(filePath)
    config(options).fetch('GET', image_URL)
    Alert.alert('Certificate Downloaded Successfully.')
    RNFetchBlob.fs
      .cp(path, filePath)
      .then(() =>
        RNFetchBlob.android.addCompleteDownload({
          title: 'Certificate Downloaded Successfully',
          description: 'Download complete',
          mime: 'image/jpg',
          path: filePath,
          showNotification: true,
        })
      )
      .then((res) => {
        console.log('res -> ', JSON.stringify(res))
        RNFetchBlob.fs.scanFile([{ path: filePath, mime: 'image/jpg' }])
      })
  }

  const getExtention = (filename) => {
    // To get the file extension
    return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined
  }

  function renderCertiView(data) {
    const rowData = data.item
    // alert(JSON.stringify(rowData))
    return (
      <View>
        <Text
          style={{
            marginHorizontal: '10%',
            marginBottom: 10,
          }}
        >
          {' '}
          {rowData.ttitle}
        </Text>
        <View style={{ marginBottom: 50 }}>
          <TouchableHighlight
            underlayColor="transparent"
            onPress={() => generateCertificates(rowData)}
            style={[
              styles.buttonStyle,
              { backgroundColor: Constants.app_button_color },
            ]}
          >
            <Text style={styles.loginText}>
              Click here to download the certificate
            </Text>
          </TouchableHighlight>
        </View>
      </View>
    )
  }

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack())
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
                Certificates
              </Text>
            </View>
          </View>
        }
      />
      <View style={{ flex: 1 }}>
        {!spinner ? (
          <ScrollView
            style={styles.scrollview}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                tintColor={Constants.app_button_color}
                colors={[
                  Constants.app_button_color,
                  Constants.app_button_color,
                ]}
                progressViewOffset={35}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          >
            <View style={{ paddingVertical: 16 }}>
              <FlatList
                style={styles.certiDetailsView}
                data={certificateList}
                renderItem={renderCertiView}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={emptyData}
              />
            </View>
          </ScrollView>
        ) : (
          <SkeletonLoader loader="topicsDashboard" />
        )}
      </View>
      <View style={styles.spinnerView}>
        {!networkStatusRef.current && (
          <Text style={[styles.noNetwork, styles.appFontFamily]}>
            No internet connectivity
          </Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight - 5,
      },
    }),
  },
  profileHolder: {
    height: toolbarHeight,
    ...Platform.select({
      ios: {
        marginTop: -25,
      },
      android: {
        marginTop: -35,
      },
    }),
    marginLeft: 0,
  },
  profileImage: {
    height: 30,
    width: 30,
  },
  appLogo: {
    width: logoWidth,
    height: logoHeight,
    ...Platform.select({
      ios: {
        marginTop: -38,
      },
      android: {
        marginTop: -53,
      },
    }),
  },
  courseListview: {
    flex: 1,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        padding: 10,
        marginTop: 5,
      },
      android: {
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
      },
    }),
  },
  container: {
    flex: 1,
    backgroundColor: Constants.app_background_color,
  },
  noNetwork: {
    bottom: 0,
    textAlign: 'center',
    color: 'white',
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: 'grey',
    ...Platform.select({
      ios: {
        fontSize: 19,
      },
      android: {
        fontSize: 16,
      },
    }),
  },
  scrollview: {
    flex: 1,
  },
  sectionHeader: {
    width: Constants.app_width,
    height: 30,
    marginLeft: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    // alignItems: 'center',
  },
  appFontFamily: {
    fontFamily: Constants.app_font_family_regular,
  },
  headerText1: {
    ...Platform.select({
      ios: {
        fontSize: 18,
        marginLeft: 13,
      },
      android: {
        marginTop: 0,
        fontSize: 16,
        marginLeft: 13,
        // justifyContent: 'center',
        // alignSelf: 'center',
      },
    }),
    color: Constants.app_text_color,
    fontWeight: '700',
  },
  spinnerView: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    opacity: 0.8,
    zIndex: 1000,
  },
  emptyData: {
    flex: 1,
    height: Platform.OS === 'ios' ? 87.5 : 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  emptyTitleHolder: {
    height: 20,
  },
  emptyText: {
    color: '#484848',
    ...Platform.select({
      ios: {
        fontSize: 15,
      },
      android: {
        fontSize: 14,
      },
    }),
    fontFamily: Constants.app_font_family_regular,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  certiDetailsView: {
    width: '90%',
    marginHorizontal: '5%',
    // height: '100%',
  },
  topTopicsRowContainer: {
    // width: '100%',
    // height: topicsHeight,
    // // width: '90%',
    // // height: '70%',
    // borderRadius: 10,
    // ...Platform.select({
    //   ios: {
    //     shadowColor: 'rgba(0,0,0, .2)',
    //     shadowOffset: { height: 1, width: 0 },
    //     shadowOpacity: 1,
    //     shadowRadius: 1,
    //   },
    //   android: {
    //     shadowOpacity: 1,
    //     elevation: 2,
    //   },
    // }),
  },
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
  logoHolder: {
    marginTop: 30,
    alignSelf: 'center',
    backgroundColor: 'transparent',
    width: logoWidth,
    height: logoHeight,
  },
  logoStyle: {
    width: '100%',
    height: '100%',
  },
  buttonStyle: {
    width: '80%',
    height: 30,
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: Constants.app_button_text_color,
    fontSize: 12,
    fontFamily: Constants.app_font_family_regular,
    ...Platform.select({
      ios: {
        // fontWeight: 'bold',
      },
    }),
    ...Platform.select({
      android: {
        justifyContent: 'center',
        // marginBottom: 1.5,
        // fontWeight: '700',
      },
    }),
  },
})
