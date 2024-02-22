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
  ActivityIndicator,
  ImageBackground,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  AppState,
  Pressable,
  Alert,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import NetInfo from '@react-native-community/netinfo'
import { CommonActions, useNavigation } from '@react-navigation/native'
import Amplify, { Cache, API, Auth } from 'aws-amplify'
import Toolbar from '../Profile/Toolbar'
import { ProgressBar } from '@react-native-community/progress-bar-android'
import { ProgressView } from '@react-native-community/progress-view'
import SkeletonLoader from '../common/appSkeletonLoader'
import config from '../../aws-exports'
import Constants from '../constants'
import LinearGradient from 'react-native-linear-gradient'
import { awsSignIn, authData } from '../redux/auth/authSlice'
import { useSelector, useDispatch } from 'react-redux'
import Video from 'react-native-video'
import SwiperFlatList from 'react-native-swiper-flatlist'
// import Slider from 'react-native-slider';
import { WebView } from 'react-native-webview'
import Pdf from 'react-native-pdf'
import ProgressCircle from 'react-native-progress-circle'
import { object } from 'prop-types'
import Orientation from 'react-native-orientation'
import Cookie from 'react-native-cookie'
import YoutubePlayer from 'react-native-youtube-iframe'
import QuizDetailsScreen from './QuizDetails'
import { Rating } from 'react-native-ratings'

const objectHolderHeight =
  Platform.OS === 'ios'
    ? Constants.app_height - 153
    : Constants.app_height - 165
let webviewBottom = 90
let webViewForInteractivity = 70

const backIcon = require('../Assets/Images/back.png')
const lockIcon = require('../Assets/Images/lock.png')
const videoPlayIcon = require('../Assets/Images/video_play.png')
const videoPauseIcon = require('../Assets/Images/video_pause.png')
const fullScreenIcon = require('../Assets/Images/full_screen.png')
const closeFullScreenIcon = require('../Assets/Images/close_screen.png')
const quizIcon = require('../Assets/Images/quizicon.png')
const fullScreen = require('../Assets/Images/fullScreenHtml.png')
const closeScreen = require('../Assets/Images/closeScreenHtml.png')
const audioIcon = require('../Assets/Images/audioimage.png')
const downloadIcon = require('../Assets/Images/download.png')
const bookmarkIcon1 = require('../Assets/Images/bookmark1.png')
const bookmarkIcon2 = require('../Assets/Images/bookmark2.png')

