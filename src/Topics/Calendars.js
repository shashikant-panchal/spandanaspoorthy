import React, { useEffect, useState, useRef } from 'react'
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
  Linking,
  Modal,
  ActivityIndicator,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import NetInfo from '@react-native-community/netinfo'
import Amplify, { Cache, API, Auth } from 'aws-amplify'
import LinearGradient from 'react-native-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import config from '../../aws-exports'
import Toolbar from '../Profile/Toolbar'
import Constants from '../constants'
import SkeletonLoader from '../common/appSkeletonLoader'
import { Calendar } from 'react-native-calendars'
import { awsSignIn, authData } from '../redux/auth/authSlice'
import { useSelector, useDispatch } from 'react-redux'
import { CommonActions } from '@react-navigation/native'

const backIcon = require('../Assets/Images/back.png')

const topicsHeight = 120
const exploreWidth = (Constants.app_width - 20) / 2 - 10
const exploreHeight = exploreWidth - 30
const myTopicsWidth = (Constants.app_width - 10) / 2 - 10
let myTopicsHeight = myTopicsWidth
const myTopicsImgHeight = myTopicsHeight / 2
const topicsWidth = (Constants.app_width - 5) / 2.4 - 5
// const topicsHeight = 120;
const topicsImgHeight = topicsHeight / 2
let toolbarHeight
const logoWidth = 70
const logoHeight = 30
// const toolbarHeight = 50;

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

