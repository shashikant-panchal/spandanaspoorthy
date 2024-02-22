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
  Alert,
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
import RadioButtonRN from 'radio-buttons-react-native'
import RadioForm from 'react-native-simple-radio-button'
const backIcon = require('../Assets/Images/back.png')

export default function FeedbackScreen(props) {
  const { navigation, onDismissLoadingCallback, route } = props
  const dispatch = useDispatch()
  let userDetails = useSelector(authData)
  const { sessionId, fetchSession } = route.params
  const [spinner, setSpinner] = useState(true)
  const [answers, setAnswers] = useState([])
  const [feedbackData, setFeedbackData] = useState([])

  const networkStatusRef = useRef(true)

  useEffect(() => {
    // alert(JSON.stringify(learningsession));
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    getFeedbackdata()
    const listners = [navigation.addListener('willFocus', () => checkFocus())]
    StatusBar.setHidden(false)
    FeedbackScreen.navListener = navigation.addListener('didFocus', () => {
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

  const getFeedbackdata = async (userDetails) => {
    setSpinner(true)
    try {
      let response = await API.get(
        config.aws_cloud_logic_custom_name,
        '/feedback'
      )
      // setResponse(response)
      // console.log(JSON.stringify(response))
      for (let i = 0; i < response.length; i++) {
        const questionJSON = response[i].questions
        // console.log(JSON.stringify(questionJSON))
        for (let j = 0; j < questionJSON.length; j++) {
          const optionJSON = questionJSON[j].options
          // console.log(JSON.stringify(optionJSON))
          for (let k = 0; k < optionJSON.length; k++) {
            let finalObj = [...response]
            optionJSON[k].label = optionJSON[k].description
            optionJSON[k].value = optionJSON[k].ans_id
            delete optionJSON[k].ans_id
            delete optionJSON[k].description
            // console.log(optionJSON)
            setFeedbackData(finalObj)
          }
        }
      }
      setSpinner(false)
      console.log(JSON.stringify(feedbackData))
      return response
    } catch (err) {
      setSpinner(false)
      throw err
    }
  }

  const handleAnswerChange = (sect_id, quest_id, ans_id, points) => {
    // console.log(JSON.stringify(sect_id))
    // console.log("quest_id " +JSON.stringify(quest_id))
    // console.log("ans_id " +JSON.stringify(ans_id))
    // alert(points)
    const answer = { sect_id, quest_id, ans_id, points }
    const existingAnswerIndex = answers.findIndex(
      (a) => a.sect_id === sect_id && a.quest_id === quest_id
    )
    if (existingAnswerIndex >= 0) {
      const newAnswers = [...answers]
      newAnswers[existingAnswerIndex] = answer
      setAnswers(newAnswers)
    } else {
      setAnswers([...answers, answer])
    }
  }

  const FinalSave = async () => {
    // console.log(JSON.stringify(answers))
    if (answers.length !== 10) {
      Alert.alert('', 'Give feedback to all the questions')
    } else {
      try {
        const response = await API.post(
          config.aws_cloud_logic_custom_name,
          '/feedback',
          {
            body: {
              ur_id: userDetails?.uData?.ur_id,
              answers: answers,
              sid: sessionId,
              schema: config.aws_schema,
            },
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
        )
        Alert.alert('', 'You have successfully submitted your feedback', [
          {
            text: 'Yes!',
            onPress: () => {
              fetchSession()
              onBackPressed()
            },
          },
        ])
        console.log(JSON.stringify(response))
      } catch (err) {
        console.error(err)
      }
    }
  }

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack())
  }

  function consolefunction(vale) {
    console.log(JSON.stringify(vale))
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
                Feedback
              </Text>
            </View>
          </View>
        }
      />
      {!spinner ? (
        <ScrollView style={{ marginBottom: 100, marginHorizontal: 20 }}>
          {feedbackData.map((section) => (
            <View>
              <Text
                style={{ marginVertical: 20, fontWeight: '600', fontSize: 16 }}
              >
                {section.sect_name}
              </Text>
              <View>
                {section.questions.map((question) => (
                  <View style={{ marginBottom: 15 }}>
                    <Text style={{ marginVertical: 5, fontSize: 14 }}>
                      {question.quest_id} {question.question}
                    </Text>
                    <View>
                      {/* {consolefunction(question.options)} */}
                      {/* {question.options.map((option) => ( */}
                      <View>
                        <View style={{ flexDirection: 'row' }}>
                          <RadioForm
                            radio_props={question.options}
                            initial={null}
                            buttonColor={'#392D7D'}
                            selectedButtonColor={'#F48221'}
                            buttonSize={10}
                            onPress={(value) => {
                              console.log(value)
                              let point = 0
                              if (value % 2 === 0) {
                                if (value % 4 === 0) {
                                  point = 1
                                } else {
                                  point = 3
                                }
                              } else if (
                                (value === 1) ||
                                (value === 5) ||
                                (value === 9) ||
                                (value === 13) ||
                                (value === 17) ||
                                (value === 21) ||
                                (value === 25) ||
                                (value === 29) ||
                                (value === 33) ||
                                (value === 37) ||
                                (value === 41) ||
                                (value === 45)
                              ) {
                                point = 4
                              } else {
                                point = 2
                              }
                              handleAnswerChange(
                                section.sect_id,
                                question.quest_id,
                                value,
                                point
                              )
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.ButtonStyle}
            onPress={() => FinalSave()}
          >
            <Text style={styles.ButtonTextStyle}>Submit</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <SkeletonLoader loader="notification" />
      )}
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
  TextStyle: {
    marginTop: 80,
  },
  InstructText: {
    marginVertical: 10,
    marginHorizontal: 10,
    fontWeight: 'bold',
    fontSize: 13,
  },
  starStyle: {
    marginTop: 20,
  },
  Starcontainer: {},
  questionText: {
    marginTop: 15,
    fontSize: 15,
    marginHorizontal: 10,
  },
  ButtonStyle: {
    backgroundColor: Constants.app_button_color,
    justifyContent: 'center',
    alignSelf: 'center',
    alignContent: 'center',
    width: 150,
    height: 35,
    marginTop: 30,
    borderRadius: 5,
  },
  ButtonTextStyle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: '11%',
    height: 35,
  },
})
