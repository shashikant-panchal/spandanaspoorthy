import React, { useState, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Image,
  ImageBackground,
  Text,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  FlatList,
  StatusBar,
  Alert,
  BackHandler,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TextInput,
  SectionList,
  Pressable,
} from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import Amplify, { Cache, API, Auth, input } from 'aws-amplify'
import 'react-native-gesture-handler'
import { CommonActions, useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Pdf from 'react-native-pdf'
import LinearGradient from 'react-native-linear-gradient'
import FastImage from 'react-native-fast-image'
import CollapsibleView from '@eliav2/react-native-collapsible-view'
import Collapsible from 'react-native-collapsible'
import Toolbar from '../Profile/Toolbar'
import { isThisIPhoneX } from '../Home/isIphoneX'
import config from '../../aws-exports'
import moment from 'moment'
import Moment from 'react-moment'
import { awsSignIn, authData } from '../redux/auth/authSlice'
import { useSelector, useDispatch } from 'react-redux'
import SkeletonLoader from '../common/appSkeletonLoader'
import { ProgressBar } from '@react-native-community/progress-bar-android'
import { ProgressView } from '@react-native-community/progress-view'
import { WebView } from 'react-native-webview'
import Cookie from 'react-native-cookie'
import Constants from '../constants'
import { Rating } from 'react-native-ratings'

const topicsWidth = (Constants.app_width - 5) / 2.4 - 5
const topicsHeight = 120
const topicsImgHeight = topicsHeight / 2

const backIcon = require('../Assets/Images/back.png')
const pdfImage = require('../Assets/Images/pdf.png')
const AudioImage = require('../Assets/Images/audio.png')
const HTMLImage = require('../Assets/Images/html.png')
const reviewImage = require('../Assets/Images/review.png')
const videoImage = require('../Assets/Images/video.png')
const scormImage = require('../Assets/Images/scorm.png')
const NOScormImage = require('../Assets/Images/noScorm.png')
const NOpdfImage = require('../Assets/Images/noPdf.png')
const NOAudioImage = require('../Assets/Images/noAudio.png')
const NOHTMLImage = require('../Assets/Images/noHTML.png')
const NOreviewImage = require('../Assets/Images/noReview.png')
const NOvideoImage = require('../Assets/Images/noVideo.png')
const greenTick = require('../Assets/Images/greentick.png')
const durationIcon = require('../Assets/Images/duration.png')
const bookmarkIcon1 = require('../Assets/Images/bookmark1.png')
const bookmarkIcon2 = require('../Assets/Images/bookmark2.png')
const moduleIcon = require('../Assets/Images/modules.png')

export default function CourseStructureScreen(props) {
  const navigation = useNavigation()
  const { onDismissLoadingCallback, route, nuggetTitle, courseId } = props
  const redux = useRef({})
  const networkStatusRef = useRef(true)
  const [spinner, setSpinner] = useState(true)
  // const [courseDetails, setCourseDetails] = useState();
  // const [courseResume, setcourseResume] = useState({});
  // const [remaining, setRemaining] = useState({});
  // const [totalProgress, setTotalProgress] = useState(0);
  // const [tpProgress, setTpProgress] = useState('');
  const [refreshing, setRefreshing] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bmId, setBmId] = useState()
  const [isBookmarkedLoaded, setIsBookmarkedLoaded] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const oIndex = useRef(0)
  const curObjectRef = useRef({})
  const curObRef = useRef({})
  const [objectData, setObjectData] = useState({})
  const [isRating, setIsRating] = useState(0)

  const [courseResume, setcourseResume] = useState({})
  const [curObject, setCurObject] = useState({})
  const [curNugget, setCurNugget] = useState({})
  const [remaining, setRemaining] = useState({})
  const [curObjIndex, setCurObjIndex] = useState(0)
  const [curNuggetId, setCurNuggetId] = useState('')
  const [curNugIndex, setCurNugIndex] = useState(0)
  const [totalProgress, setTotalProgress] = useState(0)
  const [tpProgress, setTpProgress] = useState('')
  const [markComplete, setMarkComplete] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [perScore, setPerScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [courseDetails, setCourseDetails] = useState({})
  const [certificate, setCertificate] = useState(false)
  const [isQuizLoading, setIsQuizLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const scormpPause = useRef(true)
  const lastobject = useRef(false)
  const [validation, setValidation] = useState()

  const dispatch = useDispatch()
  let userDetails = useSelector(authData)
  useEffect(() => {
    // console.log("userDetailsCourseAssessment " + JSON.stringify(lastNuggetObject));
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    // SCORM.set('cmi.core.lesson_status', 'completed');
    // SCORM.save();
    // SCORM.quit();

    // const listners = [navigation.addListener('willFocus', () => checkFocus())];
    // getAssessmentData(userDetails);
    getCourse()
    let sdata = { ...userDetails }
    dispatch(awsSignIn(sdata))
    StatusBar.setHidden(false)

    // CourseStructureScreen.navListener = navigation.addListener(
    //   'didFocus',
    //   () => {
    //     StatusBar.setBarStyle('dark-content');
    //     if (Platform.OS === 'android') {
    //       StatusBar.setBackgroundColor(Constants.app_statusbar_color);
    //       StatusBar.setTranslucent(true);
    //     }
    //   },
    // );
    return () => {
      unsubscribe()
      // listners.forEach(listner => {
      //   unsubscribe();
      // });
    }
  }, [])

  function reduxRestore() {
    let sdata = { ...userDetails }
    redux.current = sdata
  }

  function onRefresh() {
    setRefreshing(true)
    getCourse().then(() => {
      setRefreshing(false)
    })
  }

  async function setCookie(data) {
    const expires = new Date().getTime() + 60 * 60 * 1000
    try {
      Cache.setItem(config.aws_org_id, data, { expires: expires })
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
      const cookie = await Cookie.get(Constants.COOKIE_URL)
    } catch (err) {}
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
    }
  }

  function onBackPressed() {
    getCourse()
    navigation.dispatch(CommonActions.goBack())
  }

  async function getCourse() {
    setSpinner(true)
    const bodyParam = {
      body: {
        oid: config.aws_org_id,
        eid: userDetails.username,
        tenant: userDetails.locale,
        id: userDetails.username,
        iid: config.aws_cognito_identity_pool_id,
        topicid: courseId,
        urid: userDetails?.uData?.ur_id,
        schema: config.aws_schema,
        groups: userDetails?.uData?.gid
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getTopicDetails',
        bodyParam
      )
      // console.log('blahhhh ' + JSON.stringify(response))
      setCourseDetails(response)
      if (
        response.userdataset !== undefined &&
        response.userdataset.userprogress !== undefined &&
        response.userdataset.userprogress.bookmark === true
      ) {
        setIsBookmarked(true)
      } else {
        setIsBookmarked(false)
      }
      const topicsJSON = response.nuggets
      let temp = []
      for (let i = 0; i < topicsJSON.length; i++) {
        for (let j = 0; j < topicsJSON[i].objects.length; j++) {
          temp.push(topicsJSON[i].objects[j])
        }
      }
      setObjectData(temp)
      setcourseResume(response.nresume)
      setRemaining({
        mremaining: response.mremaining,
        tremaining: response.tremaining,
      })
      if (response.userdataset.userdata == true) {
        setTotalProgress(
          response.userdataset.cobj === undefined
            ? 0
            : response.userdataset.cobj
        )
        setTpProgress(response.userdataset.tp)
      }
      updateRecentViewed(response)
      const expires = new Date().getTime() + 60 * 60 * 1000
      // Cookies.set("CloudFront-Expires", expires);
      // Cookies.set("CloudFront-Policy", response.Policy);
      // Cookies.set("CloudFront-Signature", response.Signature);
      // Cookies.set("CloudFront-Key-Pair-Id", response.KeyPairId);
      setSpinner(false)
    } catch (error) {
      console.error('getCourseUserError ' + error)
    }
  }

  async function updateRecentViewed(cDetails) {
    try {
      const bodyParam = {
        body: {
          eid: userDetails.username,
          noofnuggets: cDetails.noofnuggets,
          oid: config.aws_org_id,
          pdate: new Date().getTime(),
          schema: config.aws_schema,
          tduration: cDetails.tduration,
          tenant: userDetails.locale,
          tid: cDetails.tid,
          title: cDetails.ttitle,
          type: 'topic',
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/updateRecentViewed',
        bodyParam
      )
    } catch (error) {
      console.error(error)
    }
  }

  async function addAndRemoveBookmark(rowData, val) {
    try {
      const bodyParam = {
        body: {
          oid: config.aws_org_id,
          tid: rowData.tid,
          type: 'topics',
          eid: userDetails.username,
          userfullname: userDetails.name,
          emailid: userDetails?.emailid,
          tenant: userDetails?.tenant,
          ur_id: userDetails?.uData?.ur_id,
          bookmark: val === 1 ? true : false,
          schema: config.aws_schema,
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
      if (val === 1) {
        bodyParam.body.bookmark_date = 1
      }

      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/updateTopicReport',
        bodyParam
      )
      val === 1 ? setIsBookmarked(true) : setIsBookmarked(false)
      setIsBookmarkedLoaded(false)
    } catch (error) {
      console.error(error)
    }
  }

  function renderCourseStructure() {
    // console.log('---- ' + JSON.stringify(courseDetails))
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          refreshControl={
            <RefreshControl
              tintColor={Constants.app_button_color}
              colors={[Constants.app_button_color, Constants.app_button_color]}
              progressViewOffset={35}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          <View>
            <ImageBackground
              style={styles.topicImg}
              imageStyle={{ borderTopRightRadius: 10, borderTopLeftRadius: 10 }}
              source={{
                uri: `https://${
                  Constants.DOMAIN
                }/${config.aws_org_id.toLowerCase()}-resources/images/topic-images/${courseId}.png`,
                cache: 'reload',
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                marginTop: 20,
                marginHorizontal: 20,
                justifyContent: 'space-between',
              }}
            >
              <View>
                {courseDetails.star != undefined ? (
                  <Rating
                    type="star"
                    ratingCount={5}
                    imageSize={20}
                    startingValue={courseDetails.star}
                    readonly
                    ratingColor="#702D6A"
                    ratingBackgroundColor="#702D6A"
                  />
                ) : (
                  <Rating
                    type="star"
                    ratingCount={5}
                    imageSize={20}
                    startingValue={0}
                    readonly
                    ratingColor="#702D6A"
                    ratingBackgroundColor="#702D6A"
                  />
                )}
              </View>
              <View>
                {isBookmarked ? (
                  <TouchableOpacity
                    onPress={() => addAndRemoveBookmark(courseDetails, 0)}
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
                    onPress={() => addAndRemoveBookmark(courseDetails, 1)}
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
            <View>
              <Text
                style={{
                  marginVertical: 10,
                  width: '90%',
                  alignSelf: 'center',
                }}
              >
                {courseDetails.tdescription}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', marginHorizontal: 20 }}>
            <Image
              source={moduleIcon}
              style={{ height: 25, width: 25, marginTop: 2 }}
            />
            <Text
              style={{
                fontSize: 13,
                marginTop: 5,
                color: Constants.app_text_color,
              }}
            >
              {courseDetails.noofnuggets} Modules
            </Text>
          </View>
          <View
            style={{ flexDirection: 'row', marginHorizontal: 20, marginTop: 5 }}
          >
            <Image source={durationIcon} style={{ height: 16, width: 16 }} />
            <View style={{ flexDirection: 'row', marginLeft: 5 }}>
              <Text style={{ fontSize: 13, color: Constants.app_text_color }}>
                {Math.floor(courseDetails.tduration / 3600)}
              </Text>
              <Text style={{ fontSize: 13, color: Constants.app_text_color }}>
                h{' '}
              </Text>
              <Text style={{ fontSize: 13, color: Constants.app_text_color }}>
                {Math.floor((courseDetails.tduration % 3600) / 60)}
              </Text>
              <Text style={{ fontSize: 13, color: Constants.app_text_color }}>
                m{' '}
              </Text>
              <Text style={{ fontSize: 13, color: Constants.app_text_color }}>
                {Math.floor((courseDetails.tduration % 3600) % 60)}
              </Text>
              <Text style={{ fontSize: 13, color: Constants.app_text_color }}>
                s
              </Text>
            </View>
          </View>
          <View
            style={{
              height: 3,
              backgroundColor: Constants.app_grey_color,
              width: '90%',
              marginVertical: 7,
              marginLeft: 12,
            }}
          />
          {courseDetails?.nuggets.map((nugget, idx) => (
            <View style={{ marginTop: 5 }}>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '90%',
                    marginHorizontal: '5%',
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 18,
                      fontWeight: '500',
                      color: Constants.app_button_color,
                      width: '80%',
                    }}
                  >
                    {nugget.ntitle}
                  </Text>
                  <View style={{ flexDirection: 'row', marginTop: 4 }}>
                    <Text>{Math.floor(nugget.nduration / 3600)}</Text>
                    <Text>h </Text>
                    <Text>{Math.floor((nugget.nduration % 3600) / 60)}</Text>
                    <Text>m </Text>
                    <Text>{Math.floor((nugget.nduration % 3600) % 60)}</Text>
                    <Text>s</Text>
                  </View>
                </View>
                <FlatList
                  style={styles.flatListview}
                  data={nugget.objects}
                  renderItem={({ item, index }) =>
                    renderAllObjects(item, index)
                  }
                  keyExtractor={(item, index) => index.toString()}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  initialNumToRender={100}
                />
              </View>
              <View style={styles.bottomLineStyle} />
            </View>
          ))}
        </ScrollView>
        <View style={{ justifyContent: 'flex-end' }}>{renderButton()}</View>
      </View>
    )
  }

  function renderAllObjects(PValue, index) {
    return (
      <View>
        <ScrollView>
          <View style={{ marginBottom: 10, marginTop: 20, marginLeft: 10 }}>
            {renderObjectIcon(PValue)}
            {renderObjectTitle(PValue)}
            {renderTickIcon(PValue)}
          </View>
        </ScrollView>
      </View>
    )
  }

  function renderTickIcon(item) {
    if (item.op == 2) {
      return <Image style={styles.tickIcon} source={greenTick} />
    } else {
      return null
    }
  }

  function renderObjectIcon(item) {
    const objType = item.otype
    if (item.op == 0) {
      switch (objType) {
        case 'video':
          return <Image style={styles.objectIcon} source={NOvideoImage} />
        case 'audio':
          return <Image style={styles.objectIcon} source={NOAudioImage} />
        case 'html':
          return <Image style={styles.objectIcon} source={NOHTMLImage} />
        case 'scorm':
          return <Image style={styles.objectIcon} source={NOScormImage} />
        case 'pdf':
          return <Image style={styles.objectIcon} source={NOpdfImage} />
        case 'interactivity':
          return <Image style={styles.objectIcon} source={NOreviewImage} />
        case 'Interactivity':
          return <Image style={styles.objectIcon} source={NOreviewImage} />
        case 'quiz':
          return <Image style={styles.objectIcon} source={NOreviewImage} />
        case 'ppt':
          return <Image style={styles.objectIcon} source={NOreviewImage} />
        case 'pexam':
          return <Image style={styles.objectIcon} source={NOreviewImage} />
        case 'ptraining':
          return <Image style={styles.objectIcon} source={NOreviewImage} />
        case 'vimeo':
          return <Image style={styles.objectIcon} source={NOvideoImage} />
        case 'youtube':
          return <Image style={styles.objectIcon} source={NOvideoImage} />
        default:
          return null
      }
    } else {
      switch (objType) {
        case 'video':
          return <Image style={styles.objectIcon} source={videoImage} />
        case 'audio':
          return <Image style={styles.objectIcon} source={AudioImage} />
        case 'html':
          return <Image style={styles.objectIcon} source={HTMLImage} />
        case 'scorm':
          return <Image style={styles.objectIcon} source={scormImage} />
        case 'pdf':
          return <Image style={styles.objectIcon} source={pdfImage} />
        case 'interactivity':
          return <Image style={styles.objectIcon} source={reviewImage} />
        case 'Interactivity':
          return <Image style={styles.objectIcon} source={reviewImage} />
        case 'quiz':
          return <Image style={styles.objectIcon} source={reviewImage} />
        case 'ppt':
          return <Image style={styles.objectIcon} source={reviewImage} />
        case 'pexam':
          return <Image style={styles.objectIcon} source={reviewImage} />
        case 'ptraining':
          return <Image style={styles.objectIcon} source={reviewImage} />
        case 'vimeo':
          return <Image style={styles.objectIcon} source={videoImage} />
        case 'youtube':
          return <Image style={styles.objectIcon} source={videoImage} />
        default:
          return null
      }
    }
  }

  function renderObjectTitle(item) {
    return (
      <View style={{ marginRight: 60 }}>
        <TouchableHighlight
          underlayColor="transparent"
          onPress={() => onClickObject(item)}
        >
          <Text style={[styles.objectTitle]}> {item.otitle}</Text>
        </TouchableHighlight>
      </View>
    )
  }

  async function updateCourseAnalytics(ctype) {
    const bodyParam1 = {
      body: {
        oid: config.aws_org_id,
        tid: courseDetails.tid,
        email: userDetails.username,
        tenant: userDetails.locale,
        ctype,
        ur_id: userDetails.uData.ur_id,
        schema: config.aws_schema,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    if (ctype == 'bounce') {
      bodyParam1.body.bounce_cnt = 1
    }
    if (ctype == 'completed') {
      bodyParam1.body.comp_date = 1
    }
    //updateCourseAnalytics
    try {
      const res = await API.post(
        config.aws_cloud_logic_custom_name,
        '/updateTopicReport',
        bodyParam1
      )
      Alert.alert(
        'Congratulations!',
        'You have successfully completed the course',
        [{ text: 'Ok', onPress: () => onBackPressed() }],
        { cancelable: false }
      )
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  function onClickObject(details) {
    let temp = 0
    for (let i = 0; i <= objectData.length; i++) {
      if (details.oid === objectData[i].oid) {
        temp = i
        break
      }
    }
    oIndex.current = temp
    curObRef.current = objectData[temp]
    if (
      courseDetails.userdataset.userdata === false ||
      courseDetails.userdataset.userdata === 'false'
    ) {
    } else {
      navigation.navigate('CoursePlayer', {
        // courseDetails1: details,
        objectData1: objectData,
        oIndex1: oIndex.current,
        // nuggetId: nuggetId,
        curObRef1: curObRef.current,
        getCourseFunction: getCourse,
        courseId: courseId,
        fullCourseDetails: courseDetails,
        setCourseDetails: setCourseDetails,
        courseDetails: courseDetails,
        setCurObject: setCurObject,
        curObject: curObject,
        setCurNugget: setCurNugget,
        curNugget: curNugget,
        setCurObjIndex: setCurObjIndex,
        curObjIndex: curObjIndex,
        setCurNuggetId: setCurNuggetId,
        curNuggetId: curNuggetId,
        curNugIndex: curNugIndex,
        setCurNugIndex: setCurNugIndex,
        markComplete: markComplete,
        setMarkComplete: setMarkComplete,
        setStartTime: setStartTime,
        startTime: startTime,
        courseResume: courseResume,
        setcourseResume: setcourseResume,
        remaining: remaining,
        setRemainin: setRemaining,
        setTotalProgress: setTotalProgress,
        totalProgress: totalProgress,
        tpProgress: tpProgress,
        setTpProgress: setTpProgress,
        perScore: perScore,
        setPerScore: setPerScore,
        totalScore: totalScore,
        setTotalScore: setTotalScore,
        certificate: certificate,
        setCertificate: setCertificate,
        isLoading: isQuizLoading,
        setIsLoading: setIsQuizLoading,
        updateCourseAnalytics: updateCourseAnalytics,
        scormpPause: scormpPause,
        getCourse: getCourse,
        lastobject: lastobject,
        objectData1: objectData,
        oIndex1: oIndex.current,
        curObRef1: curObRef.current,
        courseId: courseId,
      })
    }
  }

  async function startCourse() {
    // setSpinner(true);
    // alert(JSON.stringify(courseDetails))
    const bodyParam = {
      body: {
        oid: config.aws_org_id,
        logintype: 'Cognito',
        status: 'new',
        key: courseDetails.tid,
        id: userDetails.id,
        iid: config.aws_cognito_identity_pool_id,
        version: courseDetails.version,
        tnuggets: courseDetails.noofnuggets,
        nav: courseDetails.freenavigation,
        email: userDetails.username,
        emailid: userDetails?.emailid,
        tenant: userDetails.locale,
        pid: courseDetails.pid,
        vtid: courseDetails.vtid,
        tid: courseDetails.tid,
        sub_date: 1,
        ur_id: userDetails.uData.ur_id,
        schema: config.aws_schema,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    // alert(JSON.stringify(bodyParam))
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/updateTopicReport',
        bodyParam
      )
      getCourse()
      navigation.navigate('CoursePlayer', {
        objectData1: objectData,
        oIndex1: 0,
        curObRef1: objectData[0],
        getCourseFunction: getCourse,
        courseId: courseId,
        fullCourseDetails: courseDetails,
        setCourseDetails: setCourseDetails,
        courseDetails: courseDetails,
        setCurObject: setCurObject,
        curObject: curObject,
        setCurNugget: setCurNugget,
        curNugget: curNugget,
        setCurObjIndex: setCurObjIndex,
        curObjIndex: curObjIndex,
        setCurNuggetId: setCurNuggetId,
        curNuggetId: curNuggetId,
        curNugIndex: curNugIndex,
        setCurNugIndex: setCurNugIndex,
        markComplete: markComplete,
        setMarkComplete: setMarkComplete,
        setStartTime: setStartTime,
        startTime: startTime,
        courseResume: courseResume,
        setcourseResume: setcourseResume,
        remaining: remaining,
        setRemainin: setRemaining,
        setTotalProgress: setTotalProgress,
        totalProgress: totalProgress,
        tpProgress: tpProgress,
        setTpProgress: setTpProgress,
        perScore: perScore,
        setPerScore: setPerScore,
        totalScore: totalScore,
        setTotalScore: setTotalScore,
        certificate: certificate,
        setCertificate: setCertificate,
        isLoading: isQuizLoading,
        setIsLoading: setIsQuizLoading,
        updateCourseAnalytics: updateCourseAnalytics,
        scormpPause: scormpPause,
        getCourse: getCourse,
        lastobject: lastobject,
        objectData1: objectData,
        oIndex1: oIndex.current,
        curObRef1: objectData[0],
        courseId: courseId,
      })
      setSpinner(false)
    } catch (error) {
      console.error('getCourseUserError ' + error)
    }
  }

  async function resumeCourse() {
    for (let k = 0; k < objectData.length; k++) {
      if (objectData[k].op === 1) {
        // alert(k)
        navigation.navigate('CoursePlayer', {
          objectData1: objectData,
          oIndex1: k,
          curObRef1: objectData[k],
          getCourseFunction: getCourse,
          courseId: courseId,
          fullCourseDetails: courseDetails,
          setCourseDetails: setCourseDetails,
          courseDetails: courseDetails,
          setCurObject: setCurObject,
          curObject: curObject,
          setCurNugget: setCurNugget,
          curNugget: curNugget,
          setCurObjIndex: setCurObjIndex,
          curObjIndex: curObjIndex,
          setCurNuggetId: setCurNuggetId,
          curNuggetId: curNuggetId,
          curNugIndex: curNugIndex,
          setCurNugIndex: setCurNugIndex,
          markComplete: markComplete,
          setMarkComplete: setMarkComplete,
          setStartTime: setStartTime,
          startTime: startTime,
          courseResume: courseResume,
          setcourseResume: setcourseResume,
          remaining: remaining,
          setRemainin: setRemaining,
          setTotalProgress: setTotalProgress,
          totalProgress: totalProgress,
          tpProgress: tpProgress,
          setTpProgress: setTpProgress,
          perScore: perScore,
          setPerScore: setPerScore,
          totalScore: totalScore,
          setTotalScore: setTotalScore,
          certificate: certificate,
          setCertificate: setCertificate,
          isLoading: isQuizLoading,
          setIsLoading: setIsQuizLoading,
          updateCourseAnalytics: updateCourseAnalytics,
          scormpPause: scormpPause,
          getCourse: getCourse,
          lastobject: lastobject,
          objectData1: objectData,
          oIndex1: k,
          curObRef1: objectData[k],
          courseId: courseId,
        })
      }
    }
  }

  async function handleRateSubmit() {
    if (isRating === 0 || isRating === '0') {
      setValidation('You must select a rating before you can click Submit')
    } else {
      const bodyParam = {
        body: {
          emailid: userDetails?.emailid,
          rating_date: 1,
          id: userDetails.id,
          iid: config.aws_cognito_identity_pool_id,
          tid: courseDetails.tid,
          email: userDetails.username,
          rating: isRating,
          oid: config.aws_org_id,
          uname: userDetails.name,
          tenant: userDetails.locale,
          ur_id: userDetails.uData.ur_id,
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
          '/updateTopicReport',
          bodyParam
        )
        // alert(JSON.stringify(response));
        setModalVisible(false)
        getCourse()
      } catch (error) {
        console.error(error)
      }
    }
  }

  function ratingCompleted(rating) {
    setIsRating(rating)
  }

  function renderButton() {
    // alert(JSON.stringify(tpProgress.charAt(0)));
    if (
      courseDetails.userdataset.userdata === false ||
      courseDetails.userdataset.userdata === 'false'
    ) {
      return (
        <TouchableHighlight
          underlayColor="transparent"
          onPress={() => startCourse()}
        >
          <View style={styles.startButtonHolder}>
            <Text style={styles.startText}>Start course</Text>
          </View>
        </TouchableHighlight>
      )
    }
    if (
      courseDetails?.userdataset?.userdata == true &&
      (tpProgress.charAt(0) == 1 || tpProgress.charAt(0) == '1')
    ) {
      return (
        <TouchableHighlight
          underlayColor="transparent"
          onPress={() => resumeCourse()}
        >
          <View style={styles.startButtonHolder}>
            <Text style={styles.startText}>Resume course</Text>
          </View>
        </TouchableHighlight>
      )
    }
    if (
      courseDetails?.userdataset?.userdata == true &&
      tpProgress !== undefined &&
      courseDetails?.userdataset?.userprogress !== undefined &&
      (courseDetails?.userdataset?.userprogress.rating === undefined ||
        courseDetails?.userdataset?.userprogress?.rating === null) &&
      (tpProgress.charAt(0) == 2 ||
        tpProgress.charAt(0) == 3 ||
        tpProgress.charAt(0) == '2' ||
        tpProgress.charAt(0) == '3')
    ) {
      {
        if (
          (courseDetails.userdataset.userdata == true ||
            courseDetails.userdataset.userdata == 'true') &&
          courseDetails.userdataset.star !== undefined
        ) {
          // alert("hi")
        } else {
          return (
            <View>
              <TouchableHighlight
                underlayColor="transparent"
                onPress={() => setModalVisible(true)}
              >
                <View style={styles.startButtonHolder}>
                  <Text style={styles.startText}>Rate course</Text>
                </View>
              </TouchableHighlight>
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                  // Alert.alert('Modal has been closed.')
                  setModalVisible(!modalVisible)
                }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text style={[styles.headerStyle, { marginBottom: 10 }]}>
                      Please rate this content
                    </Text>
                    <Text
                      style={{ color: 'red', fontSize: 11, marginBottom: 10 }}
                    >
                      {validation}
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
                      onPress={() => handleRateSubmit()}
                    >
                      <View
                        style={[styles.startButtonHolder, { marginTop: 20 }]}
                      >
                        <Text style={styles.startText}>Submit</Text>
                      </View>
                    </TouchableHighlight>
                  </View>
                </View>
              </Modal>
            </View>
          )
        }
      }
    } else return null
  }

  return (
    <View
      style={styles.container}
      pointerEvents={!networkStatusRef.current ? 'none' : 'auto'}
    >
      <LinearGradient
        start={{ x: 0.0, y: 0.0 }}
        end={{ x: 0.0, y: 1.0 }}
        colors={['#FFFFFF', '#FFFFFF']}
        style={styles.screenstyle}
      >
        <View style={styles.statusBar}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={Constants.app_statusbar_color}
            translucent
          />
        </View>
        {!spinner ? (
          renderCourseStructure()
        ) : (
          <SkeletonLoader loader="notification" />
        )}
        <View
          style={{
            flex: 1,
            position: 'absolute',
            bottom: 0,
            width: '100%',
            opacity: 0.8,
            zIndex: 1000,
          }}
        >
          {!networkStatusRef.current && (
            <Text style={[styles.noNetwork, styles.appFontFamily]}>
              No internet connectivity
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.app_background_color,
  },
  scrollview: {
    marginBottom: 20,
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
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    width: 300,
    marginTop: 16,
  },
  backButton: {
    width: 25,
    height: 25,
    tintColor: '#000000',
    alignSelf: 'center',
  },
  flatListview: {
    // flex: 1,
    // padding: 10,
    // bottom: 5,
    // backgroundColor: 'red',
  },
  durationIon: {
    height: 16,
    width: 16,
    ...Platform.select({
      ios: {
        marginTop: 15,
      },
      android: {
        marginTop: 12,
      },
    }),
    marginLeft: -10,
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
  headerStyle1: {
    marginLeft: 18,
    //textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    fontWeight: '700',
    ...Platform.select({
      ios: {
        fontSize: 16,
        // alignSelf: 'flex-start',
        marginTop: 5,
      },
      android: {
        marginTop: 15,
        fontSize: 16,
        justifyContent: 'center',
        alignSelf: 'flex-start',
      },
    }),
    color: Constants.app_text_color,
  },
  programTopicImg: {
    marginTop: 15,
    borderRadius: 10,
    width: topicsWidth + 210,
    height: topicsImgHeight + 150,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
    }),
  },
  bookmark: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    ...Platform.select({
      ios: {
        top: isThisIPhoneX() ? 42 : 22,
      },
      android: {
        top: StatusBar.currentHeight + 3,
      },
    }),
    alignSelf: 'flex-end',
    position: 'absolute',
    right: 10,
  },
  emptyData: {
    marginTop: 20,
    flex: 1,
    height: Platform.OS === 'ios' ? 87.5 : 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft:
      Platform.OS === 'ios'
        ? Constants.app_width / 2 - 187.5
        : Constants.app_width / 2 - 180,
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
  bookmarkImg: {
    width: 20,
    height: 20,
  },
  startButtonHolder: {
    height: 35,
    backgroundColor: Constants.app_button_color,
    marginBottom: 10,
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
  },
  tickIcon: {
    right: 8,
    width: 25,
    height: 25,
    bottom: 0,
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  startText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 7,
    alignSelf: 'center',
    marginHorizontal: 20,
  },
  bottomLineStyle: {
    height: 1,
    backgroundColor: Constants.app_grey_color,
    width: '90%',
    marginTop: 12,
    marginLeft: 12,
    // alignSelf: 'center',
  },
  mainbottomLineStyle: {
    height: 2,
    marginTop: 5,
    backgroundColor: Constants.app_grey_color,
    width: '90%',
    alignSelf: 'center',
    right: 5,
  },
  objectIcon: {
    left: 2,
    width: 23,
    height: 23,
    // bottom: 16,
    marginTop: -3,
    position: 'absolute',
  },
  objectTitle: {
    left: 30,
    right: 60,
  },
  disscussionInput: {
    width: '95%',
    alignSelf: 'center',
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    height: 100,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        shadowOpacity: 1,
        elevation: 2,
      },
    }),
    fontSize: 14,
  },
  embedsubmitfield: {
    width: '100%',
    height: 300,
    // backgroundColor:'yellow',
  },
  input: {
    flex: 1,
    marginTop: 2,
    marginLeft: 7,
    color: Constants.app_text_color,
    ...Platform.select({
      android: {
        fontSize: 14,
      },
      ios: {
        fontSize: 16,
      },
    }),
    fontFamily: Constants.app_font_family_regular,
    padding: 0,
  },
  buttonContainer: {
    alignSelf: 'flex-end',
    marginTop: 20,
    width: '40%',
    height: '40%',
  },
  buttonLogin: {
    width: '100%',
    marginTop: 5,
    marginRight: 10,
    height: 30,
    alignSelf: 'center',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  buttonStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: Constants.app_button_text_color,
    fontSize: Constants.app_button_text_size,
    fontFamily: Constants.app_font_family_regular,
    ...Platform.select({
      ios: {
        fontWeight: 'bold',
      },
    }),
    ...Platform.select({
      android: {
        justifyContent: 'center',
        marginBottom: 1.5,
        fontWeight: '700',
      },
    }),
  },
  root: {
    width: '100%',
    height: '100%',
    backgroundColor: 'yellow',
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#8fb1aa',
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
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
  topicImg: {
    marginTop: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    width: Constants.app_width - 40,
    height: Constants.app_width / 2.2,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
    }),
  },
})
