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
  AppState,
} from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import Amplify, { Cache, API, Auth } from 'aws-amplify'
import 'react-native-gesture-handler'
import { CommonActions, useNavigation } from '@react-navigation/native'
import LinearGradient from 'react-native-linear-gradient'
import FastImage from 'react-native-fast-image'
import config from '../../aws-exports'
import { awsSignIn, authData } from '../redux/auth/authSlice'
import { useSelector, useDispatch } from 'react-redux'
import SkeletonLoader from '../common/appSkeletonLoader'
import HTML from 'react-native-render-html'
import produce from '../../node_modules/immer'
import RadioButtonRN from 'radio-buttons-react-native'
import Toolbar from '../Profile/Toolbar'
import { Rating } from 'react-native-ratings'
import { element } from 'prop-types'
import ProgressCircle from 'react-native-progress-circle'

const correctIcon = require('../Assets/Images/correct.png')
const wrongIcon = require('../Assets/Images/wrong.png')
const audioImage = require('../Assets/Images/audioimage.png')
const backIcon = require('../Assets/Images/back.png')

export default function QuizDetailsScreen(props) {
  const { route, onDismissLoadingCallback } = props
  const navigation = useNavigation()
  const {
    qObject,
    nuggetId,
    setCourseDetails,
    courseDetails,
    OIndex,
    courseId,
    quizAttempt,
    // getQuizFunction,
    fullCourseDetails,
    getCourse,
    setStartQuiz,
    attempt,
    objectData,
    setObjectData,
    updateCourseAnalytics,
  } = route.params
  const networkStatusRef = useRef(true)
  const [spinner, setSpinner] = useState(true)
  const [loaded, setLoaded] = useState(true)
  const [modalSpinner, setModalSpinner] = useState(false)
  const [quizQuestion, setQuizQuestion] = useState([])
  const [btnClick, setBtnClick] = useState(false)
  const [qtype, setQtype] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const currentQuestionRef = useRef(0)
  const [qisLoading, setQIsLoading] = useState(false)
  const [activeView, setActiveView] = useState(-1)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const activeViewArray = useRef([])
  const [surveyAns, setSurveyAns] = useState(0)
  const startTime = useRef('')
  const gotScore = useRef(qObject?.score ?? [])
  const [retakePopUp, setRetakePopUp] = useState(false)
  const [finalRetakePopUp, setFinalRetakePopUp] = useState(false)
  let userDetails = useSelector(authData)
  const dispatch = useDispatch()

  const imgUrl = `${
    Constants.AWS_IMAGE
  }${config.aws_org_id.toLowerCase()}-resources/images/quiz-images/${
    courseDetails?.tid
  }/`

  useEffect(() => {
    // alert(JSON.stringify(courseDetails))
    // alert(OIndex);
    startTime.current = Math.round(new Date().getTime())
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    const listners = [navigation.addListener('willFocus', () => checkFocus())]
    getQuiz(qObject)
    let sdata = { ...userDetails }
    dispatch(awsSignIn(sdata))
    StatusBar.setHidden(false)

    QuizDetailsScreen.navListener = navigation.addListener('didFocus', () => {
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

  async function checkFocus() {
    BackHandler.removeEventListener('hardwareBackPress', true)
    await SInfo.setItem('isnotClickable', JSON.stringify(false), {})
    window.isnotClickable = 'false'
    if (networkStatusRef.current) {
      // fetchRecentViews();
      // fetchLocalTopicProgressDetails();
      // fetchLocalCertDetails();
    } else {
      handleNetworkConnection()
    }
    StatusBar.setBarStyle('dark-content')
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(Constants.app_statusbar_color)
      StatusBar.setTranslucent(true)
    }
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
    }
  }

  function onBackPressed() {
    // getQuizFunction(qObject)
    getCourse()
    navigation.dispatch(CommonActions.goBack())
  }

  async function getQuiz(obj) {
    setQIsLoading(true)
    const bodyParam = {
      body: {
        obj_id: obj.oid,
        oid: config.aws_org_id,
        schema: config.aws_schema,
        ur_id: userDetails.uData?.ur_id,
        key: courseDetails.tid,
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
        '/getQuiz',
        bodyParam
      )
      console.log(JSON.stringify(response.qitems))
      setQtype(response.qtype)
      setQuizQuestion(response.qitems)
      setBtnClick(true)
      setQIsLoading(false)
      setSpinner(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleAnswerOptionClick = (ansOpts, idx) => {
    // setInputText('answer');
    const ques = [...quizQuestion]
    if (ansOpts.correct === 'true' || ansOpts.correct === true) {
      ques[currentQuestion].res = 1
    } else {
      ques[currentQuestion].res = 0
    }
    ques[currentQuestion].iopts.map((item) => {
      item.youAnswered = false
      return item
    })

    ques[currentQuestion].iopts[idx].youAnswered = true

    if (ques[currentQuestion].iopts[idx].youAnswered === true) {
      delete ques[currentQuestion].skip
    }
    ques[currentQuestion].youAnswered = true
    if (ques[currentQuestion].iopts[idx].correct) {
      ques[currentQuestion].answeredOption = true
    } else {
      ques[currentQuestion].answeredOption = false
    }
    setQuizQuestion(ques)
    if (activeView != idx) {
      setActiveView(idx)
      let arr = activeViewArray.current.slice()
      arr[currentQuestion] = idx
      activeViewArray.current = [...arr]
    }
  }

  function answerQuizPrev() {
    const prevQuestion = currentQuestion - 1

    setCurrentQuestion(prevQuestion)
    currentQuestionRef.current = prevQuestion
    setActiveView(activeViewArray.current[currentQuestion - 1])
  }

  const scoreAchieved = (scoreD) => {
    if ((scoreD / quizQuestion.length) * 100 >= parseInt(qObject.cutoff)) {
      return true
    } else {
      return false
    }
  }

  function AnsAch() {
    if (objectData[OIndex].score && objectData[OIndex].score.length > 0) {
      for (let i = 0; i <= objectData[OIndex].score.length; i++) {
        if (scoreAchieved(parseInt(objectData[OIndex].score[i]))) return true
        else return false
      }
    }
  }

  function retakeView() {
    setRetakePopUp(false)
    const questions = [...quizQuestion]
    const resetArray = []
    questions.forEach((element) => {
      const obj = { ...element }
      delete obj.answeredOption
      delete obj.youAnswered
      obj.iopts.forEach((item) => {
        // const obj2 = { ...item };
        delete item.youAnswered
      })
      resetArray.push(obj)
    })
    setActiveView(-1)
    activeViewArray.current = []
    setQuizQuestion(resetArray)
    setCurrentQuestion(0)
    scoreRef.current = 0
  }

  async function syncUserQuizData(score, op, questionsJSON) {
    let obj = {}
    obj.json = questionsJSON
    if (qtype === 2 || qtype === '2') {
      const bodyParam = {
        body: {
          emailid: userDetails?.email,
          pid: courseDetails.cid,
          key: courseDetails.tid,
          email: userDetails.username,
          oid: config.aws_org_id,
          uname: userDetails.name,
          tenant: userDetails.locale,
          score: score,
          quizJSON: obj,
          obj_id: qObject.oid,
          obtime: (new Date().getTime() - startTime.current) / 1000,
          ur_id: userDetails?.uData?.ur_id,
          schema: config.aws_schema,
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
      let objProgress = 1
      if (qObject?.score?.length === attempt) {
        objProgress = 2
      }
      bodyParam.body.op = objProgress
      let body = JSON.stringify(bodyParam)
      body = JSON.parse(body)
      console.log('syncUserQuizData====' + JSON.stringify(body))
      try {
        const response = await API.post(
          config.aws_cloud_logic_custom_name,
          '/syncUserDataWeb',
          body
        )
        console.log('syncUserQuizData==' + JSON.stringify(response))
        setSpinner(false)
        setFinalRetakePopUp(true)
        if (OIndex === objectData.length - 1) {
          onBackPressed()
          updateCourseAnalytics('completed')
        }
        setRetakePopUp(false)
      } catch (error) {
        console.error(error)
      }
    } else if (qtype === 1 || qtype === '1') {
      for (let i = 0; i < quizQuestion.length; i++) {
        if (quizQuestion[i].res === 1) {
          scoreRef.current = scoreRef.current + 1
        } else {
          scoreRef.current = scoreRef.current
        }
      }
      setSpinner(true)
      const bodyParam = {
        body: {
          emailid: userDetails?.email,
          pid: courseDetails.cid,
          key: courseDetails.tid,
          email: userDetails.username,
          oid: config.aws_org_id,
          uname: userDetails.name,
          tenant: userDetails.locale,
          op: 2,
          score,
          obj_id: qObject.oid,
          obtime: (new Date().getTime() - startTime.current) / 1000,
          ur_id: userDetails?.uData?.ur_id,
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
          '/syncUserDataWeb',
          bodyParam
        )
        setSpinner(false)
        setStartQuiz(false)
        onBackPressed()
      } catch (error) {
        console.error(error)
      }
    }
  }

  async function handleScoreSubmit(score, op, questionsJSON) {
    let obj = {}
    obj.json = questionsJSON
    setSpinner(true)
    const bodyParam = {
      body: {
        emailid: userDetails.email,
        pid: courseDetails.cid,
        key: courseDetails.tid,
        email: userDetails.username,
        oid: config.aws_org_id,
        uname: userDetails.name,
        tenant: userDetails.locale,
        score,
        quizJSON: obj,
        obj_id: qObject.oid,
        obtime: (new Date().getTime() - startTime.current) / 1000,
        ur_id: userDetails?.uData?.ur_id,
        schema: config.aws_schema,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    let objProgress = 1
    if (qObject?.score?.length === attempt) {
      objProgress = 2
    }
    bodyParam.body.op = objProgress
    let body = JSON.stringify(bodyParam)
    body = JSON.parse(body)
    console.log('handleScoreSubmit====' + JSON.stringify(body))
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/syncUserDataWeb',
        body
      )
      console.log('handleScoreSubmit==' + JSON.stringify(response))
      if (
        scoreAchieved(scoreRef.current) === false &&
        AnsAch() === false &&
        gotScore.current.length < attempt
      ) {
        setRetakePopUp(true)
        setFinalRetakePopUp(false)
      } else {
        setFinalRetakePopUp(true)
        setRetakePopUp(false)
        if (OIndex === objectData.length - 1) {
          onBackPressed()
          updateCourseAnalytics('completed')
        }
      }
      setSpinner(false)
    } catch (error) {
      console.error(error)
    }
  }

  function answerQuizNext() {
    let count = 0
    const nextQuestion = currentQuestion + 1
    for (i = 0; i < quizQuestion.length; i++) {
      if (quizQuestion[i].youAnswered === true) {
        count = count + 1
      }
    }
    let yourAns = quizQuestion[currentQuestion].youAnswered
    if (yourAns === undefined || yourAns == null) {
      quizQuestion[currentQuestion].skip = true
    }
    if (nextQuestion < quizQuestion.length) {
      setCurrentQuestion(nextQuestion)
      currentQuestionRef.current = nextQuestion
      setActiveView(activeViewArray.current[currentQuestion + 1])
    } else {
      if (count === quizQuestion.length) {
        Alert.alert('', 'Would you like to end the quiz?', [
          {
            text: 'Yes!',
            onPress: () => {
              for (let i = 0; i < quizQuestion.length; i++) {
                if (quizQuestion[i].res === 1) {
                  scoreRef.current = scoreRef.current + 1
                } else {
                  scoreRef.current = scoreRef.current
                }
              }
              let score = 0
              score = quizQuestion.filter((item) => item.answeredOption).length
              if (scoreAchieved(score)) {
                // alert("score")
                if (qObject.op !== 2) {
                  gotScore.current.push(score)
                  let questionsJSON = {}
                  questionsJSON.question = quizQuestion
                  questionsJSON.cutoff = qObject.cutoff
                  let obj = {}
                  obj.json = questionsJSON

                  let objectDataQuiz = { ...objectData }
                  objectDataQuiz[OIndex].score = gotScore.current
                  objectDataQuiz[OIndex].quiz_json = obj
                  setObjectData(objectDataQuiz)
                  // objectDataQuiz[OIndex + 1].op = 1
                  syncUserQuizData(score, undefined, questionsJSON)
                }
              } else {
                gotScore.current.push(score)
                let questionsJSON = {}
                questionsJSON.question = quizQuestion
                questionsJSON.cutoff = qObject.cutOff
                let obj = {}
                obj.json = questionsJSON

                let objectDataQuiz = { ...objectData }
                objectDataQuiz[OIndex].score = gotScore.current
                objectDataQuiz[OIndex].quiz_json = obj
                setObjectData(objectDataQuiz)
                if (qObject.op !== 2) {
                  if (qObject?.score?.length === attempt) {
                    syncUserQuizData(score, undefined, questionsJSON)
                  } else {
                    handleScoreSubmit(score, 1, questionsJSON)
                  }
                }
              }
            },
          },
          { text: 'No!', onPress: () => console.log('No Pressed') },
        ])
      } else {
        Alert.alert(' ', 'Answer all the questions')
      }
    }
  }

  function renderQuizQuestions() {
    if (qtype === 2 || qtype === '2') {
      return (
        <View>
          <View
            style={{
              marginLeft: 12,
              ...Platform.select({
                ios: {
                  marginTop: 60,
                },
                android: {
                  marginTop: 30,
                },
              }),
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginRight: 40,
              }}
            >
              <Text style={{ fontSize: 16 }}>
                Question {currentQuestion + 1} / {quizQuestion.length}
              </Text>
            </View>
            <View style={{ marginTop: 20, marginRight: 15 }}>
              {/* <Text>{qtype}</Text> */}
              <HTML
                source={{ html: `${quizQuestion[currentQuestion].istem}` }}
              />
            </View>
            {quizQuestion[currentQuestion].imageurl ? (
              <FastImage
                key={currentQuestion}
                resizeMode={FastImage.resizeMode.contain}
                style={styles.quizImg}
                source={{
                  uri: `${imgUrl}${quizQuestion[currentQuestion].imageurl}`,
                }}
              />
            ) : null}
          </View>
          <View>
            {quizQuestion[currentQuestion].iopts.map((answerOption, idx) => {
              const containerStyle = [
                styles.questionHolder,
                { borderColor: Constants.app_button_color },
              ]
              if (answerOption.youAnswered === true) {
                containerStyle.push({
                  borderWidth: 3,
                  borderColor: Constants.app_button_color,
                })
              }
              return (
                <View>
                  <TouchableHighlight
                    underlayColor="transparent"
                    onPress={() => handleAnswerOptionClick(answerOption, idx)}
                    style={containerStyle}
                  >
                    <View>
                      <Text style={{ margin: 10, fontSize: 16 }}>
                        {' '}
                        {answerOption.content}{' '}
                      </Text>
                    </View>
                  </TouchableHighlight>
                </View>
              )
            })}
            <View
              style={{
                flexDirection: 'row',
                width: '70%',
                justifyContent: 'space-between',
                marginHorizontal: '10%',
                marginTop: 20,
              }}
            >
              {currentQuestion > 0 ? (
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => answerQuizPrev()}
                >
                  <View
                    style={{
                      marginTop: 20,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      backgroundColor: Constants.app_blue_color,
                      width: 70,
                      height: 40,
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        color: 'white',
                        fontWeight: '700',
                      }}
                    >
                      Prev
                    </Text>
                  </View>
                </TouchableHighlight>
              ) : (
                <View></View>
              )}
              {currentQuestion < quizQuestion.length - 1 ? (
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => answerQuizNext()}
                >
                  <View
                    style={{
                      marginTop: 20,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      backgroundColor: Constants.app_blue_color,
                      width: 70,
                      height: 40,
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        color: 'white',
                        fontWeight: '700',
                      }}
                    >
                      Next
                    </Text>
                  </View>
                </TouchableHighlight>
              ) : (
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => answerQuizNext()}
                >
                  <View
                    style={{
                      marginTop: 20,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      backgroundColor: Constants.app_blue_color,
                      width: 70,
                      height: 40,
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        color: 'white',
                        fontWeight: '700',
                      }}
                    >
                      Submit
                    </Text>
                  </View>
                </TouchableHighlight>
              )}
            </View>
          </View>
          <View
            style={{
              marginVertical: 20,
              marginHorizontal: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {[...Array(quizQuestion.length).keys()].map((i) => (
              <View
                style={{
                  marginVertical: 8,
                  marginHorizontal: 15,
                  justifyContent: 'center',
                  alignSelf: 'center',
                  width: 35,
                  height: 30,
                  // backgroundColor: 'grey',
                  backgroundColor: quizQuestion[i].youAnswered
                    ? '#006400'
                    : '#aaaaaa',
                }}
              >
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => {
                    setCurrentQuestion(i)
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: '500',
                      color: 'white',
                    }}
                  >
                    {i + 1}
                  </Text>
                </TouchableHighlight>
              </View>
            ))}
          </View>
        </View>
      )
    } else if (qtype === 1 || qtype === '1') {
      return (
        <View>
          <View
            style={{
              marginLeft: 12,
              ...Platform.select({
                ios: {
                  marginTop: 60,
                },
                android: {
                  marginTop: 30,
                },
              }),
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginRight: 40,
              }}
            >
              <Text style={{ fontSize: 16 }}>
                Question {currentQuestion + 1} / {quizQuestion.length}
              </Text>
            </View>
            <View style={{ marginTop: 20, marginRight: 15 }}>
              {/* <Text>{qtype}</Text> */}
              <HTML
                source={{ html: `${quizQuestion[currentQuestion].istem}` }}
              />
            </View>
            {quizQuestion[currentQuestion].imageurl ? (
              <FastImage
                key={currentQuestion}
                resizeMode={FastImage.resizeMode.contain}
                style={styles.quizImg}
                source={{
                  uri: `${imgUrl}${quizQuestion[currentQuestion].imageurl}`,
                }}
              />
            ) : null}
          </View>
          <View>
            {quizQuestion[currentQuestion].iopts.map((answerOption, idx) => {
              const containerStyle = [
                styles.questionHolder,
                { borderColor: Constants.app_button_color },
              ]
              if (answerOption.youAnswered === true) {
                containerStyle.push({
                  borderWidth: 3,
                  borderColor: Constants.app_button_color,
                })
              }
              return (
                <View>
                  <TouchableHighlight
                    underlayColor="transparent"
                    onPress={() => handleAnswerOptionClick(answerOption, idx)}
                    style={containerStyle}
                  >
                    <View>
                      <Text style={{ margin: 10, fontSize: 16 }}>
                        {' '}
                        {answerOption.content}{' '}
                      </Text>
                    </View>
                  </TouchableHighlight>
                </View>
              )
            })}
            <View
              style={{
                flexDirection: 'row',
                width: '70%',
                justifyContent: 'space-between',
                marginHorizontal: '10%',
                marginTop: 20,
              }}
            >
              {currentQuestion > 0 ? (
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => answerQuizPrev()}
                >
                  <View
                    style={{
                      marginTop: 20,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      backgroundColor: Constants.app_blue_color,
                      width: 70,
                      height: 40,
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        color: 'white',
                        fontWeight: '700',
                      }}
                    >
                      Prev
                    </Text>
                  </View>
                </TouchableHighlight>
              ) : (
                <View></View>
              )}
              {currentQuestion < quizQuestion.length - 1 ? (
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => answerQuizNext()}
                >
                  <View
                    style={{
                      marginTop: 20,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      backgroundColor: Constants.app_blue_color,
                      width: 70,
                      height: 40,
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        color: 'white',
                        fontWeight: '700',
                      }}
                    >
                      Next
                    </Text>
                  </View>
                </TouchableHighlight>
              ) : (
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => answerQuizNext()}
                >
                  <View
                    style={{
                      marginTop: 20,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      backgroundColor: Constants.app_blue_color,
                      width: 70,
                      height: 40,
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        color: 'white',
                        fontWeight: '700',
                      }}
                    >
                      Submit
                    </Text>
                  </View>
                </TouchableHighlight>
              )}
            </View>
          </View>
          <View
            style={{
              marginVertical: 20,
              marginHorizontal: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {[...Array(quizQuestion.length).keys()].map((i) => (
              <View
                style={{
                  marginVertical: 8,
                  marginHorizontal: 15,
                  justifyContent: 'center',
                  alignSelf: 'center',
                  width: 35,
                  height: 30,
                  // backgroundColor: 'grey',
                  backgroundColor: quizQuestion[i].youAnswered
                    ? '#006400'
                    : '#aaaaaa',
                }}
              >
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => {
                    setCurrentQuestion(i)
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: '500',
                      color: 'white',
                    }}
                  >
                    {i + 1}
                  </Text>
                </TouchableHighlight>
              </View>
            ))}
          </View>
        </View>
      )
    }
  }

  function closeQuiz() {
    setFinalRetakePopUp(false)
    onBackPressed()
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
                  {qObject.otitle}
                </Text>
              </View>
            </View>
          }
        />
        <View style={styles.spinnerView}>
          {!networkStatusRef.current && (
            <Text style={[styles.noNetwork, styles.appFontFamily]}>
              No internet connectivity
            </Text>
          )}
        </View>

        <ScrollView
          style={styles.scrollview}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.spinnerView}>
            {!networkStatusRef.current && (
              <Text style={[styles.noNetwork, styles.appFontFamily]}>
                No internet connectivity
              </Text>
            )}
          </View>
          {!spinner ? renderQuizQuestions() : <SkeletonLoader loader="home1" />}
        </ScrollView>
      </LinearGradient>
      <Modal
        animationType="slide"
        transparent={true}
        visible={retakePopUp}
        onRequestClose={() => {
          setRetakePopUp(!retakePopUp)
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ProgressCircle
              percent={(scoreRef.current / quizQuestion.length) * 100}
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
                (scoreRef.current / quizQuestion.length) * 100
              )}%`}</Text>
            </ProgressCircle>
            <View
              style={{
                backgroundColor: Constants.app_button_color,
                width: 180,
                height: 45,
                alignSelf: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                marginTop: 20,
              }}
            >
              <TouchableHighlight
                underlayColor="transparent"
                onPress={() => retakeView()}
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
                  Retake Quiz
                </Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={finalRetakePopUp}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ProgressCircle
              percent={(scoreRef.current / quizQuestion.length) * 100}
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
                (scoreRef.current / quizQuestion.length) * 100
              )}%`}</Text>
            </ProgressCircle>
            <View
              style={{
                backgroundColor: Constants.app_button_color,
                width: 180,
                height: 45,
                alignSelf: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                marginTop: 20,
              }}
            >
              <TouchableHighlight
                underlayColor="transparent"
                onPress={() => closeQuiz()}
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
                  Close
                </Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.app_background_color,
  },
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight,
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
  backButton: {
    width: 25,
    height: 25,
    tintColor: '#000000',
    alignSelf: 'center',
  },
  quizImg: {
    width: '90%',
    height: 330,
    margin: 5,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  cwstyle: {
    height: 20,
    width: 20,
  },
  questionHolder: {
    //flex: 1,
    marginRight: 15,
    marginLeft: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#EDEDED',
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    // padding: 5,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Constants.app_button_color,
  },
  feedbackHolder: {
    //flex: 1,
    marginRight: 15,
    marginLeft: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // backgroundColor: '#EDEDED',
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    // padding: 5,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: Constants.app_button_color,
  },
  scrollview: {
    marginBottom: 150,
  },
  spinnerStyle: {
    top: Constants.app_height / 2 + 50,
    height: 100,
    width: 100,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 10,
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
  button: {
    // borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    borderRadius: 10,
    backgroundColor: Constants.app_button_color,
    width: '40%',
    marginTop: 20,
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
  xcloseicon: {
    justifyContent: 'flex-end',
    // backgroundColor: 'red',
    alignItems: 'flex-end',
    // backgroundColor: 'green'
  },
  input: {
    borderWidth: 0.5,
    borderColor: 'black',
    borderRadius: 5,
    height: 40,
    marginHorizontal: 10,
    // width: '90%'
  },
  validationText: {
    marginTop: 5,
    marginLeft: 12,
    position: 'absolute',
    color: 'red',
    fontSize: 11,
    fontFamily: Constants.app_font_family_regular,
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
  button: {
    marginTop: 20,
    borderRadius: 5,
    padding: 5,
    elevation: 2,
    width: 80,
  },
  buttonOpen: {
    marginTop: -200,
    backgroundColor: '#F194FF',
  },
  buttonApply: {
    backgroundColor: Constants.app_button_color,
  },
  buttonClose: {
    borderColor: Constants.app_button_color,
    borderWidth: 2,
    backgroundColor: '#ffffff',
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
})
