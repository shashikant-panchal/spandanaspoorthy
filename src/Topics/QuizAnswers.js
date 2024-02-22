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
} from 'react-native'
import { Rating } from 'react-native-ratings'
import { color } from 'react-native-reanimated'
import { shadow } from 'react-native-paper'
import { TouchableOpacity } from 'react-native-gesture-handler'
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
import FastImage from 'react-native-fast-image'
const correctIcon = require('../Assets/Images/correct.png')
const wrongIcon = require('../Assets/Images/wrong.png')
const backIcon = require('../Assets/Images/back.png')

export default function QuizAnswersScreen(props) {
  const { navigation, onDismissLoadingCallback, route } = props
  const dispatch = useDispatch()
  let userDetails = useSelector(authData)

  const networkStatusRef = useRef(true)
  const { curObject, courseDetails } = route.params
  const [isBookmarkedLoaded, setIsBookmarkedLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sharedObject, setSharedObject] = useState({})
  const sharedObjectRef = useRef({})
  const [report, setReport] = useState({ rating: null })
  const [objLoad, setObjLoad] = useState(true)
  const [rateValue, setRateValue] = useState(1)
  const [more, setMore] = useState('')
  const [open, setOpen] = useState(false)
  const [btnLoad, setBtnLoad] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [isRating, setIsRating] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const imgUrl = `${
    Constants.AWS_IMAGE
  }${config.aws_org_id.toLowerCase()}-resources/images/quiz-images/${
    courseDetails?.tid
  }/`

  useEffect(() => {
    console.log(JSON.stringify(curObject))
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    const listners = [navigation.addListener('willFocus', () => checkFocus())]
    // getlearningContent()
    StatusBar.setHidden(false)
    QuizAnswersScreen.navListener = navigation.addListener('didFocus', () => {
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

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack())
  }

  function answerPrev() {
    console.log('curr', currentQuestion)
    const prevQuestion = currentQuestion - 1

    setCurrentQuestion(prevQuestion)
  }

  function answerNext() {
    const nextQuestion = currentQuestion + 1
    if (nextQuestion < curObject.quiz_json.json.question.length) {
      setCurrentQuestion(nextQuestion)
    }
    console.log('curr', currentQuestion)
  }

  const renderBorderColor = (item) => {
    // alert(JSON.stringify(item));
    let color
    if (item.correct) {
      color = 'green'
    } else if (item.youAnswered && item.correct) {
      color = 'green'
    } else if (item.youAnswered && !item.correct) {
      color = 'red'
    } else {
      color = 'grey'
    }
    return color
  }

  function renderCorrectAnswer(object) {
    // alert(JSON.stringify(object))
    for (let i = 0; i < object.length; i++) {
      if (object[i]?.youAnswered === true) {
        return `${object[i]?.content}`
      }
    }
  }

  function renderAssessmentsAnswers() {
    return (
      <View>
        {curObject.quiz_json !== undefined && (
          <View style={{ margin: 10 }}>
            <View style={{ flexDirection: 'row', margin: 10 }}>
              <Text style={{ fontSize: 20 }}>
                Question {currentQuestion + 1}
              </Text>

              <Text style={{ fontSize: 18 }}> / </Text>
              <Text style={{ fontSize: 20 }}>
                {curObject.quiz_json.json.question?.length}
              </Text>
            </View>
            <View>
              <Text style={{ margin: 10, fontSize: 20 }}>
                {curObject.quiz_json.json.question[currentQuestion].istem}
              </Text>
                <View>
                  {curObject.quiz_json.json.question[currentQuestion]
                    .imageurl ? (
                    <FastImage
                      key={currentQuestion}
                      resizeMode={FastImage.resizeMode.contain}
                      style={styles.quizImg}
                      source={{
                        uri: `${imgUrl}${curObject.quiz_json.json.question[currentQuestion].imageurl}`,
                      }}
                    />
                  ) : null}
                </View>
            </View>
            <View>
              {curObject.quiz_json.json.question[currentQuestion].iopts.map(
                (answerOption, index, arrayobj) => (
                  <View
                    style={[
                      styles.questionHolder,
                      { borderColor: renderBorderColor(answerOption) },
                    ]}
                  >
                    <Text style={{ margin: 10, width: '80%' }}>
                      {answerOption.content}
                    </Text>
                  </View>
                )
              )}
              <View
                style={{
                  flexDirection: 'row',
                  marginVertical: 10,
                  marginLeft: 15,
                }}
              >
                <Text style={{ marginRight: 5 }}>Your answer:</Text>
                <Text style = {{ fontWeight: '700',width: '70%', fontSize: 15, color:  renderCorrectAnswer(curObject.quiz_json.json.question[currentQuestion]?.iopts)
                    ? Constants.app_text_color
                    : 'red'}}>
                  {renderCorrectAnswer(
                  curObject.quiz_json.json.question[currentQuestion]?.iopts
                ) ? renderCorrectAnswer(
                  curObject.quiz_json.json.question[currentQuestion]?.iopts
                ) : 'You have not answered'}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '70%',
                  marginLeft: '15%',
                  marginTop: 40,
                }}
              >
                {currentQuestion > 0 ? (
                  <TouchableHighlight
                    underlayColor="transparent"
                    onPress={() => answerPrev()}
                  >
                    <Text
                      style={{
                        color: Constants.app_button_color,
                        fontSize: 18,
                        fontWeight: '700',
                      }}
                    >
                      Prev
                    </Text>
                  </TouchableHighlight>
                ) : (
                  <View></View>
                )}
                {currentQuestion + 1 ===
                curObject.quiz_json.json.question.length ? (
                  <View></View>
                ) : (
                  <TouchableHighlight
                    underlayColor="transparent"
                    onPress={() => answerNext()}
                  >
                    <Text
                      style={{
                        color: Constants.app_button_color,
                        fontSize: 18,
                        fontWeight: '700',
                      }}
                    >
                      Next
                    </Text>
                  </TouchableHighlight>
                )}
              </View>
              {/* <View
                style={{
                  marginVertical: 20,
                  marginHorizontal: 10,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {[
                  ...Array(curObject.quiz_json.json.question?.length).keys(),
                ].map((it) => (
                  <View
                    style={{
                      marginVertical: 8,
                      marginHorizontal: 15,
                      justifyContent: 'center',
                      alignSelf: 'center',
                      width: 35,
                      height: 30,
                      // backgroundColor: 'grey',
                      backgroundColor: curObject.quiz_json.json.question[it]
                        .youAnswered
                        ? '#006400'
                        : '#aaaaaa',
                    }}
                  >
                    <TouchableHighlight
                      underlayColor="transparent"
                      onPress={() => {
                        setCurrentQuestion(it)
                      }}
                    >
                      <Text
                        style={{
                          textAlign: 'center',
                          fontWeight: '500',
                          color: 'white',
                        }}
                      >
                        {it + 1}
                      </Text>
                    </TouchableHighlight>
                  </View>
                ))}
              </View> */}
            </View>
          </View>
        )}
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
                Answers
              </Text>
            </View>
          </View>
        }
      />
      <ScrollView
        style={styles.scrollview}
        showsVerticalScrollIndicator={false}
      >
        {renderAssessmentsAnswers()}
      </ScrollView>
    </View>
  )
}
const styles = StyleSheet.create({
  scrollview: {
    marginBottom: 20,
  },
  scrollviewContainer: {
    marginTop: 20,
    marginBottom: 200,
  },
  starStyle: {
    marginRight: 280,
    marginTop: 10,
  },
  startContainer: {
    backgroundColor: '#217BB5',
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 80,
    marginTop: 10,
    borderWidth: 4,
    borderColor: 'white',
  },
  ButtonTextStyle: {
    alignSelf: 'center',
    fontSize: 15,
    width: '50%',
    // marginTop: -26,
  },
  startStyle: {
    marginTop: 25,
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'center',
  },
  lineStyle: {
    backgroundColor: '#217BB5',
    height: 70,
    width: 8,
    borderWidth: 2,
    borderColor: 'white',
    alignSelf: 'center',
  },
  Backgroundstyle: {
    width: 100,
    height: 100,
  },
  ButtonStyle: {
    marginTop: -10,
    backgroundColor: 'white',
    width: 300,
    height: 50,
    alignSelf: '',
  },
  ButtonContainer: {
    alignSelf: 'center',
  },
  flagIconStyle: {
    alignSelf: 'center',
    height: 60,
    width: 50,
    marginLeft: 15,
    marginTop: -50,
  },
  dotStyle: {
    height: 10,
    width: 15,
    marginLeft: 190,
    marginTop: 0,
    borderRadius: 20,
    borderRadius: 7,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: 'white',
  },
  BookmarkStyle: {
    alignSelf: 'flex-end',
    marginTop: -30,
    marginBottom: 40,
  },
  linestyle: {
    borderColor: '#217BB5',
    borderWidth: 1,
    marginTop: 20,
  },
  CompleteStyle: {
    height: 30,
    width: 30,
    marginRight: 10,
    marginTop: -20,
    alignSelf: 'flex-end',
  },
  ImageBackgroundStyle: {
    width: '100%',
    height: Constants.app_height / 1.5,
  },
  yellow2Style: {
    marginTop: 6,
    marginLeft: 6,
  },
  yellowContainer2Style: {
    marginTop: 8,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: '#eaca1f',
    backgroundColor: '#eaca1f',
    borderRadius: 20,
    color: '#eaca1f',

    width: 33,
    height: 33,
  },
  yellow1Style: {
    marginTop: 6,
    marginLeft: 3,
  },
  yellowContainer1Style: {
    borderWidth: 2,
    borderColor: '#eaca1f',
    backgroundColor: '#eaca1f',
    borderRadius: 20,
    color: '#eaca1f',
    width: 33,
    height: 33,
    marginLeft: 300,
    marginTop: -30,
    marginBottom: 10,
  },
  yellow3Style: {
    marginTop: 6,
    marginLeft: 3,
  },
  yellowContainer3Style: {
    marginTop: 8,
    marginLeft: -13,
    borderWidth: 2,
    borderColor: '#eaca1f',
    backgroundColor: '#eaca1f',
    borderRadius: 20,
    color: '#eaca1f',

    width: 33,
    height: 33,
  },
  yellowTextStyle: {
    marginLeft: 340,
    marginTop: -20,
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
  tickIcon: {
    width: 30,
    height: 30,
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
  startButtonHolder: {
    height: 35,
    backgroundColor: Constants.app_color,
    borderRadius: 5,
    alignSelf: 'center',
    borderColor: Constants.app_button_color,
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
  quizImg: {
    width: '90%',
    height: 190,
    // top: 0,
    // left: 0,
    margin: 5,
    justifyContent: 'center',
    //alignItems: 'center',
    //alignContent: 'center',
    alignSelf: 'center',
  },
  questionHolder: {
    //flex: 1,
    marginRight: 15,
    marginLeft: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F7F7F7',
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    // padding: 5,
    flexDirection: 'row',
    borderWidth: 2,
    // borderColor: Constants.app_button_color,
  },
  correctwrong: {
    height: 20,
    width: 20,
    marginRight: 5,
    ...Platform.select({
      ios: {
        marginTop: -2,
      },
      android: {
        marginTop: 12,
      },
    }),
    marginLeft: -10,
  },
  container: {
    flex: 1,
    backgroundColor: Constants.app_background_color,
  },
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight - 5,
      },
    }),
  },
})