export default function ObjectViewScreen(props) {
  const { route, onDismissLoadingCallback, navigation } = props

  const { objectOType, objectOId, objectOName } = route.params
  const [objectData, setObjectData] = useState([])
  const [assignmentLoad, setAssignmentLoad] = useState(true)
  const OIndexRef = useRef()
  const curObRef = useRef('')
  const [modalSpinner, setModalSpinner] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const networkRef = useRef(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const networkStatusRef = useRef(true)
  const [spinner, setSpinner] = useState(true)
  const [fullscreen, setFullScreen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [buffer, setBuffer] = useState(0)
  const [duration, setDuration] = useState(0)
  const [oneThird, setOneThird] = useState(0)
  const [ended, setEnded] = useState(false)
  const [loadingSpinner, setLoadingSpinner] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [showActionButton, setShowActionButton] = useState(false)
  const [paused, setPaused] = useState(true)
  const [repeat, setRepeat] = useState()
  const [defaultVal, setDefaultVal] = useState(true)
  const startTime = useRef('')
  const [markObjectAsComplete, setMarkObjectAsCompleted] = useState(false)
  const isInterActivity = useRef(false)
  const [visible, setVisible] = useState(true)
  const [btnClick, setBtnClick] = useState(false)
  const [tryAgain, setTryAgain] = useState(false)
  const [formativeAns, setFormativeAns] = useState([])
  const [fullscreennextnugget, setFullScreenNextNugget] = useState(false)
  const [bounceValue] = useState(new Animated.Value(400))
  const [fullscreenvid, setFullScreenVid] = useState(false)
  const fullscreenWebView = useRef(false)
  const [fullScreenNios, setFullScreenNios] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [quizQuestion, setQuizQuestion] = useState([])
  const [isBookmarkedLoaded, setIsBookmarkedLoaded] = useState(false)
  const [sharedObject, setSharedObject] = useState({})
  const [report, setReport] = useState({})
  const [qtype, setQtype] = useState()
  const refobj = useRef()
  const [isLoading, setIsLoading] = useState(true)
  const [isRating, setIsRating] = useState(0)
  const [sTime, setSTime] = useState(new Date().getTime())
  const count = useRef(0)
  const sharedReport = useRef({})
  let oType
  let qType
  let isShowControls = false
  let objProgress = 0
  let showObjButton = false
  let isHidden = true

  const dispatch = useDispatch()
  let userDetails = useSelector(authData)

  useEffect(() => {
    let thisObjectDetails = { ...userDetails }
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    const listners = [navigation.addListener('willFocus', () => checkFocus())]
    StatusBar.setHidden(false)
    Orientation.lockToPortrait()
    BackHandler.addEventListener('hardwareBackPress', handleBackButton)
    didSelectObjectIcon()
    if (objectOType === 'quiz') {
      getQuiz(objectData[OIndexRef.current])
    }
    ObjectViewScreen.navListener = navigation.addListener('didFocus', () => {
      StatusBar.setBarStyle('dark-content')
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(Constants.app_statusbar_color)
        StatusBar.setTranslucent(true)
      }
    })
    AppState.addEventListener('change', handleAppStateChange)
    if (ended && ObjectViewScreen.vid) {
      ObjectViewScreen.vid.seek(0)
    }
    ObjectViewScreen
    return () => {
      unsubscribe()
      removeBackPressListner()
      AppState.removeEventListener('change', handleAppStateChange)
      listners.forEach((listner) => {
        unsubscribe()
      })
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      tick()
    }, 1000)
    if (userDetails === 0) {
      var obj = {}
      obj.tid = objectOId
      obj.type = 'content'
    } else {
      getSharedObject()
      return () => {
        if (objectOId !== undefined) {
          updateObjectAnalytics(objectOId, sharedReport.current, count.current)
          console.log(
            objectOId +
              ' + ' +
              JSON.stringify(sharedReport.current) +
              ' + ' +
              count.current
          )
        }
        clearInterval(interval)
      }
    }
  }, [])

  const tick = () => {
    count.current += 1
  }

  function removeBackPressListner() {
    BackHandler.removeEventListener('hardwareBackPress', handleBackButton)
  }

  async function setCookie(data) {
    const expires = new Date().getTime() + 60 * 60 * 1000
    Cache.setItem(config.aws_org_id, data, { expires })
    await Cookie.set(Constants.COOKIE_URL, 'CloudFront-Policy', data.Policy)
    await Cookie.set(
      Constants.COOKIE_URL,
      'CloudFront-Signature',
      data.Signature
    )
    await Cookie.set(
      Constants.COOKIE_URL,
      'CloudFront-Key-Pair-Id',
      data.KeyPairId
    )

    Cookie.get(Constants.COOKIE_URL).then((cookie) =>
      console.log('COOKIE_URL' + JSON.stringify(cookie))
    )
  }

  function handleConnectivityChange(isConnected) {
    if (isConnected === false) {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      })
      networkStatusRef.current = false
      // setSpinner(false);
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

  function handleAppStateChange() {
    if (AppState.currentState === 'background') {
      if (Platform.OS === 'ios' && fullscreenvid) {
        ObjectViewScreen.vid.dismissFullscreenPlayer()
        setFullScreenVid(false)
        // } else if (Platform.OS === 'ios' && !fullscreenvid) {
        //   navigation.navigate('CoursePlayer')
        // } else {
        //   navigation.navigate('CoursePlayer')
      }
    }
    if (AppState.currentState === 'active') {
      Orientation.lockToPortrait()
      Cache.setItem('isnotificationClicked', false)
    }
  }

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack())
  }

  function handleBackButton() {
    if (fullscreen) {
      handlefullScreen()
      return true
    }
    onBackPressed()
    return true
  }

  function handleLoad(meta) {
    const oneThirdVal = (meta.duration / 4) * 3
    setProgress(0)
    setDuration(meta.duration)
    setOneThird(oneThirdVal)
    setEnded(false)
    setLoadingSpinner(false)
    setShowControls(true)
    setShowActionButton(true)
  }

  function handleProgress(progresss) {
    setProgress(progresss.currentTime)
    setBuffer(progresss.playableDuration / duration)
    if (oneThird !== 0 && oneThird !== -1) {
      if (progresss.currentTime > oneThird) {
        setOneThird(-1)
        setMarkObjectAsCompleted(true)
      }
    }
  }

  function handleEnd() {
    setPaused(true)
    setShowActionButton(true)
    setEnded(true)
  }

  function handlePlayOrPauseVideo() {
    if (duration > 0) {
      if (defaultVal === true) {
        setDefaultVal(false)
        setTimeForObjects()
        startTime.current = Math.round(new Date().getTime())
      }
      const isPaused = paused
      setPaused(!isPaused)
      setShowControls(!isPaused)
      setShowActionButton(!isPaused)
    }
  }

  function secondsToTime(time) {
    const mins = ~~((time % 3600) / 60)
    const secs = ~~time % 60
    let ret = ''
    ret += `${mins < 10 ? '0' : ''}`
    ret += `${mins}:${secs < 10 ? '0' : ''}`
    ret += `${secs}`
    return ret
  }

  function handleShowHideControls() {
    let showActionBut = !showActionButton
    if (paused) {
      showActionBut = true
    }
    if (!isShowControls && !loadingSpinner) {
      isShowControls = true
      setShowControls(!showControls)
      setShowActionButton(showActionBut)
      setTimeout(() => {
        isShowControls = false
        setShowControls(false)
        setShowActionButton(false)
      }, 5000)
    }
  }

  function slideStart() {
    setPaused(true)
    setTimeForObjects()
  }

  function slideComplete(value) {
    if (value > 0) {
      if (defaultVal === true) {
        setDefaultVal(false)

        startTime.current = Math.round(new Date().getTime())
      }
    }
    ObjectViewScreen.vid.seek(value)
    setProgress(value)
    setPaused(false)
  }

  function setTimeForObjects() {
    const objType = objectOType
    oType = objType
    if (oType === 'video' || oType === 'audio') {
      handleProgress(progress)
    } else if (oType !== 'video' || oType !== 'audio') {
      // if (isNuggetCompleted === false || isNuggetCompleted === 'false') {
      setTimeout(() => {
        setMarkObjectAsCompleted(true)
      }, 5000)
      // }
    } else {
      setMarkObjectAsCompleted(false)
    }
  }

  function onDataLoadComplete() {
    hideSpinner()
  }

  function hideSpinner() {
    setLoadingSpinner(false)
  }

  function hideSpinn() {
    setVisible(false)
  }

  function showSpinn() {
    setVisible(true)
  }

  function toggleSubview() {
    let toValue = 400
    if (isHidden) {
      toValue = 0
    }
    Animated.spring(bounceValue, {
      toValue,
      velocity: 3,
      tension: 2,
      friction: 8,
      useNativeDriver: true,
    }).start()
    if (Platform.OS === 'ios') {
      isHidden = !isHidden
    }
  }

  function handlefullScreen() {
    if (isHidden) {
      isHidden = false
      setFullScreenNextNugget(true)
      toggleSubview()
    } else if (fullscreennextnugget) {
      isHidden = true
      setFullScreenNextNugget(false)
      toggleSubview()
    }
    if (Platform.OS === 'android') {
      if (!fullscreen) {
        ObjectViewScreen.vid.presentFullscreenPlayer()
        Orientation.unlockAllOrientations()
        Orientation.lockToLandscape()
        showObjButton = true
        setMarkObjectAsCompleted(false)
        StatusBar.setHidden(true)
        navigation.setParams({
          header: null,
        })
      } else {
        ObjectViewScreen.vid.dismissFullscreenPlayer()
        Orientation.lockToPortrait()
        StatusBar.setHidden(false)
        navigation.setParams({
          header: undefined,
        })
        showObjButton = false
        if (markObjectAsComplete === true || markObjectAsComplete === 'true') {
          setTimeout(() => {
            setMarkObjectAsCompleted(true)
          }, 5000)
        } else {
          setMarkObjectAsCompleted(false)
        }
      }
      setFullScreen(!fullscreen)
    } else {
      ObjectViewScreen.vid.presentFullscreenPlayer()
      setFullScreenVid(true)
    }
  }

  function handlefullScreenHtml() {
    if (isHidden) {
      isHidden = false
      setFullScreenNextNugget(true)
      toggleSubview()
    } else if (fullscreennextnugget) {
      isHidden = true
      setFullScreenNextNugget(false)
      toggleSubview()
    }
    if (!fullscreen) {
      if (Platform.OS === 'ios') {
        setFullScreenNios(true)
      } else {
        setFullScreenNios(false)
      }
      Orientation.unlockAllOrientations()
      Orientation.lockToLandscape()
      StatusBar.setHidden(true)
      navigation.setParams({
        header: null,
      })
      fullscreenWebView.current = true
      webviewBottom = 0
      showObjButton = true
      webViewForInteractivity = 10
    } else {
      if (Platform.OS === 'ios') {
        setFullScreenNios(false)
      } else {
        setFullScreenNios(true)
      }
      Orientation.lockToPortrait()
      StatusBar.setHidden(false)
      navigation.setParams({
        header: undefined,
      })
      webviewBottom = 90
      showObjButton = false
      fullscreenWebView.current = false
      webViewForInteractivity = 70
    }
    setFullScreen(!fullscreen)
  }

  function renderNuggetView() {
    return (
      <View style={{ flex: 1 }}>
        <View style={getStyle().objects} onLayout={onLayout()}>
          {renderObjectDetails()}
        </View>
      </View>
    )
  }

  function quizDetails(quizObject) {
    navigation.navigate('QuizObject', {
      qObject: sharedObject,
      OIndex: 1,
      courseId: objectOId,
    })
  }

  async function getQuiz() {
    setSpinner(true)
    const bodyParam = {
      body: {
        quizid: objectOId,
        oid: config.aws_org_id,
        // cid: nuggetId,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    // alert(JSON.stringify(bodyParam.body))
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        Constants.GET_QUIZ,
        bodyParam
      )
      // alert(JSON.stringify(response))
      setQuizQuestion(response.qitems)
      setSpinner(false)
    } catch (error) {}
  }

  const updateObjectAnalytics = async (objectId, sharedObject, count) => {
    const bodyParam = {
      body: {
        objid: objectId,
        ur_id: userDetails?.uData?.ur_id,
        schema: config.aws_schema,
        tspent: count,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }

    if (count <= 30) {
      bodyParam.body.bounce_cnt = 1
      if (
        sharedObject?.unique_val == null ||
        sharedObject?.unique_val === undefined
      ) {
        bodyParam.body.unique_date = 1
      }
    } else {
      if (
        sharedObject?.unique_val == null ||
        sharedObject?.unique_val === undefined
      ) {
        bodyParam.body.unique_date = 1
        bodyParam.body.view_cnt = 1
      } else {
        bodyParam.body.view_cnt = 1
      }
    }

    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/updateContentReport',
        bodyParam
      )
    } catch (err) {
      console.error(err)
    }
  }

  function renderObjectDetails() {
    let objType = objectOType
    // alert(JSON.stringify(sharedObject.url))
    let objUrl
    switch (objType) {
      case 'video':
        isInterActivity.current = false
        objUrl = sharedObject.url
        return loadVideoView(objUrl)
      case 'audio':
        isInterActivity.current = false
        objUrl = sharedObject.url
        return loadAudioView(objUrl)
      case 'pdf':
        isInterActivity.current = false
        objUrl = sharedObject.url
        if (Platform.OS === 'android') {
          return loadPdfView(objUrl)
        }
        return loadMultimediaView(objUrl)
      case 'html':
        isInterActivity.current = false
        objUrl = sharedObject.url
        return loadMultimediaView(objUrl)
      case 'scorm':
        isInterActivity.current = false
        objUrl = sharedObject.ourl
        return loadScormView(objUrl)
      case 'interactivity':
        isInterActivity.current = true
        objUrl = sharedObject.url
        return loadInteractivityView(objUrl)
      case 'Interactivity':
        isInterActivity.current = true
        objUrl = sharedObject.url
        return loadInteractivityView(objUrl)
      case 'vimeo':
        isInterActivity.current = true
        code = Constants.VIMEO_URL + sharedObject.ourl
        return loadVimeoView(code)
      case 'youtube':
        isInterActivity.current = false
        code = sharedObject.ourl
        return loadYoutubeView(code)
      case 'quiz':
        isInterActivity.current = false
        qType = curObRef.current.ourl
        return formativeTestView()
      default:
        return null
    }
  }

  function loadScormView(objUrl) {
    console.log(
      `https://${Constants.DOMAIN}/#/sharingobject?val1=${objectOId}&val2=${
        userDetails?.locale
      }&val3=${config.aws_org_id.toLowerCase()}&val4=${
        userDetails?.uData?.ur_id
      }&val5=content&val8=${userDetails?.uData?.gid}`
    )
    return (
      <View style={{ height: '97%' }}>
      <WebView
        source={{
          uri: `https://${Constants.DOMAIN}/#/sharingobject?val1=${objectOId}&val2=${
            userDetails?.locale
          }&val3=${config.aws_org_id.toLowerCase()}&val4=${
            userDetails?.uData?.ur_id
          }&val5=content&val8=${userDetails?.uData?.gid}`,
        }}
        style={[styles.webView]}
        allowsInlineMediaPlayback={true}
        onLoadStart={() => showSpinn()}
        onLoad={() => hideSpinn()}
        javaScriptEnabled
      />
      </View>
    )
  }

  function formativeTestView() {
    return (
      <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
        {isLoading === false ? (
          <View
            style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}
          >
            <View style={{ marginTop: 30, marginHorizontal: 30 }}>
              <Text
                style={{
                  marginBottom: 5,
                  fontSize: 18,
                  color: Constants.app_text_color,
                }}
              >
                You can move around the questions using the 'Prev' and 'Next'
                buttons.
              </Text>
              <Text
                style={{
                  marginBottom: 5,
                  fontSize: 18,
                  color: Constants.app_text_color,
                }}
              >
                You have to answer all the questions to submit the test.
              </Text>
            </View>
            <View
              style={{
                backgroundColor: Constants.app_button_color,
                width: 100,
                height: 45,
                alignSelf: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                marginTop: 20,
              }}
            >
              <TouchableHighlight
                underlayColor="transparent"
                onPress={() => quizDetails(sharedObject)}
              >
                <Text
                  style={{
                    color: 'white',
                    fontWeight: '700',
                    fontSize: 18,
                    alignSelf: 'center',
                    justifyContent: 'center',
                  }}
                >
                  Start
                </Text>
              </TouchableHighlight>
            </View>
          </View>
        ) : null}
      </View>
    )
  }

  async function updateObjectView(res) {
    // alert(JSON.stringify(res?.rows[0]))
    const bodyParam = {
      body: {
        tenant: userDetails.locale,
        oid: config.aws_org_id,
        tid: objectOId,
        title: res?.rows[0].oname,
        eid: userDetails.username,
        otype: res?.rows[0]?.otype,
        type: 'object',
        pdate: new Date().getTime(),
        ourl: res.rows[0]?.ourl,
        schema: config.aws_schema,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    // alert(JSON.stringify(bodyParam.body))
    // console.log('recenet===', JSON.stringify(bodyParam, null, 2));
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/updateRecentViewed',
        bodyParam
      )
      // alert(JSON.stringify(response))
    } catch (err) {
      console.error(err)
    }
  }

  const addAndRemoveBookmark = async (val) => {
    setIsBookmarkedLoaded(true)
    const bodyParam = {
      body: {
        objid: objectOId,
        ur_id: userDetails?.uData?.ur_id,
        schema: config.aws_schema,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }

    if (val === 0) {
      bodyParam.body.bookmark = true
      bodyParam.body.bookmark_date = 1
    } else {
      bodyParam.body.bookmark = false
    }

    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/updateContentReport',
        bodyParam
      )
      console.log(JSON.stringify(response))
      setIsBookmarkedLoaded(false)
      getSharedObject()
    } catch (err) {
      console.error(err)
    }
  }

  const syncObjectsData = async () => {
    const bodyParam = {
      body: {
        objid: objectOId,
        ur_id: userDetails?.uData?.ur_id,
        schema: config.aws_schema,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }

    bodyParam.body.rating = isRating
    bodyParam.body.rating_date = 1
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/updateContentReport',
        bodyParam
      )
      if (response) {
        setModalVisible(false)
        getSharedObject()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getSharedObject = async () => {
    setIsBookmarkedLoaded(true)
    const bodyParam = {
      body: {
        oid: config.aws_org_id,
        tenant: userDetails.locale,
        objid: objectOId,
        ur_id: userDetails?.uData?.ur_id,
        schema: config.aws_schema,
        groups: userDetails?.uData?.gid,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    console.log('------> ' + JSON.stringify(bodyParam.body))
    // alert(JSON.stringify(bodyParam.body))
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getSharedObject',
        bodyParam
      )
      // alert(JSON.stringify(response))
      if (parseInt(response.id) === 0) {
        updateObjectView(response)
      }
      setSharedObject(response.rows[0])
      if (response.report.length > 0) {
        setReport(response?.report[0])
        sharedReport.current = response.report[0]
      } else {
        setReport(undefined)
      }
      setQtype(
        response.rows !== undefined &&
          response.rows[0] !== undefined &&
          response.rows[0].qtype !== undefined &&
          response.rows[0].qtype !== null
          ? Number(response.rows[0].qtype)
          : 2
      )

      refobj.current = response.otype
      setIsLoading(false)
      //   setBackDrop(false);
      // console.log(JSON.stringify(response));
      //   const expires = new Date().getTime() + 60 * 60 * 1000;
      //   Cookies.set("CloudFront-Expires", expires);
      //   Cookies.set("CloudFront-Policy", response.Policy);
      //   Cookies.set("CloudFront-Signature", response.Signature);
      //   Cookies.set("CloudFront-Key-Pair-Id", response.KeyPairId);
      //   setObjLoad(false);
      setIsBookmarkedLoaded(false)
      setSpinner(false)
    } catch (err) {
      console.error(err)
    }
  }

  function getStyle() {
    if (getOrientation() === 'LANDSCAPE') {
      return landscapeStyles
    }
    scrollToItem()
    return portraitStyles
  }

  function getStyle1() {
    if (getOrientation() === 'LANDSCAPE') {
      return landscapeStyles
    }
    scrollToItem()
    webViewForInteractivity = 70
    return portraitStyles
  }

  function scrollToItem() {
    // const selectedPos = OIndexRef.current;
    if (Platform.OS === 'ios') {
      if (ObjectViewScreen.flatListRef != null) {
        ObjectViewScreen.flatListRef.scrollToIndex({
          animated: true,
        })
      }
    } else if (Platform.OS === 'android') {
      if (ObjectViewScreen.flatListRef != null) {
        ObjectViewScreen.flatListRef.scrollToIndex({
          animated: true,
        })
      }
    }
  }

  function getOrientation() {
    if (fullscreen) {
      return 'LANDSCAPE'
    }
    return 'PORTRAIT'
  }

  function onLayout() {
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle('dark-content')
      // setScreen(Dimensions.get('window'));
    }
  }

  function didSelectObjectIcon(position) {
    startTime.current = Math.round(new Date().getTime())
    const objType = objectOType
    oType = objType
    let spinnerr = true
    if (
      objType === 'pdf' ||
      objType === 'html' ||
      objType === 'video' ||
      objType === 'audio' ||
      objType === 'youtube' ||
      objType === 'vimeo' ||
      objType === 'scorm'
    ) {
      isInterActivity.current = false
      // spinner.current = false;
    }
    // selectedItem.current = position;
    setLoadingSpinner(spinnerr)
    setShowControls(false)
    setShowActionButton(false)
    setFullScreen(false)
    setPaused(true)
    setEnded(true)
    setProgress(0)
    setBuffer(0)
    setDuration(0)
    setOneThird(0)
    setRefresh(!refresh)
    // }
  }

  function loadYoutubeView(code) {
    // console.log(code);
    return (
      <View style={{ postion: 'absolute' }}>
        <YoutubePlayer
          height={250}
          videoId={code}
          //   onLoadStart={() => showSpinn()}
          onReady={() => hideSpinn()}
        />
        {visible && (
          <ActivityIndicator
            style={styles.activityIndicator}
            size="large"
            color={Constants.app_button_color}
          />
        )}
      </View>
    )
  }

  function loadVimeoView(url) {
    return (
      <View style={{ height: '100%' }}>
        <WebView
          source={{ uri: url }}
          sharedCookiesEnabled
          style={{
            flex: 1,
            marginTop: 5,
            marginLeft: 5,
            marginRight: 5,
            marginBottom: webviewBottom,
          }}
          onLoadStart={() => showSpinn()}
          onLoad={() => hideSpinn()}
          onLoadEnd={() => hideSpinn()}
          javaScriptEnabled
        />
        {isInterActivity.current && Platform.OS == 'android' ? (
          <View style={getStyle1().iconView}>
            <TouchableWithoutFeedback onPress={() => handlefullScreenHtml()}>
              {!fullscreenWebView.current ? (
                <Image
                  style={getStyle1().fullscreenIconHtml}
                  source={fullScreen}
                />
              ) : (
                <Image
                  style={getStyle1().fullscreenIconHtml}
                  source={closeScreen}
                />
              )}
            </TouchableWithoutFeedback>
          </View>
        ) : null}
        {visible && (
          <ActivityIndicator
            style={styles.activityIndicator}
            size="large"
            color={Constants.app_button_color}
          />
        )}
      </View>
    )
  }

  function loadAudioView(objUrl) {
    return (
      <View pointerEvents={!networkRef.current ? 'none' : 'auto'}>
        <View
          style={{
            width: '100%',
            height: 150,
            top: 20,
            left: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
            source={audioIcon}
          />
        </View>
        <TouchableHighlight
          onPress={() => handleShowHideControls()}
          underlayColor="transparent"
        >
          <View style={getStyle().audioHolder}>
            <Video
              source={{ uri: objUrl, cache: false }}
              ref={(ref) => {
                ObjectViewScreen.vid = ref
              }}
              playInBackground={false}
              playWhenInactive={false}
              resizeMode="contain"
              onLoad={handleLoad}
              onProgress={handleProgress}
              onEnd={handleEnd}
              style={styles.video}
              paused={paused}
              repeat={repeat}
              hideControlsTimeOut={2000}
              ignoreSilentSwitch="ignore"
            />
            <View style={styles.audioActionHolder}>
              <ActivityIndicator
                style={styles.activityIndicator}
                animating={loadingSpinner}
                size="large"
                color={Constants.app_button_color}
              />

              <TouchableHighlight
                style={getStyle().actionIcon}
                onPress={() => handlePlayOrPauseVideo()}
                underlayColor="transparent"
              >
                {!paused ? (
                  <Image
                    style={{
                      width: '100%',
                      height: '100%',
                      resizeMode: 'contain',
                    }}
                    source={videoPauseIcon}
                  />
                ) : (
                  <Image
                    style={{
                      width: '100%',
                      height: '100%',
                      resizeMode: 'contain',
                    }}
                    source={videoPlayIcon}
                  />
                )}
              </TouchableHighlight>
            </View>
            <View style={getStyle().audioControls} onLayout={onLayout()}>
              <Text
                style={[styles.duration, { left: 10 }, styles.appFontFamily]}
              >
                {secondsToTime(Math.floor(progress))}
              </Text>
              <View style={getStyle().progressHolder} onLayout={onLayout()}>
                <View
                  style={{
                    width: '100%',
                    position: 'absolute',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                  }}
                >
                  {Platform.OS === 'android' ? (
                    <ProgressBar
                      style={[styles.andoidProgressView, { width: '100%' }]}
                      styleAttr="Horizontal"
                      progress={progress}
                      indeterminate={false}
                      color="white"
                    />
                  ) : (
                    <ProgressView
                      style={{ width: '100%' }}
                      progress={progress}
                      progressTintColor="white"
                    />
                  )}
                </View>
                {/* <Slider
                  thumbTouchSize={{width: 20, height: 20}}
                  thumbTintColor={Constants.app_button_color}
                  minimumTrackTintColor={Constants.app_button_color}
                  maximumTrackTintColor="transparent"
                  value={progress}
                  maximumValue={duration}
                  onSlidingStart={val => slideStart(val)}
                  onSlidingComplete={val => slideComplete(val)}
                /> */}
              </View>
              <Text
                style={[
                  styles.duration,
                  { left: Dimensions.get('window').width - 110 },
                ]}
              >
                {secondsToTime(Math.floor(duration))}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      </View>
    )
  }

  function loadVideoView(objUrl) {
    return (
      <View pointerEvents={!networkRef.current ? 'none' : 'auto'}>
        <TouchableHighlight
          onPress={() => handleShowHideControls()}
          underlayColor="transparent"
        >
          <View style={getStyle().videoHolder} onLayout={onLayout()}>
            <Video
              source={{ uri: objUrl }}
              ref={(ref) => {
                ObjectViewScreen.vid = ref
              }}
              playInBackground={false}
              playWhenInactive={false}
              resizeMode="contain"
              onLoad={handleLoad}
              onProgress={handleProgress}
              onEnd={handleEnd}
              style={styles.video}
              paused={paused}
              repeat={repeat}
              ignoreSilentSwitch="ignore"
            />
            <View style={styles.actionHolder}>
              <ActivityIndicator
                style={styles.activityIndicator}
                animating={loadingSpinner}
                size="large"
                color={Constants.app_button_color}
              />
              {showActionButton ? (
                <TouchableHighlight
                  style={getStyle().actionIcon}
                  onPress={() => handlePlayOrPauseVideo()}
                  underlayColor="transparent"
                >
                  {!paused ? (
                    <Image
                      style={{
                        width: '100%',
                        height: '100%',
                        resizeMode: 'contain',
                      }}
                      source={videoPauseIcon}
                    />
                  ) : (
                    <Image
                      style={{
                        width: '100%',
                        height: '100%',
                        resizeMode: 'contain',
                      }}
                      source={videoPlayIcon}
                    />
                  )}
                </TouchableHighlight>
              ) : null}
            </View>
            {showControls ? (
              <View style={getStyle().controls}>
                <Text
                  style={[styles.duration, { left: 10 }, styles.appFontFamily]}
                >
                  {secondsToTime(Math.floor(progress))}
                </Text>
                <View style={getStyle().progressHolder}>
                  <View
                    style={{
                      width: '100%',
                      position: 'absolute',
                      alignItems: 'center',
                      backgroundColor: 'transparent',
                    }}
                  >
                    {Platform.OS === 'android' ? (
                      <ProgressBar
                        style={[styles.andoidProgressView, { width: '100%' }]}
                        styleAttr="Horizontal"
                        progress={progress}
                        indeterminate={false}
                        color="white"
                      />
                    ) : (
                      <ProgressView
                        style={{ width: '100%' }}
                        progress={progress}
                        progressTintColor="white"
                      />
                    )}
                  </View>
                  {/* <Slider
                    thumbTouchSize={{width: 20, height: 20}}
                    thumbTintColor={Constants.app_button_color}
                    minimumTrackTintColor={Constants.app_button_color}
                    maximumTrackTintColor="transparent"
                    value={progress}
                    maximumValue={duration}
                    onSlidingStart={val => slideStart(val)}
                    onSlidingComplete={val => slideComplete(val)}
                  /> */}
                </View>
                <Text style={[styles.duration, { right: 60 }]}>
                  {secondsToTime(Math.floor(duration))}
                </Text>
                <TouchableWithoutFeedback
                  onPress={() => handlefullScreen(false)}
                >
                  {!fullscreen ? (
                    <Image
                      style={getStyle1().fullscreenIcon}
                      source={fullScreenIcon}
                    />
                  ) : (
                    <Image
                      style={getStyle1().fullscreenIcon}
                      source={closeFullScreenIcon}
                    />
                  )}
                </TouchableWithoutFeedback>
              </View>
            ) : null}
          </View>
        </TouchableHighlight>
      </View>
    )
  }

  function loadInteractivityView(objUrl) {
    // console.log(objUrl);
    return (
      <View style={{ height: '97%' }}>
        <WebView
          source={{ uri: objUrl }}
          sharedCookiesEnabled
          cacheEnabled
          // originWhitelist={['https://*']}
          style={[styles.webView]}
          onError={() => hideSpinner}
          onLoadEnd={() => onDataLoadComplete()}
          scalesPageToFit
          javaScriptEnabled
        />
        {isInterActivity.current ? (
          <View style={getStyle1().iconView}>
            <TouchableWithoutFeedback onPress={() => handlefullScreenHtml()}>
              {!fullscreenWebView.current ? (
                <Image
                  style={getStyle1().fullscreenIconHtml}
                  source={fullScreen}
                />
              ) : (
                <Image
                  style={getStyle1().fullscreenIconHtml}
                  source={closeScreen}
                />
              )}
            </TouchableWithoutFeedback>
          </View>
        ) : null}
      </View>
    )
  }

  function loadMultimediaView(objUrl) {
    return (
      <View style={{ height: '100%' }}>
        <WebView
          source={{ uri: objUrl }}
          sharedCookiesEnabled
          style={{
            flex: 1,
            marginTop: 5,
            marginLeft: 5,
            marginRight: 5,
            marginBottom: 5,
          }}
          onLoadStart={() => showSpinn()}
          onLoad={() => hideSpinn()}
          scalesPageToFit
          javaScriptEnabled
        />
        {visible && (
          <ActivityIndicator
            style={styles.activityIndicator}
            size="large"
            color={Constants.app_button_color}
          />
        )}
      </View>
    )
  }

  function loadPdfView(objUrl) {
    return (
      <View style={{ height: '100%' }}>
        {/* <ScrollView style={{ marginBottom: 30 }}> */}
        <Pdf
          source={{ uri: objUrl, cache: true }}
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

  function ratingCompleted(rating) {
    setIsRating(rating)
  }

  return (
    <View
      style={styles.container}
      pointerEvents={!networkStatusRef.current ? 'none' : 'auto'}
    >
      <View style={styles.statusBar}>
        {!fullscreen ? (
          <View style={styles.statusBar}>
            <StatusBar
              barStyle="dark-content"
              backgroundColor={Constants.app_statusbar_color}
              translucent
            />
          </View>
        ) : null}
      </View>
      {!fullscreen ? (
        <Toolbar
          left={
            <View style={styles.toolBarHolder}>
              <View>
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => onBackPressed()}
                >
                  <Image source={backIcon} style={styles.backButton} />
                </TouchableHighlight>
              </View>
              <View>
                <Text numberOfLines={1} style={styles.headerStyle}>
                  {objectOName}
                </Text>
              </View>
            </View>
          }
        />
      ) : null}
      {!fullscreen ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginHorizontal: 20,
          }}
        >
          <View style={{ flexDirection: 'row', marginTop: 15 }}>
            <View style={{ marginTop: 7 }}>
              <Rating
                type="star"
                ratingCount={5}
                imageSize={20}
                startingValue={sharedObject?.star?.toFixed(1) || '0.0'}
                readonly
                ratingColor="#702D6A"
                ratingBackgroundColor="#702D6A"
              />
            </View>
            {report === undefined ||
            report?.rating === null ||
            report?.rating_date === null ? (
              <TouchableHighlight
                underlayColor="transparent"
                onPress={() => setModalVisible(true)}
              >
                <View style={styles.startButtonHolder}>
                  <Text style={styles.startText}>Rate content</Text>
                </View>
              </TouchableHighlight>
            ) : null}
          </View>
          <View style={{ marginTop: 18 }}>
            {report?.bookmark ? (
              <TouchableOpacity
                onPress={() => {
                  setIsBookmarkedLoaded(true)
                  addAndRemoveBookmark(1)
                }}
              >
                <View style={{ alignItems: 'flex-end' }}>
                  <Image
                    source={bookmarkIcon2}
                    style={{ height: 22, width: 22 }}
                  />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setIsBookmarkedLoaded(true)
                  addAndRemoveBookmark(0)
                }}
              >
                <View style={{ alignItems: 'flex-end' }}>
                  <Image
                    source={bookmarkIcon1}
                    style={{ height: 22, width: 22 }}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : null}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.')
          setModalVisible(!modalVisible)
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={[styles.headerStyle, { marginBottom: 10 }]}>
              Please rate this content
            </Text>
            <Rating
              type="star"
              ratingCount={5}
              imageSize={30}
              minValue={1}
              startingValue={0}
              ratingColor="#702D6A"
              ratingBackgroundColor="#702D6A"
              onFinishRating={ratingCompleted}
            />
            <TouchableHighlight
              underlayColor="transparent"
              onPress={() => syncObjectsData()}
            >
              <View style={[styles.startButtonHolder, { marginTop: 20 }]}>
                <Text style={styles.startText}>Submit</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
      <View>
        <Modal
          animationType="none"
          transparent
          visible={modalSpinner}
          onRequestClose={onDismissLoadingCallback}
        >
          <View style={styles.spinnerStyle}>
            <ActivityIndicator
              animating
              size="large"
              color={Constants.app_button_color}
            />
          </View>
        </Modal>
      </View>

      <View style={styles.spinnerView}>
        {!networkStatusRef.current && (
          <Text style={[styles.noNetwork, styles.appFontFamily]}>
            No internet connectivity
          </Text>
        )}
      </View>

      {!fullscreen ? (
        <View style={{ height: '82%' }}>{renderNuggetView()}</View>
      ) : (
        <View style={{ height: '100%' }}>{renderNuggetView()}</View>
      )}
    </View>
  )
}

const landscapeStyles = StyleSheet.create({
  objects: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
  videoHolder: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    ...Platform.select({
      android: {
        top: -25,
      },
    }),
  },
  actionIcon: {
    width: 60,
    height: 60,
  },
  controls: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: 50,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
  },
  progressHolder: {
    position: 'absolute',
    height: 50,
    left: 60,
    right: 120,
    borderRadius: 20,
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  fullscreenIcon: {
    position: 'absolute',
    right: 10,
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  fullscreenIconHtml: {
    width: 24,
    height: 24,
  },
  iconView: {
    width: 40,
    flex: 1,
    flexDirection: 'row',
    paddingRight: 25,
    position: 'absolute',
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    // backgroundColor: 'green',
    bottom: 20,
  },
})

const portraitStyles = StyleSheet.create({
  objects: {
    width: Constants.app_width,
    height: '100%',
    // marginTop: 50,
    flexDirection: 'column',
    // backgroundColor: 'white',
    position: 'absolute',
  },
  videoHolder: {
    margin: 0,
    width: Constants.app_width,
    height: objectHolderHeight / 2 - 37,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  audioHolder: {
    marginTop: 40,
    width: Constants.app_width,
    height: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  actionIcon: {
    width: 60,
    height: 60,
  },
  controls: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: 50,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
  },
  spinnerStyle: {
    position: 'absolute',
    top: Constants.app_height / 2 - 50,
    height: 100,
    width: 100,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  audioControls: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: 30,
    left: 50,
    right: 0,
    bottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
  },
  progressHolder: {
    position: 'absolute',
    width: Dimensions.get('window').width - 180,
    height: 50,
    left: 60,
    borderRadius: 20,
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  fullscreenIcon: {
    position: 'absolute',
    left: Dimensions.get('window').width - 60,
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  iconView: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    paddingRight: 25,
    // top: 7,
    bottom: 20,
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    // backgroundColor: 'red',
  },
  fullscreenIconHtml: {
    width: 24,
    height: 24,
    // top: 10,
  },
  emptyListContainer: {
    justifyContent: 'center',
    flex: 1,
    bottom: 90,
  },
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.app_background_color,
  },
  button: {
    // borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: 'white',
    alignItems: 'center',
  },
  audioActionHolder: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  textStyle: {
    color: Constants.app_button_color,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    textDecorationStyle: 'solid',
    textDecorationLine: 'underline',
  },
  screenstyle: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight - 5,
      },
    }),
  },
  scrollview: {
    ...Platform.select({
      ios: {
        marginTop: 1,
      },
      android: {
        marginTop: 1,
      },
    }),
  },
  headerStyle1: {
    marginLeft: 20,
    marginRight: 15,
    //textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    fontWeight: '700',
    ...Platform.select({
      ios: {
        fontSize: 16,
        alignSelf: 'flex-start',
        marginTop: 10,
      },
      android: {
        marginTop: 10,
        fontSize: 16,
        alignSelf: 'flex-start',
      },
    }),
    color: Constants.app_text_color,
  },
  iconView: {
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    paddingRight: 25,
    // top: 7,
    bottom: 20,
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    // backgroundColor: 'red',
  },
  startButtonHolder: {
    height: 35,
    backgroundColor: Constants.app_color,
    borderRadius: 5,
    alignSelf: 'center',
    borderColor: Constants.app_grey_color,
    borderWidth: 1,
    marginLeft: 10,
  },
  startText: {
    color: Constants.app_button_color,
    fontWeight: '500',
    fontSize: 15,
    marginTop: 7,
    alignSelf: 'center',
    marginHorizontal: 5,
  },
  backButton: {
    width: 25,
    height: 25,
    tintColor: '#000000',
    alignSelf: 'center',
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
  headerStyle: {
    marginLeft: 12,
    width: Constants.app_width - 60,
    textDecorationStyle: 'solid',
    fontWeight: '700',
    color: Constants.app_text_color,
    fontSize: 16,
    ...Platform.select({
      ios: {
        marginTop: 2,
      },
      android: {
        marginTop: 0,
      },
    }),
  },
  spinnerView: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    opacity: 0.8,
    zIndex: 1000,
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
  downbar: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: '#c0c0c0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 1,
    alignContent: 'flex-end',
    flexDirection: 'row',
    // height: 50,
    // backgroundColor: 'red',
    justifyContent: 'space-between',
  },
  fullscreenIcon: {
    position: 'absolute',
    left: Dimensions.get('window').width - 60,
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  lockObjects: {
    width: Constants.app_width,
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 5, width: 5 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  lockIcon: {
    width: 80,
    height: 80,
    top: objectHolderHeight / 2 - 40,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  videoHolder: {
    margin: 0,
    width: Constants.app_width,
    height: objectHolderHeight / 2 - 37,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  activityIndicator: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionHolder: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: 60,
    height: 60,
  },
  controls: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: 50,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
  },
  duration: {
    position: 'absolute',
    width: 50,
    color: '#FFF',
    fontSize: 15,
    backgroundColor: 'transparent',
    fontFamily: Constants.app_font_family_bold,
    ...Platform.select({
      ios: {
        fontWeight: 'bold',
      },
    }),
  },
  progressHolder: {
    position: 'absolute',
    height: 50,
    left: 60,
    right: 120,
    borderRadius: 20,
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  webView: {
    flex: 1,
    marginTop: 5,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  quizButtonStyle: {
    color: Constants.app_button_text_color,
    fontSize: Constants.app_button_text_size,
    fontFamily: Constants.app_font_family_regular,
    ...Platform.select({
      ios: {
        fontWeight: 'normal',
      },
    }),
    ...Platform.select({
      android: {
        justifyContent: 'center',
        marginBottom: 1.5,
      },
    }),
  },
  pdf: {
    // flex:1,
    // bottom: 20,
    // width: Dimensions.get('window').width,
    // height: Dimensions.get('window').height,
    // backgroundColor: 'green'
    flex: 1,
    // marginTop: 5,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20%',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
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
})