export default function CalendarsScreen(props) {
  const { onDismissLoadingCallback, route } = props
  const networkStatusRef = useRef(true)
  const navigation = useNavigation()
  const [spinner, setSpinner] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [inputText, setInputText] = useState('')
  const [connectionStatus, setConnectionStatus] = useState(true)
  const [newNotify, setNewNoify] = useState(false)
  const [allEvents, setAllEvents] = useState('')
  const [startDate, setStartDate] = useState('')
  const [events, setevents] = useState({})
  const [refreshing, setRefreshing] = useState(false)
  const [upEvents, setupEvents] = useState([])
  const upEventsRef = useRef([])
  const [upcomingEve, setUpcomingEve] = useState([])
  const [eventTitle, setEventTitle] = useState('')
  const [allEventsTitle, setAllEventsTitle] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modalSpinner, setModalSpinner] = useState(false)

  const dispatch = useDispatch()
  let userDetails = useSelector(authData)

  useEffect(() => {
    // alert(JSON.stringify(upEventsRef.current));
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    const listners = [navigation.addListener('willFocus', () => checkFocus())]
    fetchAllEvents()
    StatusBar.setHidden(false)

    CalendarsScreen.navListener = navigation.addListener('didFocus', () => {
      StatusBar.setBarStyle('dark-content')
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(Constants.app_statusbar_color)
        StatusBar.setTranslucent(true)
      }
    })
    return () => {
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

  async function fetchAllEvents() {
    setModalSpinner(true)
    // console.log("bhumikareddya " + JSON.stringify(info));
    const bodyParam = {
      body: {
        oid: config.aws_org_id,
        st_id: userDetails.uData.st_id,
        schema: config.aws_schema,
        groups: userDetails?.uData?.gid
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    console.log('allEvents ', JSON.stringify(bodyParam.body))
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        `/getEvents`,
        bodyParam
      )
      console.log('allEvents ', JSON.stringify(response))
      //   alert("allEvents ", JSON.stringify(response));
      convertEventData(response.events)
      setAllEvents(response.events)
      setModalSpinner(false)
      setIsLoading(false)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('allEventsError ', error)
    }
  }

  function convertEventData(data) {
    let upEvents = data
    // alert(JSON.stringify(upEvents))
    // if (data.length > 5) {
    //   upEvents = data.slice(-3);
    //   // setupEvents(upEvents);
    // }
    filter(upEvents)
    function filter(data) {
      let m = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'sep',
        'Oct',
        'Nov',
        'Dec',
      ]
      let temp = []
      for (let i = 0; i < data.length; i++) {
        let res = new Date(Number(data[i].start))

        let d = new Date()
        // let month = 0;

        if (
          res.getFullYear() == d.getFullYear() &&
          res.getMonth() >= d.getMonth() &&
          res.getDate() >= d.getDate()
        ) {
          let obj = {
            title: data[i].title,
            desc: data[i].desc,
            month: m[res.getMonth()],
            day: res.getDate(),
            link: data[i].link,
            sessionId: data[i].sid
          }
          temp.push(obj)
        }
      }
      setupEvents(temp)
      setUpcomingEve(temp)
    }
    let markedDates = {}
    for (let i = 0; i < data.length; i++) {
      let res = data[i].start.split('-')
      if (res[1] != 0) {
        res[1] = res[1] - 1
      }
      let newDate = data[i].start
      let result = new Date(Number(newDate))
      let eventyear = result.getFullYear()
      // console.log(year.length())
      let eventmonth = result.getMonth() + 1
      let eventfullmonth = ''
      if (eventmonth.toString().length == 1) {
        eventfullmonth = '0' + eventmonth
      } else {
        eventfullmonth = eventmonth
      }
      let eventdate = result.getDate()
      let eventfinalDate = eventyear + '-' + eventfullmonth + '-' + eventdate

      let year = result.getFullYear()
      // console.log(year.length())
      let month = result.getMonth() + 1
      let fullmonth = ''
      if (month.toString().length == 1) {
        fullmonth = '0' + month
      } else {
        fullmonth = month
      }
      let date = result.getDate()
      let finalDate = year + '-' + fullmonth + '-' + date
      setEventTitle(finalDate)
      let obj = {
        selected: true,
        selectedColor: Constants.app_blue_color,
        title: data[i].title,
      }
      markedDates[eventfinalDate] = obj
    }
    setevents(markedDates)
  }

  function toTimestamp(a) {
    var datum = Date.parse(a)
    return datum / 1
  }

  function openUrl(url) {
    return <View>{Linking.openURL(`${url}`)}</View>
  }

  function alertFunction(date) {
    console.log(JSON.stringify(date))
    // console.log(Date(date).getTime());
    console.log(JSON.stringify(events))
    {
      eventTitle === date
        ? Alert.alert('', `${events[date].title}`, [{ text: 'OK' }], {
            cancelable: false,
          })
        : Alert.alert('', 'No Events on this Date!', [{ text: 'OK' }], {
            cancelable: false,
          })
    }
  }

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack())
  }

  function renderEvents() {
    return (
      <ScrollView>
        <View>
          <View style={styles.sectionHeader}>
            <Text style={[styles.headerText1, styles.appFontFamily]}>
              My Events
            </Text>
          </View>

          <View>
            <Calendar
              onDayPress={(day) => {
                alertFunction(day.dateString)
              }}
              markedDates={events}
            />
          </View>
        </View>

        <View>
          <View style={styles.sectionHeader}>
            <Text style={[styles.headerText1, styles.appFontFamily]}>
              Upcoming Events
            </Text>
          </View>
          <View>
            {upEvents.length == 0 ? (
              <Text style={{ marginTop: 10, marginLeft: 10 }}>
                {' '}
                No Upcoming Events
              </Text>
            ) : (
              upEvents.map((event) => (
                <View style={{ marginTop: 20 }}>
                  <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                    <View
                      style={{
                        borderWidth: 0.5,
                        margin: 10,
                        width: 50,
                        height: 45,
                        borderBottomEndRadius: 5,
                        borderBottomStartRadius: 5,
                      }}
                    >
                      <Text
                        style={{
                          backgroundColor: Constants.app_button_color,
                          textAlign: 'center',
                          height: 22,
                        }}
                      >
                        {event.month}
                      </Text>
                      <Text style={{ textAlign: 'center', marginTop: 3 }}>
                        {event.day}
                      </Text>
                    </View>
                    <View style = {{marginBottom: 10}}>
                      <Text
                        style={{
                          fontSize: 16,
                          alignSelf: 'flex-start',
                          marginTop: 10,
                          marginLeft: 10,
                        }}
                      >
                        {event.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          alignSelf: 'flex-start',
                          marginVertical: 5,
                          marginLeft: 10,
                        }}
                      >
                        {event.title} has been published and you will be able to
                        join session when its time
                      </Text>
                      {event.sessionId !== null ? (
                      <View
                        style={{
                          backgroundColor: Constants.app_button_color,
                          width: 90,
                          height: 25,
                          marginLeft: '20%',
                          justifyContent: 'center',
                          borderRadius: 2,
                        }}
                      >
                        <TouchableHighlight
                          underlayColor="transparent"
                          onPress={() =>
                            // alert(JSON.stringify(event))
                            navigation.navigate('LiveSession', {
                              sessionId: event.sessionId,
                              sessionName: event.title,
                            })
                          }
                        >
                          <Text
                            style={{
                              color: 'white',
                              fontWeight: '700',
                              fontSize: 12,
                              alignSelf: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            View Session
                          </Text>
                        </TouchableHighlight>
                      </View>
                      ) : null }
                      {/* {event.link === undefined || event.link === '' ? null : (
                        <View style={{flexDirection: 'row'}}>
                          <Text style ={{ marginLeft: 8}}> Link : </Text>
                          <TouchableHighlight
                            underlayColor="transparent"
                            onPress={() => openUrl(event.link)}>
                            <Text style={{color: Constants.app_button_color}}>
                              {event.link}{' '}
                            </Text>
                          </TouchableHighlight>
                        </View>
                      )} */}
                    </View>
                  </View>
                  <View style={styles.bottomLineStyle} />
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
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
                  Calendar
                </Text>
              </View>
            </View>
          }
        />
        <View style={styles.noInternet}>
          {!connectionStatus && (
            <Text style={[styles.noNetwork, styles.appFontFamily]}>
              No internet connectivity
            </Text>
          )}
        </View>
        {
          // (!isLoading) ?
          renderEvents()
          // : <SkeletonLoader loader="home1" />
        }
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.app_color,
  },
  screenstyle: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight,
      },
    }),
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
  noInternet: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    opacity: 0.8,
    zIndex: 1000,
  },
  sectionHeader: {
    width: Constants.app_width,
    // height: 50,
    marginTop: 25,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    // alignItems: 'center',
  },
  headerText1: {
    ...Platform.select({
      ios: {
        fontSize: 16,
        marginLeft: 20,
      },
      android: {
        marginTop: 0,
        fontSize: 14,
        marginLeft: 20,
        // justifyContent: 'center',
        // alignSelf: 'center',
      },
    }),
    color: '#333333',
    fontWeight: '700',
  },
  bottomLineStyle: {
    height: 2,
    backgroundColor: Constants.app_grey_color,
    width: '90%',
    alignSelf: 'center',
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
    marginLeft: -10,
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
  notifyImage: {
    height: 30,
    width: 30,
    tintColor: Constants.app_button_color,
  },
  notifyHolder: {
    marginRight: -10,
    ...Platform.select({
      ios: {
        marginTop: -38,
      },
      android: {
        marginTop: -43,
      },
    }),
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    position: 'absolute',
  },
  modalView: {
    marginTop: 250,
    alignSelf: 'center',
    backgroundColor: 'white',
    position: 'absolute',
    borderRadius: 10,
    height: 230,
    width: '85%',
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
    backgroundColor: 'green',
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: 'green',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginTop: 15,
    fontWeight: '700',
    textAlign: 'center',
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
})
