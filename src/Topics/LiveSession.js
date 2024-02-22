/* eslint-disable no-alert */
/* eslint-disable consistent-return */
import React, { useEffect, useRef, useState } from 'react'
import {
  StyleSheet,
  Image,
  ImageBackground,
  TextInput,
  Text,
  View,
  FlatList,
  StatusBar,
  Platform,
  Keyboard,
  TouchableHighlight,
  RefreshControl,
  Alert,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
} from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import LinearGradient from 'react-native-linear-gradient'
import Amplify, { Cache, API, Auth } from 'aws-amplify'
import config from '../../aws-exports'
import SInfo from 'react-native-sensitive-info'
import Toolbar from '../Profile/Toolbar'
import Constants from '../constants'
import SkeletonLoader from '../common/appSkeletonLoader'
import { awsSignIn, authData } from '../redux/auth/authSlice'
import { useSelector, useDispatch } from 'react-redux'
import { CommonActions } from '@react-navigation/native'
import { ProgressBar } from '@react-native-community/progress-bar-android'
import { ProgressView } from '@react-native-community/progress-view'
import moment from 'moment'

const emptyResultIcon = require('../Assets/Images/nocategory.png')
const backIcon = require('../Assets/Images/back.png')
const profileIcon = require('../Assets/Images/profile_icon.png')
const liveSession = require('../Assets/Images/liveSession.png')

const exploreWidth = (Constants.app_width - 20) / 2 - 10
const exploreHeight = exploreWidth - 30
const myTopicsWidth = (Constants.app_width - 10) / 2 - 10
const topicsWidth = Constants.app_width / 3.8
const topicsHeight = 140
const topicsImgHeight = topicsHeight / 1.2
let myTopicsHeight = myTopicsWidth
let toolbarHeight

if (myTopicsHeight / 2 < 80) {
  myTopicsHeight += 10
}
if (myTopicsHeight <= 155) {
  myTopicsHeight += 10
}
if (Platform.OS === 'android') {
  toolbarHeight = 50
} else {
  toolbarHeight = 45
}

const INITIAL_STATE = {
  regUsername: '',
  designation: '',
  department: '',
  organization: '',
  officeAddress: '',
  pin: '',
  mobile: '',
  state: '',
  city: '',
  email: '',
  std: '',
  phone: '',
  gst: '',
  pan: '',
  ext: '',
}

