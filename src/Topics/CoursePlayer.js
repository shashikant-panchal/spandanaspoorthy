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
import Slider from 'react-native-slider'
import { WebView } from 'react-native-webview'
import Pdf from 'react-native-pdf'
import ProgressCircle from 'react-native-progress-circle'
import { object } from 'prop-types'
import Orientation from 'react-native-orientation'
import Cookie from 'react-native-cookie'
import YoutubePlayer from 'react-native-youtube-iframe'
import QuizDetailsScreen from './QuizDetails'
import { formatTime } from './QuizDetailsTimer'

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

export default function CoursePlayerScreen(props) {
  const { route, onDismissLoadingCallback, navigation } = props

  // const {courseDetails1} = route.params;
  const { oIndex1 } = route.params
  const { curObRef1 } = route.params
  const {
    objectData1,
    // nuggetId,
    compDateValue,
    completedCourse,
    lastNugget,
    courseId,
    courseDetails,
    setCourseDetails,
    curObject,
    setCurObject,
    curNugget,
    setCurNugget,
    curObjIndex,
    setCurObjIndex,
    curNuggetId,
    setCurNuggetId,
    markComplete,
    setMarkComplete,
    curNugIndex,
    setCurNugIndex,
    startTime,
    setStartTime,
    courseResume,
    setcourseResume,
    remaining,
    setRemaining,
    totalProgress,
    setTotalProgress,
    tpProgress,
    setTpProgress,
    perScore,
    setPerScore,
    totalScore,
    setTotalScore,
    isLoading,
    setIsLoading,
    certificate,
    setCertificate,
    updateCourseAnalytics,
    scormpPause,
    lastobject,
    getCourseFunction,
  } = route.params
  const courseDetailsRef = useRef()
  const [progress, setProgress] = useState()
  // const [courseDetails, setCourseDetails] = useState({});
  const [startQuiz, setStartQuiz] = useState(true)
  const [showScore, setShowScore] = useState(false)
  const [objectData, setObjectData] = useState(objectData1, [])
  const objectDataRef = useRef()
  const [assignmentLoad, setAssignmentLoad] = useState(true)
  const OIndexRef = useRef(oIndex1)
  const curObRef = useRef(curObRef1, '')
  const [modalSpinner, setModalSpinner] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const networkRef = useRef(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const networkStatusRef = useRef(true)
  const [fullscreen, setFullScreen] = useState(false)
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
  const startTimeRef = useRef('')
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
  const downloadIconRef = useRef(true)
  const [quizQuestion, setQuizQuestion] = useState([])
  const [showClock, setShowClock] = useState(false)
  const [timeCheck, setTimeCheck] = useState(0)
  const remMins = useRef(0)
  const remSecs = useRef(0)
  const noOfObjectsCompleted = useRef(0)
  const [slideProgress, setSlideProgress] = useState(0)
  const [showAnswers, setShowAnswers] = useState(false)
  const objDurationRef = useRef(0)
  const reactplayer = useRef(null)

  const [spinner, setSpinner] = useState(true)
  const [loader, setLoader] = useState(true)

  let oType
  let qType
  let isShowControls = false
  let objProgress = 0
  let showObjButton = false
  let isLastObj = false
  let isHidden = true

  const dispatch = useDispatch()
  let userDetails = useSelector(authData)

  useEffect(() => {
    // alert(JSON.stringify(showScore))
    let thisObjectDetails = { ...userDetails }
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    getCourse()
    setTimeForObjects()
    for (var k = 0; k < courseDetails.nuggets.length; k++) {
      let nflg = 0
      for (var l = 0; l < courseDetails.nuggets[k].objects.length; l++) {
        if (courseDetails.nuggets[k].objects[l].op === 1) {
          setCurNugget(courseDetails.nuggets[k])
          setCurObject(courseDetails.nuggets[k].objects[l])
          setCurObjIndex(l)
          setCurNuggetId(courseDetails.nuggets[k].nid)
          setCurNugIndex(k)
          setMarkComplete(false)
          setStartTime(new Date().getTime())
          // setProgress(
          //   Number(courseDetails.nuggets[k].objects[l].rtime) ||
          //     Number(courseDetails.nuggets[k].objects[l].oduration)
          // )
          nflg = 1
          break
        }
      }
      if (nflg === 1) {
        break
      }
    }
    let comObjects = 0
    for (let i = 0; i < objectData.length; i++) {
      if (objectData[i].op === 2 || objectData[i].op === '2') {
        comObjects = comObjects + 1
      }
    }
    const handleBeforeUnload = async () => {
      console.log('1')
    }
    noOfObjectsCompleted.current = comObjects
    const listners = [navigation.addListener('willFocus', () => checkFocus())]
    StatusBar.setHidden(false)
    Orientation.lockToPortrait()
    // BackHandler.addEventListener('hardwareBackPress', handleBackButton)
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBeforeUnload
    )
    // setTimeForObjects()
    CoursePlayerScreen.navListener = navigation.addListener('didFocus', () => {
      StatusBar.setBarStyle('dark-content')
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(Constants.app_statusbar_color)
        StatusBar.setTranslucent(true)
      }
    })
    AppState.addEventListener('change', handleAppStateChange)
    if (ended && CoursePlayerScreen.vid) {
      CoursePlayerScreen.vid.seek(0)
    }
    return () => {
      unsubscribe()
      clearInterval(CoursePlayerScreen.clockCall)
      backHandler.remove()
      AppState.removeEventListener('change', handleAppStateChange)
      listners.forEach((listner) => {
        unsubscribe()
      })
    }
  }, [])

  useEffect(() => {
    let timer
    if (showClock) {
      timer = setInterval(() => {
        setProgress((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(timer)
            setShowClock(false)
            if (objectData[OIndexRef.current].otype == 'quiz') {
              handleQuizSubmit()
            } else {
              setMarkComplete(true)
            }
            // setTimerPalyPause("pause");
            return 0
          }
          return prevTimer - 1
        })
      }, 1000)
    }
    return () => {
      clearInterval(timer)
    }
  }, [progress, showClock])

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

  async function getCourse() {
    setLoader(true)
    const bodyParam = {
      body: {
        oid: config.aws_org_id,
        eid: userDetails?.username,
        tenant: userDetails.locale,
        id: userDetails?.id,
        iid: config.aws_cognito_identity_pool_id,
        topicid: courseId,
        urid: userDetails?.uData?.ur_id,
        schema: config.aws_schema,
        groups: userDetails?.uData?.gid,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    console.log('syncUserDataWebbody----- ' + JSON.stringify(bodyParam.body))
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getTopicDetails',
        bodyParam
      )
      // console.log(JSON.stringify(response, null, 2))
      setCourseDetails(response)
      const topicsJSON = response.nuggets
      let temp = []
      for (let i = 0; i < topicsJSON.length; i++) {
        for (let j = 0; j < topicsJSON[i].objects.length; j++) {
          temp.push(topicsJSON[i].objects[j])
        }
      }
      setObjectData(temp)
      objectDataRef.current = temp
      didSelectObjectIcon(objectData[OIndexRef.current])
      // setTimeForObjects()
      if (
        objectData[OIndexRef.current].qtype == 1 ||
        objectData[OIndexRef.current].qtype == 2
      ) {
        if (objectData[OIndexRef.current].op == 2) {
          getQuizScore(objectData[OIndexRef.current])
        } else {
          setShowScore(false)
          setStartQuiz(true)
          setShowAnswers(false)
        }
      }
      setLoader(false)
    } catch (error) {
      console.error('getCoursePlayerUserError ' + error)
    }
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
        CoursePlayerScreen.vid.dismissFullscreenPlayer()
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
    // alert(objectData[OIndexRef.current].otype)
    // alert(objectData[OIndexRef.current].op)
    // alert(courseDetails.ctype)
    // alert(slideProgress)
    getCourseFunction()
    if (
      objectData[OIndexRef.current].otype != 'quiz' &&
      objectData[OIndexRef.current].otype != 'feedback' &&
      objectData[OIndexRef.current].op == 1 &&
      courseDetails.ctype == 'enforced'
      // && slideProgress > 0
    ) {
      updateResumeTime()
      // syncUserData(1)
    } else if (
      objectData[OIndexRef.current].otype != 'quiz' &&
      objectData[OIndexRef.current].otype != 'feedback' &&
      objectData[OIndexRef.current].op == 1 &&
      courseDetails.ctype == 'regular'
    ) {
      syncUserData(1)
      navigation.dispatch(CommonActions.goBack())
    } else {
      navigation.dispatch(CommonActions.goBack())
    }
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
    setSlideProgress(0)
    setDuration(meta.duration)
    setOneThird(oneThirdVal)
    setEnded(false)
    setLoadingSpinner(false)
    setShowControls(true)
    setShowActionButton(true)
  }

  function handleProgress(progresss) {
    setSlideProgress(progresss.currentTime)
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
        // setTimeForObjects()
        startTimeRef.current = Math.round(new Date().getTime())
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
    // setTimeForObjects()
  }

  function slideComplete(value) {
    if (value > 0) {
      if (defaultVal === true) {
        setDefaultVal(false)
        // setTimeForObjects();
        startTimeRef.current = Math.round(new Date().getTime())
      }
    }
    CoursePlayerScreen.vid.seek(value)
    setSlideProgress(value)
    setPaused(false)
  }

  function setTimeForObjects() {
    console.log('courseDetails----- ' + JSON.stringify(courseDetails))
    console.log(
      'objectData------ ' + JSON.stringify(objectData[OIndexRef.current])
    )
    const oType = objectData[OIndexRef.current].otype
    if (
      courseDetails.freenavigation === 'false' ||
      courseDetails.freenavigation === false
    ) {
      if (courseDetails.ctype === 'enforced') {
        if (oType != 'quiz') {
          setProgress(
            objectData[OIndexRef.current]?.rtime ??
              objectData[OIndexRef.current]?.oduration
          )
          setShowClock(true)
        }
      } else if (
        (courseDetails.ctype === 'regular' ||
          courseDetails.ctype === undefined) &&
        (oType === 'video' || oType === 'audio')
      ) {
        handleProgress(slideProgress)
      } else if (
        (courseDetails.ctype === 'regular' ||
          courseDetails.ctype === undefined) &&
        (oType !== 'video' || oType !== 'audio')
      ) {
        if (
          courseDetails.freenavigation === false ||
          courseDetails.freenavigation === 'false'
        ) {
          setTimeout(() => {
            setMarkObjectAsCompleted(true)
          }, 5000)
        }
      } else {
        setMarkObjectAsCompleted(false)
      }
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
        CoursePlayerScreen.vid.presentFullscreenPlayer()
        Orientation.unlockAllOrientations()
        Orientation.lockToLandscape()
        isLastObj = true
        showObjButton = true
        setMarkObjectAsCompleted(false)
        StatusBar.setHidden(true)
        navigation.setParams({
          header: null,
        })
      } else {
        CoursePlayerScreen.vid.dismissFullscreenPlayer()
        Orientation.lockToPortrait()
        StatusBar.setHidden(false)
        navigation.setParams({
          header: undefined,
        })
        showObjButton = false
        if (objectData.length === 1) {
          isLastObj = true
        } else if (objectData.length === OIndexRef.current + 1) {
          isLastObj = true
        } else {
          isLastObj = false
        }
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
      CoursePlayerScreen.vid.presentFullscreenPlayer()
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
      isLastObj = true
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
      if (objectData.length === 1) {
        isLastObj = true
      } else if (objectData.length === OIndexRef.current + 1) {
        isLastObj = true
      } else {
        isLastObj = false
      }
    }
    setFullScreen(!fullscreen)
  }

  async function updateResumeTime(type) {
    let temp = 0
    for (let i = 0; i < courseDetails.nuggets.length; i++) {
      for (let j = 0; j < courseDetails.nuggets[i].objects.length; j++) {
        if (
          objectData[OIndexRef.current] === courseDetails.nuggets[i].objects[j]
        ) {
          temp = i
        }
      }
    }
    var obj = {}
    obj.oid = objectData[OIndexRef.current].oid
    obj.obtime = progress
    var dataset = courseDetails
    dataset.userdataset.tresume = obj

    let coindex = OIndexRef.current
    setSpinner(true)
    const bodyParam = {
      body: {
        oid: config.aws_org_id,
        obj_id: objectData[OIndexRef.current].oid,
        op: 1,
        tid: courseDetails.tid,
        ur_id: userDetails.uData.ur_id,
        key: courseDetails.tid,
        obtime: progress,
        tenant: userDetails.locale,
        eid: userDetails.username,
        tresume: obj,
        nid: temp + 1,
        schema: config.aws_schema,
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
        '/syncUserDataWeb',
        bodyParam
      )
      // alert(JSON.stringify(response))
      navigation.dispatch(CommonActions.goBack())
    } catch (error) {
      console.error(error)
    }
  }

  async function syncUserData(type) {
    let temp = 0
    for (let i = 0; i < courseDetails.nuggets.length; i++) {
      for (let j = 0; j < courseDetails.nuggets[i].objects.length; j++) {
        if (
          objectData[OIndexRef.current] === courseDetails.nuggets[i].objects[j]
        ) {
          temp = i
        }
      }
    }
    let coindex = OIndexRef.current
    setSpinner(true)
    const bodyParam = {
      body: {
        oid: config.aws_org_id,
        status:
          courseDetails.freenavigation == 'false' ||
          courseDetails.freenavigation == false
            ? 'update'
            : 'nav',
        tid: courseDetails.tid,
        id: userDetails.id,
        iid: config.aws_cognito_identity_pool_id,
        otype: objectData[OIndexRef.current].otype,
        nugget: temp + 1,
        tnuggets: courseDetails.noofnuggets,
        nav:
          courseDetails.freenavigation == 'false' ||
          courseDetails.freenavigation == false
            ? false
            : true,
        email: userDetails.username,
        emailid: userDetails?.email,
        tenant: userDetails.locale,
        tobjects: objectData.length,
        object: coindex,
        pid: courseDetails.tid,
        ur_id: userDetails.uData.ur_id,
        obj_id: objectData[OIndexRef.current].oid,
        op: 2,
        key: courseDetails.tid,
        obtime: (new Date().getTime() - startTimeRef.current) / 1000,
        rmc: courseDetails.nuggets[temp].ntitle,
        cert: courseDetails.certification,
        schema: config.aws_schema,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    if (type !== undefined) {
      bodyParam.body.op = 1
    }
    // alert(JSON.stringify(bodyParam.body))
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/syncUserDataWeb',
        bodyParam
      )
      // alert(JSON.stringify(response));
      updateLocalUserData(courseDetails)
      // getCourse()
    } catch (error) {
      console.error(error)
    }
  }

  function updateLocalUserData(courseDetails) {
    courseDetails.userdataset.userdata = true
    courseDetails.userdataset.sd = Math.round(new Date().getTime() / 1000)
    var tp = '0'
    if (courseDetails.noofnuggets > 0) {
      tp = '1'
      for (var w = 0; w < courseDetails.noofnuggets; w++) {
        if (courseDetails.freenavigation) {
          tp = tp + '-' + '2'
        } else if (w == 0) {
          tp = tp + '-' + '1'
        } else {
          tp = tp + '-' + '0'
        }
      }
    }

    courseDetails.userdataset.tp = tp
    courseDetails.userdataset.cobj = 0
    courseDetails.userdataset.cvid = 0
    courseDetails.userdataset.cdoc = 0
    courseDetails.userdataset.cfq = 0
    courseDetails.userdataset.csq = 0
    courseDetails.userdataset.casmt = 0
    courseDetails.nresume = {}
    courseDetails.nresume.rnugget = courseDetails.nuggets[0].nid
    courseDetails.nuggets[0].objects[0].op = 1
    if (courseDetails.freenavigation) {
      for (let index = 0; index < courseDetails.nuggets.length; index++) {
        if (courseDetails.nuggets[index].objects !== undefined) {
          for (
            let oindex = 0;
            oindex < courseDetails.nuggets[index].objects.length;
            oindex++
          ) {
            courseDetails.nuggets[index].objects[oindex].op = 2
            if (
              index == courseDetails.nuggets.length - 1 &&
              oindex == courseDetails.nuggets[index].objects.length - 1
            ) {
              courseDetails.nuggets[index].objects[oindex].op = 1
            }
          }
        }
      }
    }
    if (courseDetails.nuggets[0].objects[0].otype == 'scorm') {
      scormpPause.current = false
      var obj2 = {}
      obj2.ur_id = userDetails.uData?.ur_id
      obj2.cid = courseDetails.tid
      obj2.tid = courseDetails.tid
      obj2.objid = courseDetails.nuggets[0].objects[0].oid
      obj2.atype = 0
      obj2.schema = config.schema
      obj2.curObjIndex = 0
      obj2.objlength = courseDetails.nuggets[0].objects.length - 1
      obj2.curNugIndex = 0
      obj2.nuggetlength = courseDetails.nuggets.length - 1
      window.cudetails = obj2
    }
    courseDetails.nresume.robject = 0
    setTpProgress(tp)
    setCurNugget(courseDetails.nuggets[0])
    setCurObject(courseDetails.nuggets[0].objects[0])
    setCurObjIndex(0)
    setCurNuggetId(courseDetails.nuggets[0].nid)
    setCurNugIndex(0)
    setCertificate(false)
    setProgress(
      courseDetails.nuggets[k].objects[l].rtime ??
        courseDetails.nuggets[k].objects[l].oduration
    )
    setMarkComplete(false)
    setStartTime(new Date().getTime())
    setCourseDetails(courseDetails)
    setcourseResume(courseDetails.nresume)
    // setOpen(true);
    setSpinner(false)
  }

  function renderNuggetView() {
    // alert(JSON.stringify(objectData[OIndexRef.current]))
    return (
      <View style={{ flex: 1 }}>
        <View style={getStyle().objects} onLayout={onLayout()}>
          {objectData.length != 1 && OIndexRef.current != 0 ? (
            <View>
              {objectData[OIndexRef.current].op === 0
                ? renderLockView()
                : renderObjectDetails()}
            </View>
          ) : (
            renderObjectDetails()
          )}
        </View>
      </View>
    )
  }

  function renderObjectDetails() {
    let objType = objectData[OIndexRef.current].otype
    let objUrl
    switch (objType) {
      case 'video':
        isInterActivity.current = false
        objUrl = objectData[OIndexRef.current].ourl
        return loadVideoView(objUrl)
      case 'audio':
        isInterActivity.current = false
        objUrl = objectData[OIndexRef.current].ourl
        return loadAudioView(objUrl)
      case 'pdf':
        isInterActivity.current = false
        objUrl = objectData[OIndexRef.current].ourl
        if (Platform.OS === 'android') {
          return loadPdfView(objUrl)
        }
        return loadMultimediaView(objUrl)
      case 'html':
        isInterActivity.current = false
        objUrl = objectData[OIndexRef.current].ourl
        return loadMultimediaView(objUrl)
      case 'scorm':
        isInterActivity.current = true
        objUrl = objectData[OIndexRef.current].ourl
        return loadScormView(objectData[OIndexRef.current])
      case 'interactivity':
        isInterActivity.current = true
        objUrl = objectData[OIndexRef.current].ourl
        return loadInteractivityView(objUrl)
      case 'Interactivity':
        isInterActivity.current = true
        objUrl = objectData[OIndexRef.current].ourl
        return loadInteractivityView(objUrl)
      case 'quiz':
        isInterActivity.current = false
        qType = objectData[OIndexRef.current].ourl
        downloadIconRef.current = false
        return loadQuizView(objectData[OIndexRef.current].ourl)
      case 'vimeo':
        isInterActivity.current = true
        code = Constants.VIMEO_URL + objectData[OIndexRef.current].ourl
        return loadVimeoView(code)
      case 'youtube':
        isInterActivity.current = false
        code = Constants.YOUTUBE_URL + objectData[OIndexRef.current].ourl
        return loadYoutubeView(objectData[OIndexRef.current].ourl)
      default:
        return null
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
    const selectedPos = OIndexRef.current
    if (Platform.OS === 'ios' && objectData.length >= 6) {
      if (CoursePlayerScreen.flatListRef != null) {
        CoursePlayerScreen.flatListRef.scrollToIndex({
          animated: true,
          index: selectedPos,
        })
      }
    } else if (Platform.OS === 'android') {
      if (CoursePlayerScreen.flatListRef != null) {
        CoursePlayerScreen.flatListRef.scrollToIndex({
          animated: true,
          index: selectedPos,
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
    startTimeRef.current = Math.round(new Date().getTime())
    const objType = objectData[OIndexRef.current].otype
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
    setSlideProgress(0)
    setBuffer(0)
    setDuration(0)
    setOneThird(0)
    setRefresh(!refresh)
    // }
  }

  function renderLockView() {
    return (
      <View style={styles.lockObjects}>
        <Image style={styles.lockIcon} source={lockIcon} />
      </View>
    )
  }

  function loadYoutubeView(code) {
    // console.log(code);
    return (
      <View style={{ postion: 'absolute' }}>
        <YoutubePlayer
          height={250}
          videoId={code}
          // onLoadStart={() => showSpinn()}
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
          style={{
            flex: 1,
            marginTop: 5,
            marginLeft: 5,
            marginRight: 5,
            marginBottom: webviewBottom,
          }}
          onLoadStart={() => showSpinn()}
          onLoad={() => hideSpinn()}
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
                CoursePlayerScreen.vid = ref
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
                {secondsToTime(Math.floor(slideProgress))}
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
                      progress={slideProgress}
                      indeterminate={false}
                      color="white"
                    />
                  ) : (
                    <ProgressView
                      style={{ width: '100%' }}
                      progress={slideProgress}
                      progressTintColor="white"
                    />
                  )}
                </View>
                <Slider
                  thumbTouchSize={{ width: 20, height: 20 }}
                  thumbTintColor={Constants.app_button_color}
                  minimumTrackTintColor={Constants.app_button_color}
                  maximumTrackTintColor="transparent"
                  value={slideProgress}
                  maximumValue={duration}
                  onSlidingStart={(val) => slideStart(val)}
                  onSlidingComplete={(val) => slideComplete(val)}
                />
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
                CoursePlayerScreen.vid = ref
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
                  {secondsToTime(Math.floor(slideProgress))}
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
                        progress={slideProgress}
                        indeterminate={false}
                        color="white"
                      />
                    ) : (
                      <ProgressView
                        style={{ width: '100%' }}
                        progress={slideProgress}
                        progressTintColor="white"
                      />
                    )}
                  </View>
                  <Slider
                    thumbTouchSize={{ width: 20, height: 20 }}
                    thumbTintColor={Constants.app_button_color}
                    minimumTrackTintColor={Constants.app_button_color}
                    maximumTrackTintColor="transparent"
                    value={slideProgress}
                    maximumValue={duration}
                    onSlidingStart={(val) => slideStart(val)}
                    onSlidingComplete={(val) => slideComplete(val)}
                  />
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
      <View style={{ height: '95%' }}>
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

  function loadScormView(obj) {
    // console.log(
    //   JSON.stringify(
    //     `https://${Constants.DOMAIN}/#/sharingobject?val1=${courseId}&val2=${
    //       userDetails?.locale
    //     }&val3=${config.aws_org_id.toLowerCase()}&val4=${
    //       userDetails?.uData?.ur_id
    //     }&val5=course&val6=${objectData[OIndexRef.current].oid}`
    //   )
    // )
    return (
      <View style={{ height: '97%' }}>
        <WebView
          source={{
            uri: `https://${
              Constants.DOMAIN
            }/#/sharingobject?val1=${courseId}&val2=${
              userDetails?.locale
            }&val3=${config.aws_org_id.toLowerCase()}&val4=${
              userDetails?.uData?.ur_id
            }&val5=course&val6=${objectData[OIndexRef.current].oid}`,
          }}
          style={[styles.webView]}
          allowsInlineMediaPlayback={true}
          onLoadStart={() => showSpinn()}
          onLoad={() => hideSpinn()}
          javaScriptEnabled
        />
        {visible && (
          <ActivityIndicator
            style={styles.activityIndicator}
            size="large"
            color={Constants.app_button_color}
          />
        )}
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

  function loadQuizView() {
    // alert(JSON.stringify(objectData[OIndexRef.current]))
    let qType = objectData[OIndexRef.current].qtype
    switch (qType) {
      case 1:
        return summativeTestView()
      case 2:
        return formativeTestView()
      default:
        return null
    }
  }

  const scoreAchieved = (scoreD) => {
    if (
      (scoreD / objectData[OIndexRef.current].quiz_length) * 100 >=
      parseInt(objectData[OIndexRef.current].cutoff)
    )
      return true
    return false
  }

  function AnsAch() {
    if (
      objectData[OIndexRef.current].score &&
      objectData[OIndexRef.current].score.length > 0
    ) {
      for (let i = 0; i <= objectData[OIndexRef.current].score.length; i++) {
        if (scoreAchieved(parseInt(objectData[OIndexRef.current].score[i]))) {
          return true
        } else return false
      }
    }
  }

  function formativeTestView() {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 30,
        }}
      >
        {startQuiz &&
          !AnsAch() &&
          !(
            objectData[OIndexRef.current]?.score !== undefined &&
            objectData[OIndexRef.current]?.score?.length >=
              objectData[OIndexRef.current]?.attempt
          ) && (
            <View
              style={{
                backgroundColor: Constants.app_button_color,
                width: 200,
                height: 45,
                alignSelf: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                marginTop: 20,
              }}
            >
              <TouchableHighlight
                underlayColor="transparent"
                onPress={() => quizDetails(objectData[OIndexRef.current])}
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
                  Start Assessment
                </Text>
              </TouchableHighlight>
            </View>
          )}

        {!AnsAch() &&
          objectData[OIndexRef.current]?.score?.length >=
            objectData[OIndexRef.current]?.attempt &&
          showAnswers &&
          showScore && (
            <View
              style={{
                alignSelf: 'center',
                justifyContent: 'center',
                marginTop: '10%',
                width: '80%',
              }}
            >
              <View style={{ alignSelf: 'center' }}>
                <Text
                  style={{
                    fontSize: 16,
                    textAlign: 'center',
                    marginBottom: 10,
                  }}
                >
                  {' '}
                  Your Score:
                </Text>
                <ProgressCircle
                  percent={
                    (Number(
                      objectData[OIndexRef.current]?.score[
                        objectData[OIndexRef.current]?.score.length - 1
                      ]
                    ) /
                      objectData[OIndexRef.current]?.quiz_length) *
                    100
                  }
                  radius={70}
                  borderWidth={7}
                  color={Constants.app_button_color}
                  shadowColor="#999"
                  bgColor={Constants.app_background_color}
                >
                  <Text
                    style={[
                      { fontSize: 27, textAlign: 'center' },
                      styles.appFontFamily,
                    ]}
                  >{`${Math.round(
                    (Number(
                      objectData[OIndexRef.current]?.score[
                        objectData[OIndexRef.current]?.score.length - 1
                      ]
                    ) /
                      objectData[OIndexRef.current]?.quiz_length) *
                      100
                  )}%`}</Text>
                </ProgressCircle>
              </View>
              <Text
                style={{ fontSize: 15, textAlign: 'center', marginTop: '10%' }}
              >
                {' '}
                Your Attempts have been completed, please click on Answers to
                view your last response
              </Text>
              <View
                style={{
                  backgroundColor: Constants.app_button_color,
                  width: 200,
                  height: 45,
                  alignSelf: 'center',
                  justifyContent: 'center',
                  borderRadius: 10,
                  marginTop: 40,
                }}
              >
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() =>
                    navigation.navigate('QuizAnswers', {
                      curObject: objectData[OIndexRef.current],
                      courseDetails: courseDetails,
                    })
                  }
                >
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '700',
                      fontSize: 18,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                    }}
                  >
                    Show Answers
                  </Text>
                </TouchableHighlight>
              </View>
            </View>
          )}

        {AnsAch() && showAnswers && (
          <View
            style={{
              alignSelf: 'center',
              justifyContent: 'center',
              marginTop: '10%',
              width: '80%',
            }}
          >
            <View style={{ alignSelf: 'center' }}>
              <Text
                style={{
                  fontSize: 16,
                  textAlign: 'center',
                  marginBottom: 10,
                }}
              >
                {' '}
                Your Score:
              </Text>
              <ProgressCircle
                percent={
                  (Number(
                    objectData[OIndexRef.current]?.score[
                      objectData[OIndexRef.current]?.score.length - 1
                    ]
                  ) /
                    objectData[OIndexRef.current]?.quiz_length) *
                  100
                }
                radius={70}
                borderWidth={7}
                color={Constants.app_button_color}
                shadowColor="#999"
                bgColor={Constants.app_background_color}
              >
                <Text
                  style={[
                    { fontSize: 27, textAlign: 'center' },
                    styles.appFontFamily,
                  ]}
                >{`${Math.round(
                  (Number(
                    objectData[OIndexRef.current]?.score[
                      objectData[OIndexRef.current]?.score.length - 1
                    ]
                  ) /
                    objectData[OIndexRef.current]?.quiz_length) *
                    100
                )}%`}</Text>
              </ProgressCircle>
            </View>
            <Text
              style={{ fontSize: 15, textAlign: 'center', marginTop: '10%' }}
            >
              You have completed the quiz successfully
            </Text>
            <View
              style={{
                backgroundColor: Constants.app_button_color,
                width: 200,
                height: 45,
                alignSelf: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                marginTop: 20,
              }}
            >
              <TouchableHighlight
                underlayColor="transparent"
                onPress={() =>
                  navigation.navigate('QuizAnswers', {
                    curObject: objectData[OIndexRef.current],
                    courseDetails: courseDetails,
                  })
                }
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
                  Show Answers
                </Text>
              </TouchableHighlight>
            </View>
          </View>
        )}
      </View>
    )
  }

  function summativeTestView() {
    // alert(startQuiz+ " + " +showScore)
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 30,
        }}
      >
        {startQuiz && !showScore && (
          <View>
            <View>
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <View style={{}}>
                  <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                    <Text style={{ fontSize: 16 }}>Questions: </Text>
                    <Text style={{ fontSize: 16 }}>
                      {objectData[OIndexRef.current].totalq
                        ? objectData[OIndexRef.current].totalq
                        : objectData[OIndexRef.current].oduration / 60}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                    <Text style={{ fontSize: 16 }}>Time allocated</Text>
                    <Text style={{ fontSize: 16 }}>{`${Math.floor(
                      objectData[OIndexRef.current].oduration / 60
                    )}m : ${Math.floor(
                      objectData[OIndexRef.current].oduration % 60
                    )}s`}</Text>
                  </View>
                </View>
              </View>

              <View style={{ marginVertical: 10 }}>
                <Text style={{ fontSize: 16 }}>Score per question: 1</Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: Constants.app_button_color,
                width: 200,
                height: 45,
                alignSelf: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                marginTop: 20,
              }}
            >
              <TouchableHighlight
                underlayColor="transparent"
                onPress={() => quizDetails(objectData[OIndexRef.current])}
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
                  Start Assessment
                </Text>
              </TouchableHighlight>
            </View>
          </View>
        )}
        {!startQuiz && showScore && (
          <View>
            <View
              style={{
                // backgroundColor: Constants.app_button_color,
                width: 100,
                height: 45,
                alignSelf: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  color: 'black',
                  fontWeight: '700',
                  fontSize: 18,
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}
              >
                Your score
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontWeight: '700',
                  fontSize: 18,
                  alignSelf: 'center',
                  justifyContent: 'center',
                  marginTop: 10,
                }}
              >
                {totalScore}
              </Text>
            </View>
          </View>
        )}
      </View>
    )
  }

  function quizDetails(quizObject) {
    // alert('njjnjn ' + JSON.stringify(quizObject))
    // setQIsLoading(true);
    // setShowScore(false)
    setAssignmentLoad(true)
    setModalVisible(true)
    if (quizObject.timer === true) {
      navigation.navigate('QuizDetailsTimer', {
        qObject: quizObject,
        OIndex: OIndexRef.current,
        objectData: objectData,
        courseId: courseId,
        // getQuizFunction: getQuiz,
        courseDetails: courseDetails,
        getCourse: getCourse,
        startQuiz: startQuiz,
        setStartQuiz: setStartQuiz,
        setObjectData: setObjectData,
        attempt: objectData[OIndexRef.current]?.attempt,
        updateCourseAnalytics: updateCourseAnalytics,
      })
    } else {
      navigation.navigate('QuizDetails', {
        qObject: quizObject,
        OIndex: OIndexRef.current,
        objectData: objectData,
        courseId: courseId,
        // getQuizFunction: getQuiz,
        courseDetails: courseDetails,
        getCourse: getCourse,
        startQuiz: startQuiz,
        setStartQuiz: setStartQuiz,
        setObjectData: setObjectData,
        attempt: objectData[OIndexRef.current]?.attempt,
        updateCourseAnalytics: updateCourseAnalytics,
      })
    }
  }

  function prev() {
    setTimeForObjects()
    //var newObject = JSON.parse(JSON.stringify(oldObject));
    let tobjectData = [...objectData]
    let toIndex = OIndexRef.current

    startTimeRef.current = Math.round(new Date().getTime())

    let l = tobjectData.length - 1
    if (toIndex > 0) {
      toIndex = toIndex - 1
      OIndexRef.current = toIndex
      objectData[OIndexRef.current] = tobjectData[toIndex]
    }
    if (objectData[OIndexRef.current].otype === 'quiz') {
      getCourse()
    }
    didSelectObjectIcon(toIndex)
    saveredux(toIndex)
  }

  function markCompleteObject() {
    setTimeForObjects()
    syncUserData()
    if (objectData[OIndexRef.current].otype !== 'quiz') {
      if (OIndexRef.current === objectData.length - 1) {
        updateCourseAnalytics('completed')
      }
    }
    let tcourseDetails = JSON.parse(JSON.stringify(courseDetails))
    let tobjectData = [...objectData]
    let toIndex = OIndexRef.current

    startTimeRef.current = Math.round(new Date().getTime())
    tobjectData[toIndex].op = 2

    let l = tobjectData.length - 1
    if (toIndex < l) {
      toIndex = toIndex + 1

      if (tobjectData[toIndex].op != 2) {
        tobjectData[toIndex].op = 1
      }

      OIndexRef.current = toIndex
    } else if (toIndex == l) {
      if (
        tcourseDetails.freenavigation == 'true' ||
        tcourseDetails.freenavigation == true
      ) {
      } else {
        let length = 0
        for (let i = 0; i < tobjectData.length; i++) {
          if (tobjectData[i].op == 2) {
            length++
          } else if (tobjectData[i].op == 0) {
            tobjectData[i].op = 1
          }
        }
      }
    }
    if (tobjectData[toIndex].otype === 'quiz') {
      tobjectData[toIndex].op = 1
    }
    setObjectData(tobjectData)
    objectDataRef.current = tobjectData
    setCourseDetails(tcourseDetails)
    saveredux(toIndex)
    setProgress(
      objectData[OIndexRef.current]?.rtime ??
        objectData[OIndexRef.current]?.oduration
    )
  }

  function next() {
    // setTimeForObjects()
    if (OIndexRef.current + 1 < objectData.length) {
      if (objectData[OIndexRef.current + 1].otype === 'quiz') {
        getCourse()
      }
    }
    if (
      objectData[OIndexRef.current].otype === 'quiz' &&
      objectData[OIndexRef.current].op === 2 &&
      OIndexRef.current === objectData.length - 1
    ) {
      onBackPressed()
    }
    // setTimeForObjects()
    let tobjectData = [...objectData]
    let toIndex = OIndexRef.current
    let tcourseDetails = JSON.parse(JSON.stringify(courseDetails))
    // startTime.current = Math.round(new Date().getTime())

    let l = tobjectData.length - 1
    if (toIndex < l) {
      toIndex = toIndex + 1
      OIndexRef.current = toIndex
      // curObjectRef.current = tobjectData[toIndex];
      objectData[OIndexRef.current] = tobjectData[toIndex]
    }
    // if (
    //   objectData[OIndexRef.current].otype === 'quiz' &&
    //   objectData[OIndexRef.current].op === 2
    // ) {
    //   let l = tobjectData.length - 1
    //   if (toIndex == l) {
    //     if (
    //       tcourseDetails.freenavigation == 'true' ||
    //       tcourseDetails.freenavigation == true
    //     ) {
    //     } else {
    //       let length = 0
    //       for (let i = 0; i < tobjectData.length; i++) {
    //         if (tobjectData[i].op == 2) {
    //           length++
    //         } else if (tobjectData[i].op == 0) {
    //           tobjectData[i].op = 1
    //         }
    //       }
    //     }
    //   }
    // }
    setTimeForObjects()
    didSelectObjectIcon(toIndex)
    saveredux(toIndex)
  }

  async function getQuizScore(objects) {
    try {
      //const jwttoken = (await Auth.currentSession()).idToken.jwtToken;
      const bodyParam = {
        body: {
          oid: config.aws_org_id,
          tenant: userDetails.locale,
          eid: userDetails.username,
          emailid: userDetails.email,
          obj_id: objects.oid,
          ur_id: userDetails.uData.ur_id,
          tid: courseDetails.tid,
          schema: config.aws_schema,
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getQuizScore',
        bodyParam
      )
      setShowScore(true)
      setStartQuiz(false)
      setShowAnswers(true)
      if (response && response.length > 0) {
        setPerScore(response[response?.length - 1])
        setTotalScore(response[response?.length - 1])
      }
    } catch (error) {
      console.error(error)
      setSpinner(true)
      setIsQuizLoading(false)
    }
  }

  function saveredux(toIndex) {
    let sdata = { ...userDetails }
    sdata.oindex = toIndex
    dispatch(awsSignIn(sdata))
    //navigate("/coursePlayer");
  }

  function nextButton() {
    if (objectData[OIndexRef.current].otype === 'quiz') {
      if (objectData[OIndexRef.current].op === 2) {
        return (
          <View>
            <TouchableHighlight
              underlayColor="transparent"
              onPress={() => {
                objectData[OIndexRef.current].op === 1
                  ? markCompleteObject()
                  : next()
              }}
            >
              <View style={{ marginRight: 20 }}>
                <Text
                  style={{
                    color: Constants.app_button_color,
                    fontWeight: '700',
                    fontSize: 16,
                    marginTop: 14,
                    textAlign: 'center',
                  }}
                >
                  Next{' '}
                </Text>
              </View>
            </TouchableHighlight>
          </View>
        )
      }
    } else {
      return (
        <View>
          <TouchableHighlight
            underlayColor="transparent"
            onPress={() => {
              objectData[OIndexRef.current].op === 1
                ? markCompleteObject()
                : next()
            }}
          >
            <View style={{ marginRight: 20 }}>
              <Text
                style={{
                  color: Constants.app_button_color,
                  fontWeight: '700',
                  fontSize: 16,
                  marginTop: 14,
                  textAlign: 'center',
                }}
              >
                Next{' '}
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      )
    }
  }

  function renderButtons() {
    if (objectData[OIndexRef.current].op === 0) {
      return null
    } else {
      return (
        <View>
          {fullscreen == false ? (
            <View style={styles.downbar}>
              {OIndexRef.current != 0 ? (
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => prev()}
                >
                  <View style={{ marginLeft: 20 }}>
                    <Text
                      style={{
                        color: Constants.app_button_color,
                        fontWeight: '700',
                        fontSize: 16,
                        marginTop: 14,
                        textAlign: 'center',
                      }}
                    >
                      Prev{' '}
                    </Text>
                  </View>
                </TouchableHighlight>
              ) : (
                <View></View>
              )}
              <View>
                {/* {objectData[OIndexRef.current].op === 2 ||
                  objectData[OIndexRef.current].op === '2' ? ( */}
                {nextButton()}
                {/* ) : null} */}
              </View>
              {/* )} */}
            </View>
          ) : null}
        </View>
      )
    }
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
                  {objectData[OIndexRef.current].otitle}
                </Text>
              </View>
            </View>
          }
        />
      ) : null}
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
      {!loader ? (
        <View>
          {showClock &&
          objectData[OIndexRef.current].otype !== 'quiz' &&
          (courseDetails.freenavigation == 'false' ||
            courseDetails.freenavigation === false) &&
          courseDetails.ctype === 'enforced' &&
          // showObjButton === false &&
          !fullscreen &&
          // !markObjectAsComplete &&
          objectData[OIndexRef.current].op != 2 ? (
            <View>
              <Text
                style={{
                  color: 'black',
                  fontSize: 18,
                  textAlign: 'right',

                  ...Platform.select({
                    android: { marginTop: 8 },
                    ios: { marginTop: 12, marginBottom: 10 },
                  }),
                }}
              >
                {formatTime(progress)}
              </Text>
            </View>
          ) : null}
          {!fullscreen ? (
            <View
              style={{
                ...Platform.select({
                  android: { height: '92%' },
                  ios: { height: '92%' },
                }),
              }}
            >
              {renderNuggetView()}
              {renderButtons()}
            </View>
          ) : (
            <View style={{ height: '100%' }}>{renderNuggetView()}</View>
          )}

          {/* <View>{renderButtonView()}</View> */}
        </View>
      ) : (
        <SkeletonLoader loader="notification" />
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
    // width: '100%',
    height: '100%',
    // position: 'absolute',
    // alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    // borderRadius: 5,
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
})
