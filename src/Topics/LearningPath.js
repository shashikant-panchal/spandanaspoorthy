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

const flagIcon = require('../Assets/Images/flag.png')
const bookmarkIcon1 = require('../Assets/Images/bookmark1.png')
const bookmarkIcon2 = require('../Assets/Images/bookmark2.png')
const BackPress = require('../Assets/Images/back.png')
const tickIcon = require('../Assets/Images/completed.png')
const learningpathBackground = require('../Assets/Images/learningpathBackground.png')
const backIcon = require('../Assets/Images/back.png')
const starIcon = require('../Assets/Images/star.png')
const durationIcon = require('../Assets/Images/duration.png')

export default function LearningPathScreen(props) {
  const { navigation, onDismissLoadingCallback, route } = props
  const dispatch = useDispatch()
  let userDetails = useSelector(authData)

  const networkStatusRef = useRef(true)
  const { learningsession } = route.params
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

  useEffect(() => {
    // alert(JSON.stringify(learningsession));
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    const listners = [navigation.addListener('willFocus', () => checkFocus())]
    getlearningContent()
    StatusBar.setHidden(false)
    LearningPathScreen.navListener = navigation.addListener('didFocus', () => {
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

  const getlearningContent = async () => {
    const bodyParam = {
      body: {
        ur_id: userDetails?.uData?.ur_id,
        schema: config.aws_schema,
        lpid: learningsession?.lp_id,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }

    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getLearningContent',
        bodyParam
      )
      // alert(JSON.stringify(bodyParam.body))
      if (response && response.statusCode === 200) {
        response.body.lname = learningsession?.lname
        setSharedObject(response.body)
        sharedObjectRef.current = response.body
        console.log('response', response)
        setIsLoading(false)
        setOpen(false)
      } else {
        response.body.lname = learningsession?.lname
        response.body.res = []
        setSharedObject(response.body)
        sharedObjectRef.current = response.body
        setIsLoading(false)
        setOpen(false)
      }
      //   setIsLoading(false)
      //   alert(JSON.stringify(sharedObjectRef.current.res))
    } catch (err) {
      setIsLoading(false)
      console.error(err)
    }
  }

  const addAndRemoveBookmark = async (val) => {
    setIsBookmarkedLoaded(true)
    const bodyParam = {
      body: {
        ur_id: userDetails?.uData?.ur_id,
        schema: config.aws_schema,
        lpid: learningsession?.lp_id,
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
    // alert(JSON.stringify(bodyParam.body))
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/updateContentReport',
        bodyParam
      )
      sharedObject.bookmark = bodyParam.body.bookmark
      setSharedObject(sharedObject)
      sharedObjectRef.current = sharedObject
      setIsBookmarkedLoaded(false)
    } catch (err) {
      console.error(err)
    }
  }

  const syncObjectsData = async () => {
    setBtnLoad(true)
    const bodyParam = {
      body: {
        ur_id: userDetails?.uData?.ur_id,
        schema: config.aws_schema,
        lpid: learningsession?.lp_id,
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
        '/updateRateAndBookMark',
        bodyParam
      )
      if (response) {
        setModalVisible(false)
        setBtnLoad(false)
        setOpen(false)
        getlearningContent()
      }
    } catch (err) {
      setBtnLoad(false)
      console.error(err)
    }
  }

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack())
  }

  function ratingCompleted(rating) {
    setIsRating(rating)
  }

  const handleitemClick = (dtls, id, type, lpid) => {
    // alert(JSON.stringify(id))
    if (type === 1) {
      navigation.navigate('CourseView', {
        courseId: dtls.tid,
        courseTitle: dtls.title,
      })
    } else {
      navigation.navigate('ObjectView', {
        objectOType: dtls.otype,
        objectOId: id,
        objectOName: dtls.title,
      })
    }
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
                {learningsession.lname}
              </Text>
            </View>
          </View>
        }
      />
      {!isLoading ? (
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 15,
              marginHorizontal: 20,
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                flexDirection: 'row',
                borderRadius: 5,
                width: 50,
                // alignSelf: 'flex-end',
                height: 25,
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
              }}
            >
              <Image
                source={starIcon}
                style={{ height: 20, width: 20, marginLeft: 1, marginTop: 2 }}
              />
              <Text style={{ marginTop: 4, marginHorizontal: 5 }}>
                {sharedObject?.star?.toFixed(1) || '0.0'}
              </Text>
            </View>
            {(!sharedObject.rate || sharedObject?.rate === null) && (
              <TouchableHighlight
                underlayColor="transparent"
                onPress={() => setModalVisible(true)}
              >
                <View style={styles.startButtonHolder}>
                  <Text style={styles.startText}>Rate content</Text>
                </View>
              </TouchableHighlight>
            )}
          </View>
          <View
            style={{
              justifyContent: 'space-between',
              marginHorizontal: 20,
              flexDirection: 'row',
              marginTop: 10,
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <Image source={durationIcon} style={{ height: 16, width: 16 }} />
              <Text style={{ marginLeft: 4 }}>
                {sharedObject?.time?.toFixed(1) || '5h 30m'}
              </Text>
            </View>
            <View>
              {sharedObject.bookmark ? (
                <TouchableOpacity onPress={() => addAndRemoveBookmark(1)}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Image
                      source={bookmarkIcon2}
                      style={{ height: 22, width: 22 }}
                    />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => addAndRemoveBookmark(0)}>
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
          <View style={{ flexDirection: 'row', marginLeft: 15 }}>
            <View
              style={{
                height: 30,
                width: 30,
                borderRadius: 30,
                backgroundColor: '#eaca1f',
                marginTop: 3,
                marginLeft: 5,
              }}
            >
              <Text style={{ textAlign: 'center', marginTop: 7 }}>
                {learningsession.points}
              </Text>
            </View>
            <Text style={{ marginTop: 8, marginLeft: 5 }}>points</Text>
          </View>
          <View style={styles.linestyle} />
          <ImageBackground
            source={learningpathBackground}
            style={{ width: '100%', height: '85%' }}
          >
            <ScrollView style={styles.scrollviewContainer}>
              <View style={styles.startContainer}>
                <Text style={styles.startStyle}>Start</Text>
              </View>
              {sharedObjectRef.current.res.map(
                (
                  { lcid, type, id, points, seq_id, lpid, idtls, cmpstatus },
                  idx
                ) => {
                  return (
                    <View style={{ flexDirection: 'column' }}>
                      <View>
                        <View style={styles.lineStyle} />
                        <View
                          style={{
                            alignItems: 'flex-start',
                            flexDirection: 'row',
                            backgroundColor: 'white',
                            borderColor: Constants.app_grey_color,
                            borderWidth: 1,
                            width: '85%',
                            alignSelf: 'center',
                            height: 50,
                            justifyContent: 'space-between',
                          }}
                        >
                          <View
                            style={{
                              height: 30,
                              width: 30,
                              borderRadius: 30,
                              backgroundColor: '#eaca1f',
                              marginLeft: 15,
                              alignSelf: 'center',
                            }}
                          >
                            <Text style={{ textAlign: 'center', marginTop: 7 }}>
                              {points}
                            </Text>
                          </View>
                          <Text
                            style={styles.ButtonTextStyle}
                            onPress={() => {
                              handleitemClick(idtls, id, type, lpid)
                            }}
                          >
                            {idtls?.title}
                          </Text>
                          {cmpstatus ? (
                            <View
                              style={{
                                alignSelf: 'center',
                                marginRight: 15,
                              }}
                            >
                              <Image
                                source={tickIcon}
                                style={styles.tickIcon}
                              />
                            </View>
                          ) : <View style = {{ marginRight: 15,}}></View>}
                        </View>
                      </View>
                    </View>
                  )
                }
              )}
              <View style={styles.lineStyle} />
              <Image source={flagIcon} style={styles.flagIconStyle} />
              <View
                style={{
                  height: 30,
                  width: 30,
                  borderRadius: 30,
                  backgroundColor: '#eaca1f',
                  alignSelf: 'center'
                }}
              >
                <Text style={{ textAlign: 'center', marginTop: 7 }}>450</Text>
              </View>
            </ScrollView>
          </ImageBackground>
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
        </View>
      ) : (
        <SkeletonLoader loader="topicsDashboard" />
      )}
    </View>
  )
}
const styles = StyleSheet.create({
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
})