export default function LiveSessionScreen(props) {
  const { navigation, route } = props
  const { sessionName, sessionId } = route.params
  const [spinner, setSpinner] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const thisSessionData = useSelector((state) => state?.thisSessionData?.value)
  console.log(thisSessionData)
  const [completeData, setCompleteData] = useState({})
  const [openSpeaker, setSpeaker] = useState(false)
  const [speakerLoading, setSpeakerLoading] = useState(false)
  const [speakerDetails, setSpeakerDetails] = useState({})
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const [expressInterestLoader, setExpressInterestLoader] = useState(false)
  const [regOpen, setRegOpen] = useState(false)
  const [regButton, setRegButton] = useState(false)
  const [sessionJoin, setSessionJoin] = useState(false)
  const [gray, setGray] = useState(false)
  const [certificate, setCertificate] = useState(false)
  const [slides, setSlides] = useState(false)
  const [slideOpen, setSlideOpen] = useState(false)
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [expressInterest, setExpressInterest] = useState(false)
  const [paylater, setPaylater] = useState(false)
  const [certificateOpen, setCertificateOpen] = useState(false)
  const [checkSessionLimitLoader, setCheckSessionLimitLoader] = useState(false)
  const [joinButtonLoader, setJoinButtonLoader] = useState(false)
  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState(INITIAL_STATE)
  const [dataJoinDtls, setdataJoinDtls] = useState({})
  const [organization, setOrganization] = useState('')
  const [designation, setDesignation] = useState('')
  const [department, setDepartment] = useState('')
  const [completePopUp, setCompletePopUp] = useState(false)
  const [joinedMsg, setJoinedMsg] = useState(false)
  const dispatch = useDispatch()
  let userDetails = useSelector(authData)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    fetchSession()
    LiveSessionScreen.navListener = navigation.addListener('didFocus', () => {
      StatusBar.setBarStyle('dark-content')
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(Constants.app_statusbar_color)
        StatusBar.setTranslucent(true)
      }
    })
    return () => {
      // NetInfo.removeEventListener('connectionChange', handleConnectivityChange);
      unsubscribe()
      //   ExploreScreen.navListener.remove();
    }
  }, [])

  function handleConnectivityChange(isConnected) {
    if (isConnected === false) {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      })
      setConnectionStatus(false)
      setSpinner(false)
    } else {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      })
      setConnectionStatus(true)
    }
  }

  function onRefresh() {
    setRefreshing(true)
    fetchSession().then(() => {
      setRefreshing(false)
    })
  }

  async function getJoinDetails() {
    const bodyParam = {
      body: {
        oid: config.aws_org_id,
        schema: config.aws_schema,
        ur_id: userDetails.uData?.ur_id,
        sid: sessionId,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }

    try {
      let response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/joinDetails',
        bodyParam
      )
      setdataJoinDtls(response.body)
    } catch (err) {
      throw err
    }
  }

  async function fetchSession() {
    setSpinner(true)
    const bodyParam = {
      body: {
        ur_id: userDetails?.uData?.ur_id,
        tenant: userDetails?.uData?.oid,
        eid: userDetails.sub,
        sid: sessionId,
        schema: config.aws_schema,
        emailid: userDetails?.email,
        groups: userDetails?.uData?.gid,
      },
      headers: {
        'content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    console.log(JSON.stringify(bodyParam.body))
    try {
      const data = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getSessionDetails',
        bodyParam
      )
      //  alert(JSON.stringify(data?.sData?.date_list))
      setCompleteData(data)
      if (data) {
        const multidayarray = data?.sData?.date_list
        if (multidayarray !== undefined && multidayarray != null) {
          var startTime = moment(
            new Date(multidayarray[0]?.combineStartTime).getTime()
          )
          var endTime = moment(
            new Date(
              multidayarray[multidayarray.length - 1]?.combineEndTime
            ).getTime()
          )
          var minutesDiff = endTime.diff(startTime, 'minutes')
          console.log('minuteDifference', minutesDiff)
          let currentTime = data.currentTime
          let sTime = new Date(multidayarray[0].combineStartTime).getTime()
          var eTime = new Date(multidayarray[0]?.combineEndTime).getTime()
          let sessionData = data?.sData

          let timeDuration = moment(sTime).add(minutesDiff, 'm').toDate()
          let before10Min = moment(sTime).subtract(10, 'm').toDate()
          let completeButtonEnable = moment(sTime).add(5, 'm').toDate()
          let completeButtonDisable = moment(eTime).add(60, 'm').toDate()
          let JoinTime = moment(currentTime).toDate()
          console.log({ completeButtonEnable, completeButtonDisable, JoinTime })
          let EndTimes = moment(endTime).toDate()
          setSessionCompleted(false)

          let dataJoinDtls =
            data?.loginLogoutDetails.length > 0
              ? data?.loginLogoutDetails[0]
              : null

          if (
            before10Min.getTime() <= JoinTime.getTime() &&
            JoinTime.getTime() <= timeDuration.getTime() /* &&
                sessionData?.weblink !== null */
          ) {
            setSessionJoin(true)
            setGray(false)
          } else if (
            data?.sData?.slide_oname !== '' &&
            data?.sData?.slide_oname !== null &&
            data?.sData?.slide_tname !== null &&
            data?.sData?.slide_tname !== '' &&
            dataJoinDtls != null &&
            dataJoinDtls?.end_time != null
          ) {
            setSessionJoin(false)
            setGray(true)
          } else {
            setSessionJoin(true)
            setGray(true)
          }
          console.log(
            JoinTime.getTime() > completeButtonEnable.getTime() &&
              JoinTime.getTime() <= completeButtonDisable.getTime()
          )
          if (
            JoinTime.getTime() > completeButtonEnable.getTime() &&
            JoinTime.getTime() < completeButtonDisable.getTime()
          ) {
            setSessionCompleted(true)

            if (dataJoinDtls == null) setSessionCompleted(false)

            if (dataJoinDtls !== undefined && dataJoinDtls !== null) {
              if (dataJoinDtls?.end_time?.length > 0) {
                setSessionCompleted(false)
              }
            }

            if (dataJoinDtls !== undefined && dataJoinDtls !== null) {
              if (
                dataJoinDtls?.start_time?.length > 0 &&
                dataJoinDtls?.end_time === null
              ) {
                setSessionCompleted(true)
              }
            }
          }

          if (dataJoinDtls !== undefined && dataJoinDtls !== null) {
            if (
              dataJoinDtls?.start_time?.length > 0 &&
              dataJoinDtls?.end_time === null
            ) {
              setJoinedMsg(true)
            }
          }

          if (JoinTime.getTime() > EndTimes.getTime()) {
            setSlides(false)
            if (data?.feedback === true) {
              setFeedback(false)
            } else {
              setFeedback(true)
            }
            if (
              data?.sData?.slide_oname !== '' &&
              data?.sData?.slide_oname !== null &&
              data?.sData?.slide_tname !== null &&
              data?.sData?.slide_tname !== '' &&
              dataJoinDtls?.end_time != null
            ) {
              setSlides(true)
            }
          }
          if (
            dataJoinDtls &&
            dataJoinDtls?.end_time &&
            dataJoinDtls?.end_time?.length > 0 &&
            data?.feedback === true
          )
            setSessionJoin(false)
        }
      }
      setSpinner(false)
    } catch (error) {
      setSpinner(false)
      console.error('err ' + error)
    }
  }

  function formatUrl(url) {
    var httpString = 'http://',
      httpsString = 'https://'
    if (
      url.substr(0, httpString.length) !== httpString &&
      url.substr(0, httpsString.length) !== httpsString
    )
      url = httpString + url

    return url
  }

  const handleJoinSession = async (type) => {
    setJoinButtonLoader(true)
    const bodyParam = {
      body: {
        oid: config.aws_org_id,
        tenant: userDetails.tenant,
        eid: userDetails.sub,
        sessionID: sessionId,
        schema: config.aws_schema,
        ur_id: userDetails?.uData?.ur_id,
        type: type,
      },
      headers: {
        'content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    // alert(JSON.stringify(bodyParam.body))
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/joinSession',
        bodyParam
      )
      // alert(JSON.stringify(response))
      setJoinButtonLoader(false)
      if (type === 'JOIN') {
        if (completeData?.sData?.weblink !== null) {
          const url = formatUrl(completeData?.sData?.weblink)
          Linking.openURL(`${url}`)
        }
        if (completeData?.sData?.stype === 2) {
          setJoinedMsg(true)
        }
      }
      if (type === 'END') {
        setSessionCompleted(false)
        setCompletePopUp(false)
        navigation.navigate('Feedback', {
          sessionId: sessionId,
          fetchSession: fetchSession,
        })
      }
      fetchSession()
    } catch (error) {
      console.error(error)
      setJoinButtonLoader(false)
    }
  }

  const handleClickSpeakerOpen = async (details) => {
    setSpeaker(true)
    setSpeakerDetails(details)
  }

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack())
  }

  const handleSubmit = async () => {
    const values = {
      ratings: {
        sessionRate: '4',
        instructorRate: '4',
        impactRate: '3',
      },
      q1: {
        s1: parseInt(1),
        s2: parseInt(2),
        s3: parseInt(3),
        s4: parseInt(4),
        s5: parseInt(6),
        s6: 'jlhjh',
      },
      q2: { s1: parseInt(1), s2: 'cnljkc' },
      q3: { s1: parseInt(2), s2: 'nckjdlhc' },
      q4: {
        s1: parseInt(1),
        s2: parseInt(1),
        s3: parseInt(1),
        s4: parseInt(1),
        s5: 'cfdec',
      },
      q5: {
        s1: parseInt(1),
        s2: parseInt(1),
        s3: 'cfc',
      },
      q6: 'cfcdc',
      q7: 'fcfdvc',
      org: organization,
      design: designation,
      depart: department,
    }
    const bodyParam = {
      body: {
        fd: values,
        ur_id: userDetails?.uData?.ur_id,
        sid: sessionId,
        schema: config.aws_schema,
      },

      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Authorization: jwttoken,
      },
    }
    // console.log(JSON.stringify(bodyParam, null, 2));
    try {
      setLoading(true)
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/addFeedBack',
        bodyParam
      )
      // alert(JSON.stringify(response))
      // window.location.reload();
      setLoading(false)
      Alert.alert(
        'Success',
        'Successfully submitted your feedback',
        [
          {
            text: 'Ok',
            onPress: () => {
              setFeedbackFormOpen(false)
              fetchSession()
            },
          },
        ],
        { cancelable: false }
      )
    } catch (error) {
      // alert(JSON.stringify(error))
      setLoading(false)
    }
  }

  function sessionCheck() {
    // alert(JSON.stringify(completeData?.loginLogoutDetails[0]?.end_time))
    console.log(JSON.stringify(completeData))
    return (
      <View>
        <View style={{ flex: 1 }}>
          {completeData !== undefined &&
            completeData?.sData !== undefined &&
            Object.keys(completeData?.sData).length > 0 && (
              <View style={{ flex: 1, width: '100%', height: '100%' }}>
                <View>
                  <ImageBackground
                    style={styles.topicImg}
                    //   imageStyle={{ borderTopRightRadius: 10, borderTopLeftRadius: 10 }}
                    source={liveSession}
                  />
                </View>

                <View style={{ marginTop: 20, marginHorizontal: 20 }}>
                  {completeData?.sData?.startdate && (
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        marginVertical: 10,
                      }}
                    >
                      Start date & time ;
                      {moment(parseInt(completeData?.sData?.startdate)).format(
                        'MMMM Do YYYY, h:mm A'
                      )}
                    </Text>
                  )}
                  {completeData?.sData?.enddate && (
                    <Text style={{ fontSize: 16, fontWeight: '600' }}>
                      End date & time &#58;
                      {/* <span style={{ marginLeft: '5px' }}></span> */}
                      {moment(parseInt(completeData?.sData?.enddate)).format(
                        'MMMM Do YYYY, h:mm A'
                      )}
                    </Text>
                  )}
                  {completeData?.sData?.date_list && (
                    <View>
                      <View>
                        <Text style={{ fontSize: 16, fontWeight: '600' }}>
                          Session Date & Time :
                        </Text>
                      </View>

                      {completeData?.sData?.date_list[0]?.combineStartTime !==
                        undefined &&
                        completeData?.sData?.date_list?.map((item) => {
                          return (
                            <View style={{ marginVertical: 10 }}>
                              <Text style={{ fontSize: 15 }}>
                                {moment(item.combineStartTime).format(
                                  'DD/MM/YYYY'
                                )}
                              </Text>
                              <Text>
                                {moment(item.combineStartTime).format('LT')}-
                                {moment(item.combineEndTime).format('LT')}
                              </Text>
                            </View>
                          )
                        })}
                      {completeData?.sData?.date_list[0]?.combineStartTime ===
                        undefined && (
                        <Text style={{ fontSize: 15, marginVertical: 10 }}>
                          yet to be scheduled
                        </Text>
                      )}
                    </View>
                  )}

                  <View>
                    <View style={{ flexDirection: 'row' }}>
                      {completeData?.sData?.speaker_type === null ? (
                        <Text style={{ fontSize: 16, fontWeight: '600' }}>
                          Speaker:{' '}
                        </Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                          }}
                        >
                          {completeData?.sData?.speaker_type}:{' '}
                        </Text>
                      )}
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'normal',
                          color: Constants.app_blue_color,
                        }}
                        onPress={async () => {
                          handleClickSpeakerOpen(
                            completeData?.sData?.speakers[0]
                          )
                        }}
                      >
                        {completeData?.sData?.speakers?.length !== 0 &&
                          completeData?.sData?.speakers[0].name}
                      </Text>
                    </View>
                    {completeData?.sData?.speakers.map((speaker, idx) => {
                      let rightSpeaker = []
                      if (idx !== 0) {
                        rightSpeaker.push(speaker)
                      }
                      return (
                        <View key={idx + 'sdfjfgfdg'}>
                          {rightSpeaker.map((sp, id) => (
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: 'normal',
                                marginTop: 0,
                                color: Constants.app_blue_color,
                              }}
                              onPress={() => {
                                handleClickSpeakerOpen(sp)
                              }}
                            >
                              {sp.name}
                            </Text>
                          ))}
                        </View>
                      )
                    })}
                    {(completeData?.sData?.priceinr > 0 ||
                      completeData?.sData?.priceusd) > 0 &&
                      (completeData?.sData?.paid === true ||
                        completeData?.sData?.paid === 'true') && (
                        <View
                          style={{ marginVertical: 5, flexDirection: 'row' }}
                        >
                          <Text style={{ fontSize: 16, fontWeight: '600' }}>
                            Fees &#58;
                          </Text>
                          <Text style={{ marginTop: 2 }}>
                            {' '}
                            INR {completeData?.sData?.priceinr} (Inc. of GST){' '}
                          </Text>
                          {completeData?.sData?.priceusd > 0 && (
                            <Text style={{ marginTop: 2 }}>
                              / USD {completeData?.sData?.priceusd ?? ''}
                            </Text>
                          )}
                        </View>
                      )}

                    {completeData?.sData?.earlydate &&
                      (completeData?.sData?.paid === true ||
                        completeData?.sData?.paid === 'true') && (
                        <View style={{ marginBottom: 5, flexDirection: 'row' }}>
                          <Text style={{ fontSize: 16, fontWeight: '600' }}>
                            Early Bird Offer:{' '}
                          </Text>
                          <View>
                            <Text style={{ marginTop: 2 }}>
                              INR {completeData?.sData?.earlypriceinr ?? '0'}
                              (Inc. of GST)
                              {completeData?.sData?.earlypriceusd > 0 && (
                                <Text style={{ marginTop: 2 }}>
                                  / USD{' '}
                                  {completeData?.sData?.earlypriceusd ?? '0'}{' '}
                                  till
                                </Text>
                              )}{' '}
                              {moment(
                                parseInt(completeData?.sData?.earlydate)
                              ).format('DD MMM YYYY')}
                            </Text>
                          </View>
                        </View>
                      )}
                    {completeData?.sData?.perdis !== null &&
                      completeData?.sData?.perdis > 0 &&
                      (completeData?.sData?.paid === true ||
                        completeData?.sData?.paid === 'true') && (
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ fontSize: 16, fontWeight: '600' }}>
                            Percentage Discount &#58;
                          </Text>
                          <Text>{completeData?.sData?.perdis} %</Text>
                        </View>
                      )}
                    {completeData?.sData?.perdis > 0 && (
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={{ fontSize: 16, fontWeight: '600' }}>
                          Price after Discount &#58;
                        </Text>
                        <Text>
                          INR {completeData?.sData?.priceafterinr ?? '0'} (Inc.
                          of GST) / <Text> USD </Text>
                          {completeData?.sData?.priceafterusd ?? '0'}{' '}
                        </Text>
                      </View>
                    )}
                    {completeData?.sData?.stype !== null &&
                      (completeData?.sData?.stype === 2 ||
                        completeData?.sData?.stype === 3) &&
                      completeData?.sData?.location_value !== null &&
                      completeData?.sData?.location_value !== 'null' &&
                      completeData?.sData?.location_value !== '' && (
                        <View style={{ flexDirection: 'row', marginTop: 7 }}>
                          <Text style={{ fontSize: 16, fontWeight: '600' }}>
                            Location:
                          </Text>
                          <Text style={{ marginTop: 2 }}>
                            {' '}
                            {completeData?.sData?.location_value}
                          </Text>
                        </View>
                      )}
                    {completeData?.sData?.stype !== null &&
                      completeData?.sData?.note !== 'null' &&
                      completeData?.sData?.note !== '' && (
                        <View style={{ flexDirection: 'row' }}>
                          <Text style={{ fontSize: 16, fontWeight: '600' }}>
                            Note &#58;
                          </Text>
                          <Text style={{ marginTop: 2 }}>
                            {completeData?.sData?.note}
                          </Text>
                        </View>
                      )}
                  </View>

                  <View
                    style={{
                      marginVertical: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {sessionJoin &&
                      completeData?.loginLogoutDetails[0]?.end_time ==
                        undefined && (
                        <View
                          style={{ alignItems: 'center', marginVertical: 20 }}
                        >
                          <View>
                            {gray ? (
                              <View
                                style={{
                                  height: 30,
                                  width: 130,
                                  backgroundColor: Constants.app_grey_color,
                                }}
                              >
                                {completeData?.sData?.stype === 2 ? (
                                  <Text
                                    style={{
                                      textAlign: 'center',
                                      marginTop: 6,
                                      fontWeight: '600',
                                      color: 'white',
                                    }}
                                  >
                                    Join session
                                  </Text>
                                ) : (
                                  <Text
                                    style={{
                                      textAlign: 'center',
                                      marginTop: 6,
                                      fontWeight: '600',
                                      color: 'white',
                                    }}
                                  >
                                    Join live session
                                  </Text>
                                )}
                              </View>
                            ) : (
                              <View
                                style={{
                                  height: 30,
                                  width: 130,
                                  backgroundColor: Constants.app_button_color,
                                }}
                              >
                                {completeData?.sData?.stype === 2 ? (
                                  <Text
                                    style={{
                                      textAlign: 'center',
                                      marginTop: 6,
                                      fontWeight: '600',
                                      color: 'white',
                                    }}
                                    onPress={() => {
                                      handleJoinSession('JOIN')
                                    }}
                                  >
                                    Join session
                                  </Text>
                                ) : (
                                  <Text
                                    style={{
                                      textAlign: 'center',
                                      marginTop: 6,
                                      fontWeight: '600',
                                      color: 'white',
                                    }}
                                    onPress={() => {
                                      handleJoinSession('JOIN')
                                    }}
                                  >
                                    Join live session
                                  </Text>
                                )}
                              </View>
                            )}
                          </View>
                          {completeData?.uData?.aprstatus === 1 &&
                            completeData?.sData?.web_id &&
                            completeData?.sData?.web_pass && (
                              <View style={{ marginTop: 7 }}>
                                <Text>
                                  Meeting ID : {completeData?.sData?.web_id}
                                </Text>
                                <Text>
                                  Password : {completeData?.sData?.web_pass}
                                </Text>
                              </View>
                            )}
                        </View>
                      )}
                    {sessionCompleted && (
                      <View
                        style={{
                          height: 30,
                          width: 130,
                          backgroundColor: Constants.app_button_color,
                        }}
                      >
                        <Text
                          style={{
                            textAlign: 'center',
                            marginTop: 6,
                            fontWeight: '600',
                            color: 'white',
                          }}
                          onPress={() => {
                            setCompletePopUp(true)
                          }}
                        >
                          Completed session
                        </Text>
                      </View>
                    )}
                    {completeData?.loginLogoutDetails.length != 0 &&
                      completeData?.loginLogoutDetails[0].end_time !=
                        undefined &&
                      !completeData?.feedback && (
                        <View
                          style={{
                            height: 30,
                            width: 130,
                            backgroundColor: Constants.app_button_color,
                          }}
                        >
                          <Text
                            style={{
                              textAlign: 'center',
                              marginTop: 6,
                              fontWeight: '600',
                              color: 'white',
                            }}
                            onPress={() => {
                              navigation.navigate('Feedback', {
                                sessionId: sessionId,
                                fetchSession: fetchSession,
                              })
                            }}
                          >
                            Feedback
                          </Text>
                        </View>
                      )}
                    {sessionCompleted && (
                      <View
                        style={{
                          height: 30,
                          width: 130,
                        }}
                      >
                        {!certificate && completeData?.feedback && (
                          <Text style={{ fontSize: 16 }}>
                            Admin should mark attendance to view certificate
                          </Text>
                        )}
                      </View>
                    )}

                    {slides && (
                      <View style={{ marginTop: 20 }}>
                        <View
                          style={{
                            height: 30,
                            width: 130,
                            backgroundColor: Constants.app_button_color,
                          }}
                        >
                          <Text
                            style={{
                              textAlign: 'center',
                              marginTop: 6,
                              fontWeight: '600',
                            }}
                            onPress={() =>
                              navigation.navigate('SummarySlide', {
                                sessionData: completeData,
                              })
                            }
                          >
                            Summary slides
                          </Text>
                        </View>
                      </View>
                    )}
                    {joinedMsg && completeData.sData.stype === 2 && (
                      <Text style={{ fontSize: 16 }}>
                        You have joined this session
                      </Text>
                    )}
                  </View>

                  <View>
                    {completeData?.sData?.sdesc !== 'null' &&
                      completeData?.sData?.sdesc !== '' &&
                      completeData?.sData?.sdesc !== null && (
                        <>
                          <Text
                            style={{
                              fontWeight: '600',
                              fontSize: 16,
                              marginTop: 10,
                            }}
                          >
                            Overview
                          </Text>
                          <Text style={{ marginTop: 5 }}>
                            {completeData?.sData?.sdesc}
                          </Text>
                        </>
                      )}

                    {completeData?.sData?.lobj !== 'null' &&
                      completeData?.sData?.lobj !== '' &&
                      completeData?.sData?.lobj !== null && (
                        <>
                          <Text
                            style={{
                              fontWeight: '600',
                              fontSize: 16,
                              marginTop: 10,
                            }}
                          >
                            Learning objectives :{' '}
                          </Text>
                          {/* <p>Upon completion of this course, you will be able to:</p> */}
                          <Text style={{ marginTop: 5 }}>
                            {completeData?.sData?.lobj?.split('\n').map(
                              (obj, idx) =>
                                obj.replace(/\s/g, '') !== '' && (
                                  <View style={{ flexDirection: 'row' }}>
                                    <Text>{idx + 1} </Text>
                                    <Text key={idx + 'sdf'}>{obj}</Text>
                                  </View>
                                )
                            )}
                          </Text>
                        </>
                      )}

                    {completeData?.sData?.taudi !== 'null' &&
                      completeData?.sData?.taudi !== '' &&
                      completeData?.sData?.taudi !== null && (
                        <>
                          <Text
                            style={{
                              fontWeight: '600',
                              fontSize: 16,
                              marginTop: 10,
                            }}
                          >
                            Target audience:{' '}
                          </Text>
                          <Text style={{ marginTop: 5 }}>
                            {completeData?.sData?.taudi?.split('\n').map(
                              (obj, id) =>
                                obj.replace(/\s/g, '') !== '' && (
                                  <View style={{ flexDirection: 'row' }}>
                                    <Text>{id + 1} </Text>
                                    <Text key={id + 'sdf'}>{obj}</Text>
                                  </View>
                                )
                            )}
                          </Text>
                        </>
                      )}
                  </View>
                </View>
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={openSpeaker}
                  onRequestClose={() => {
                    setSpeaker(!openSpeaker)
                  }}
                >
                  <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text style={[styles.headerStyle]}>
                          {`${
                            speakerDetails?.name ? speakerDetails?.name : ''
                          }`}
                        </Text>
                        <Text
                          style={{ fontWeight: '600', fontSize: 20 }}
                          onPress={() => {
                            setSpeaker(false)
                          }}
                        >
                          X
                        </Text>
                      </View>
                      <View>
                        {speakerDetails?.timgname === undefined ||
                        speakerDetails?.timgname === null ? (
                          <Image
                            style={styles.topicImgInside}
                            source={profileIcon}
                          ></Image>
                        ) : (
                          <Image
                            source={{
                              uri: `https://${
                                Constants.DOMAIN
                              }/${config.aws_org_id.toLowerCase()}-resources/images/speaker-images/${
                                speakerDetails.timgname
                              }`,
                            }}
                            style={styles.topicImgInside}
                          />
                        )}
                      </View>
                      <View>
                        <Text
                          style={{
                            textAlign: 'left',
                            marginVertical: 10,
                            fontSize: 16,
                          }}
                        >
                          {speakerDetails?.designation}
                        </Text>
                        <Text
                          style={{
                            textAlign: 'left',
                            marginBottom: 10,
                            fontSize: 16,
                          }}
                        >
                          {speakerDetails?.bio}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Modal>

                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={certificateOpen}
                  onRequestClose={() => {
                    setCertificateOpen(!certificateOpen)
                  }}
                >
                  <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                      <View style={{ width: '110%' }}>
                        <Text
                          style={{
                            fontWeight: '600',
                            fontSize: 20,
                            textAlign: 'right',
                          }}
                          onPress={() => {
                            setCertificateOpen(false)
                          }}
                        >
                          X
                        </Text>
                        <View style={styles.topTopicsRowContainer}>
                          <ImageBackground
                            style={{
                              width: 150,
                              height: 100,
                              alignSelf: 'center',
                            }}
                            source={{
                              uri: `https://${
                                Constants.DOMAIN
                              }/${config.aws_org_id.toLowerCase()}-resources/images/org-images/logo-light.png`,
                              cache: 'reload',
                            }}
                          />
                          <View>
                            <Text style={{ textAlign: 'center' }}>
                              Certificate awarded to{' '}
                            </Text>
                            <Text
                              style={{
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: 16,
                                paddingVertical: 10,
                              }}
                            >
                              {userDetails?.uData?.first_name}{' '}
                              {userDetails?.uData?.last_name}
                            </Text>
                            <Text
                              style={{ textAlign: 'center', paddingTop: 10 }}
                            >
                              for successfully completing
                            </Text>
                            <View>
                              <Text
                                style={{
                                  textAlign: 'center',
                                  fontWeight: 'bold',
                                  fontSize: 16,
                                  paddingVertical: 5,
                                }}
                              >
                                {sessionName}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </Modal>

                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={completePopUp}
                  onRequestClose={() => {
                    setCompletePopUp(!completePopUp)
                  }}
                >
                  <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text style={[styles.headerStyle]}>
                          Are you sure you want to end the session
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginTop: 20,
                        }}
                      >
                        <View
                          style={{
                            height: 30,
                            width: 80,
                            backgroundColor: Constants.app_button_color,
                            marginRight: 20,
                          }}
                        >
                          <Text
                            style={{
                              textAlign: 'center',
                              marginTop: 6,
                              fontWeight: '600',
                            }}
                            onPress={() => {
                              handleJoinSession('END')
                            }}
                          >
                            Yes
                          </Text>
                        </View>
                        <View
                          style={{
                            height: 30,
                            width: 80,
                            backgroundColor: Constants.app_button_color,
                            marginLeft: 20,
                          }}
                        >
                          <Text
                            style={{
                              textAlign: 'center',
                              marginTop: 6,
                              fontWeight: '600',
                            }}
                            onPress={() => {
                              setCompletePopUp(false)
                            }}
                          >
                            No
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>
            )}
        </View>
        <View>
          {completeData !== undefined &&
            completeData?.sData !== undefined &&
            Object.keys(completeData?.sData).length === 0 && (
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
                    Content you are looking for could not be found
                  </Text>
                </View>
              </View>
            )}
        </View>
      </View>
    )
  }

  return (
    <View
      style={styles.container}
      pointerEvents={!connectionStatus ? 'none' : 'auto'}
    >
      <LinearGradient
        start={{ x: 0.0, y: 0.0 }}
        end={{ x: 0.0, y: 1.0 }}
        colors={[
          Constants.app_background_dark_color,
          Constants.app_background_light_color,
        ]}
        style={styles.screenstyle}
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
                  {sessionName}
                </Text>
              </View>
            </View>
          }
        />
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
          {!spinner ? sessionCheck() : <SkeletonLoader loader="notification" />}
        </ScrollView>
        <View style={styles.noInternet}>
          {!connectionStatus && (
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
  },
  screenstyle: {
    width: '100%',
    height: '100%',
  },
  appFontFamily: {
    fontFamily: Constants.app_font_family_regular,
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
  notifyImage: {
    height: 30,
    width: 30,
  },
  notifyHolder: {
    ...Platform.select({
      ios: {
        marginTop: -40,
      },
      android: {
        marginTop: -28,
      },
    }),
  },
  filImage: {
    height: 30,
    width: 30,
    marginTop: 12,
  },
  appLogo: {
    height: 30,
    width: 80,
    ...Platform.select({
      ios: {
        marginTop: -17,
      },
      android: {
        marginTop: 10,
      },
    }),
  },
  searchViewHolder: {
    width: Constants.app_width - 40,
    height: 40,
    ...Platform.select({
      ios: {
        marginLeft: 20,
        marginRight: 20,
        marginTop: -35,
        // height: 35,
      },
      android: {
        marginLeft: 5,
        marginRight: 5,
        // height: 30,
        marginTop: 20,
      },
    }),
    borderRadius: 50,
    flexDirection: 'row',
    backgroundColor: '#ececec',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  topictitle: {
    marginLeft: 20,
    //textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    fontWeight: '700',
    ...Platform.select({
      ios: {
        fontSize: 16,
        alignSelf: 'flex-start',
        marginTop: -10,
      },
      android: {
        marginTop: 0,
        fontSize: 16,
        justifyContent: 'center',
        alignSelf: 'flex-start',
        marginTop: 10,
      },
    }),
    color: Constants.app_text_color,
  },
  sectionHeader: {
    width: Constants.app_width,
    height: 30,
    marginLeft: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    // alignItems: 'center',
  },
  searchIcon: {
    height: 27,
    width: 27,
    opacity: 5,
    marginLeft: 2,
    marginTop: 2,
  },
  emptyData: {
    flex: 1,
    //height: Platform.OS === 'ios' ? 87.5 : 80,
    height: topicsHeight + 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '30%',
    // marginLeft: '30%'
  },
  headerText1: {
    ...Platform.select({
      ios: {
        fontSize: 16,
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
  input: {
    borderWidth: 0.5,
    borderColor: 'black',
    borderRadius: 5,
    height: 35,
    marginVertical: 10,
    width: '100%',
  },
  emptyTitleHolder: {
    height: 60,
    marginHorizontal: 60,
  },
  emptyText: {
    color: '#484848',
    fontWeight: '600',
    textAlign: 'center',
    ...Platform.select({
      ios: {
        fontSize: 15,
      },
      android: {
        fontSize: 14,
      },
    }),
  },
  serachClose: {
    height: 15,
    width: 15,
    opacity: 5,
    marginRight: 10,
    tintColor: Constants.app_searchbar_tintcolor,
  },
  categoriesListview: {
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
  categoriesRowContainer: {
    // margin: 5,
    marginTop: 10,
    // marginBottom: 5,
    bottom: 5,
    marginRight: 5,
    marginLeft: 10,
    width: exploreWidth - 7,
    height: exploreHeight,
    borderRadius: 10,
    backgroundColor: 'white',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesTitle: {
    marginLeft: 10,
    marginRight: 10,
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: Constants.app_font_family_regular,
    backgroundColor: 'transparent',
  },
  blackTransparentBackground: {
    backgroundColor: 'black',
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  titleHolder: {
    position: 'absolute',
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight,
      },
    }),
  },
  noInternet: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    opacity: 0.8,
    zIndex: 1000,
  },
  topTopicsRowContainer: {
    // borderRadius: 10,
  },
  programtopicImg: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: topicsHeight + 35,
    height: topicsWidth,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
    }),
    opacity: 0.7,
  },
  topicTitle: {
    marginHorizontal: 8,
    marginTop: 5,
    // textAlign: 'center',
    ...Platform.select({
      ios: {
        fontSize: 12,
      },
      android: {
        fontSize: 13,
      },
    }),
    color: Constants.app_text_color,
    fontWeight: 'bold',
  },
  topicTitleObject: {
    textAlign: 'center',
    marginTop: 15,
    // textAlign: 'center',
    ...Platform.select({
      ios: {
        fontSize: 14,
      },
      android: {
        fontSize: 15,
      },
    }),
    color: Constants.app_text_color,
    fontWeight: 'bold',
  },
  programDetailsView: {
    // flex: 1,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        padding: 10,
        marginTop: 15,
      },
      android: {
        marginLeft: 10,
        marginRight: 20,
        marginTop: 5,
      },
    }),
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
    marginLeft: 5,
    width: Constants.app_width - 100,
    fontWeight: '500',
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
  TopicsRowContainerObject: {
    height: topicsWidth - 15,
    width: topicsHeight + 30,
    marginLeft: 15,
    borderRadius: 10,
    marginBottom: 10,
    // borderWidth: 0.1,
    // backgroundColor: '#FFFDAF',
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
  },
  TopicsRowContainer: {
    width: topicsWidth,
    height: topicsHeight + 60,
    marginLeft: 15,
    borderRadius: 10,
    marginBottom: 10,
    // borderWidth: 0.1,
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
  },
  topicImg: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: '100%',
    height: topicsImgHeight + 100,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
    }),
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    marginLeft: '5%',
    // marginTop: '20%',
  },
  modalView: {
    margin: 10,
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
    width: '100%',
  },
  topicImgInside: {
    width: 120,
    height: 120,
    borderRadius: 100,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
    }),
  },
  requiredIcon: {
    height: 22,
    width: 22,
    marginTop: -2,
  },
})
