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
import { Directions } from 'react-native-gesture-handler'

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
const exploreWidth = (Constants.app_width - 20) / 2 - 10
const exploreHeight = exploreWidth - 30
const myTopicsWidth = (Constants.app_width - 10) / 2 - 10
const topicsWidth = Constants.app_width / 3.4
const topicsObjHeight = Constants.app_width / 3
const topicsHeight = 120
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
const emptyResultIcon = require('../Assets/Images/nocategory.png')
const backIcon = require('../Assets/Images/back.png')
const bookmarkIcon2 = require('../Assets/Images/bookmark2.png')
const starIcon = require('../Assets/Images/star.png')
const moduleIcon = require('../Assets/Images/modules.png')
const audioIcon = require('../Assets/Images/audioObject.png')
const videoIcon = require('../Assets/Images/videoObject.png')
const interactivityIcon = require('../Assets/Images/reviewObject.png')
const quizIcon = require('../Assets/Images/quizObject.png')
const pdfIcon = require('../Assets/Images/pdfObject.png')
const htmlIcon = require('../Assets/Images/htmlObject.png')
const scormIcon = require('../Assets/Images/scormObject.png')
const clockIcon = require('../Assets/Images/clock_img.png')

export default function BookmarksScreen(props) {
  const navigation = useNavigation()
  // const { navigation } = props;
  const [loaded, setLoaded] = useState()
  const networkStatusRef = useRef(true)
  const [refreshing, setRefreshing] = useState(false)
  const [spinner, setSpinner] = useState(true)
  const [list, setList] = useState([])
  const dispatch = useDispatch()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isBookmarkedLoaded, setIsBookmarkedLoaded] = useState(false)

  let userDetails = useSelector(authData)

  useEffect(() => {
    // console.log('userDetails ' + JSON.stringify(userDetails.res[0].eid));
    bookmarksList()
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    const listners = [navigation.addListener('willFocus', () => checkFocus())]
    netStatus()
    StatusBar.setHidden(false)

    BookmarksScreen.navListener = navigation.addListener('didFocus', () => {
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
    setRefreshing(false)
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

  async function bookmarksList() {
    // alert(JSON.stringify(userDetails.uData))
    const bodyParam = {
      body: {
        ur_id: userDetails?.uData?.ur_id,
        schema: config.aws_schema,
        tenant: userDetails?.locale,
        groups: userDetails?.uData?.gid,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    console.log(JSON.stringify(bodyParam.body));
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/listBookMark',
        bodyParam
      )
      console.log(JSON.stringify(response))
      const { items } = response
      setList(response.items)

      setSpinner(false)
      return items
    } catch (err) {
      console.error(err)
    }
  }

  async function deleteBookmark(rowData) {
    // alert(JSON.stringify(rowData))
    const bodyParam = {
      body: {
        ur_id: userDetails.uData.ur_id,
        schema: config.aws_schema,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    if (rowData.type === 1) {
      bodyParam.body.tid = rowData.tid
    } else {
      bodyParam.body.objid = rowData.tid
    }
    bodyParam.body.bookmark = false
    let book = list.filter((prev) => prev.tid !== rowData.tid)
    setList(book)
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        rowData.type === 1 ? '/updateTopicReport' : '/updateContentReport',
        bodyParam
      )
    } catch (err) {
      console.error(err)
    }
  }

  function didSelectTopic(courseDetails) {
    // alert(JSON.stringify(userDetails))
    if (courseDetails) {
      navigation.navigate('CourseView', {
        courseId: courseDetails.tid,
        courseTitle: courseDetails.tname[0].title,
      })
    }
  }

  const didSelectObject = (courseDetails) => {
    // alert(JSON.stringify(courseDetails.tname[0]))
    if (courseDetails) {
      navigation.navigate('ObjectView', {
        objectOType: courseDetails.tname[0].otype,
        objectOId: courseDetails.tid,
        objectOName: courseDetails.tname[0].title,
      })
    }
  }

  function getCourseProgress(data) {
    // console.log(JSON.stringify(data))
    let Percent = (data.cobj / data.tobj) * 100
    let res = Math.round(Percent * 100 + Number.EPSILON) / 100
    let finalRes = res / 100
    return finalRes
  }

  function renderProgressBar(data) {
    return (
      <View>
        {Platform.OS === 'android' ? (
          <View
            style={{
              alignSelf: 'center',
              width: '90%',
              height: 15,
              marginTop: 5,
            }}
          >
            <ProgressBar
              styleAttr="Horizontal"
              progress={getCourseProgress(data)}
              indeterminate={false}
              color={Constants.app_button_color}
            />
          </View>
        ) : (
          <ProgressView
            progress={getCourseProgress(data)}
            style={{
              transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
              height: 2,
              width: '90%',
              marginLeft: 5,
              marginTop: 10,
            }}
            progressTintColor={Constants.app_button_color}
          />
        )}
      </View>
    )
  }

  const renderBgColor = (param) => {
    if (param === 'video' || param === 'youtube' || param === 'vimeo') {
      return '#E2D2FE'
    } else if (param === 'pdf' || param === 'html') {
      return '#FDE1AB'
    } else if (param === 'Interactivity' || param === 'interactivity') {
      return '#CCF0BF'
    } else if (param === 'quiz') {
      return '#FFD27E'
    } else if (param === 'scorm') {
      return '#BAE5F4'
    } else if (param === 'audio') {
      return '#EECFCF'
    } else if (param === 'scorm') {
      return '#BAE5F4'
    }
  }

  const renderIcon = (param) => {
    if (param === 'video' || param === 'youtube' || param === 'vimeo') {
      return <Image source={videoIcon} style={{ height: 25, width: 25 }} />
    } else if (param === 'pdf') {
      return <Image source={pdfIcon} style={{ height: 25, width: 25 }} />
    } else if (param === 'Interactivity') {
      return (
        <Image source={interactivityIcon} style={{ height: 25, width: 25 }} />
      )
    } else if (param === 'audio') {
      return <Image source={audioIcon} style={{ height: 25, width: 25 }} />
    } else if (param === 'quiz') {
      return <Image source={quizIcon} style={{ height: 25, width: 25 }} />
    } else if (param === 'scorm') {
      return <Image source={scormIcon} style={{ height: 25, width: 25 }} />
    } else if (param === 'html') {
      return <Image source={htmlIcon} style={{ height: 25, width: 25 }} />
    }
  }

  function renderBookmarkView(data) {
    const rowData = data.item
    if (rowData.type === 1) {
      return (
        <TouchableHighlight
          underlayColor="transparent"
          onPress={() => didSelectTopic(rowData)}
        >
          <View style={styles.TopicsRowContainer}>
            <ImageBackground
              style={styles.topicImg}
              imageStyle={{ borderTopRightRadius: 10, borderTopLeftRadius: 10 }}
              source={{
                uri: `https://${
                  Constants.DOMAIN
                }/${config.aws_org_id.toLowerCase()}-resources/images/topic-images/${
                  rowData.tid
                }.png`,
                cache: 'reload',
              }}
            >
              <TouchableOpacity onPress={() => deleteBookmark(rowData)}>
                <View style={{ alignItems: 'flex-end' }}>
                  <Image
                    source={bookmarkIcon2}
                    style={{ height: 22, width: 22 }}
                  />
                </View>
              </TouchableOpacity>

              <View
                style={{
                  backgroundColor: 'white',
                  flexDirection: 'row',
                  marginTop: topicsImgHeight / 3.9,
                  borderRadius: 5,
                  width: 50,
                }}
              >
                <Image source={starIcon} style={{ height: 20, width: 20 }} />
                <Text style={{ marginTop: 2, marginHorizontal: 5 }}>
                  {rowData?.ravg
                    ? rowData?.ravg.toFixed(1)
                    : '0.0'}
                </Text>
              </View>
            </ImageBackground>
            {/* {renderProgressBar(rowData)} */}
            <Text
              numberOfLines={2}
              style={[styles.topicTitle, styles.appFontFamily]}
            >
              {rowData.tname[0].title}
            </Text>
            <View style={{ flexDirection: 'row', marginHorizontal: 5 }}>
              <Image
                source={moduleIcon}
                style={{ height: 15, width: 15, marginTop: 2 }}
              />
              <Text
                style={{
                  fontSize: 10,
                  marginTop: 3.5,
                  color: Constants.app_text_color,
                }}
              >
                {rowData.tname[0].module} Modules
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      )
    } else if (rowData.type === 2) {
      return (
        <TouchableHighlight
          underlayColor={renderBgColor(rowData.otype)}
          onPress={() => didSelectObject(rowData)}
          style={[
            styles.TopicsRowContainerObject,
            { backgroundColor: renderBgColor(rowData.tname[0].otype) },
          ]}
        >
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: '2%',
                marginTop: '2%',
              }}
            >
              <View style={{ marginLeft: 5, marginTop: 3 }}>
                {renderIcon(rowData.tname[0].otype)}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  borderRadius: 5,
                  width: 50,
                  height: 22,
                  backgroundColor: 'white',
                }}
              >
                <Image source={starIcon} style={{ height: 20, width: 20 }} />
                <Text style={{ marginTop: 2, marginHorizontal: 5 }}>
                  {rowData?.ravg
                    ? rowData?.ravg.toFixed(1)
                    : '0.0'}
                </Text>
              </View>
            </View>
            <Text
              numberOfLines={2}
              style={[styles.topicTitleObject, styles.appFontFamily]}
            >
              {rowData.tname[0].title}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: '2%',
                marginBottom: 5
              }}
            >
              <Text
                style={{
                  marginLeft: 2,
                  fontSize: 12,
                  width: '70%'
                }}
              >
                Bookmark Date:
                {rowData.bookmark_date}
              </Text>
              <TouchableOpacity onPress={() => deleteBookmark(rowData)}>
                <View style={{ alignItems: 'flex-end' }}>
                  <Image
                    source={bookmarkIcon2}
                    style={{ height: 22, width: 22 }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableHighlight>
      )
    }
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
                Bookmarks
              </Text>
            </View>
          </View>
        }
      />
      <ScrollView
        style={styles.scrollview}
        showsVerticalScrollIndicator={false}
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
        <View style={styles.spinnerView}>
          {!networkStatusRef.current && (
            <Text style={[styles.noNetwork, styles.appFontFamily]}>
              No internet connectivity
            </Text>
          )}
        </View>
        <View style={!spinner}>
          {!spinner ? (
            <View>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  marginTop: 20,
                }}
              ></View>
              <FlatList
                style={styles.certiDetailsView}
                data={list}
                renderItem={renderBookmarkView}
                keyExtractor={(_item, index) => index.toString()}
                ListEmptyComponent={emptyData}
                //   showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                // horizontal
                numColumns={2}
              />
            </View>
          ) : (
            <SkeletonLoader loader="topicsDashboard" />
          )}
        </View>
      </ScrollView>
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
    ...Platform.select({
      ios: {
        marginTop: 1,
      },
      android: {
        marginTop: 0,
      },
    }),
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
    width: '100%',
    height: Constants.app_height - 50,
  },
  topTopicsRowContainer: {
    width: topicsWidth,
    height: topicsHeight,
    marginHorizontal: 15,
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
  programtopicImg: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: topicsWidth,
    height: topicsHeight,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
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
  TopicsRowContainer: {
    width: topicsWidth * 1.4,
    height: topicsHeight * 1.1,
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
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: topicsWidth * 1.4,
    height: topicsImgHeight / 1.4,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
    }),
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
  TopicsRowContainerObject: {
    height: topicsObjHeight,
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
  topicImgObject: {
    borderRadius: 10,
    height: topicsWidth - 15,
    width: topicsHeight + 30,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
    }),
  },
  topicTitleObject: {
    textAlign: 'center',
    marginTop: 15,
    height: 38,
    // textAlign: 'center',
    ...Platform.select({
      ios: {
        fontSize: 14,
      },
      android: {
        fontSize: 14,
      },
    }),
    color: Constants.app_text_color,
    fontWeight: 'bold',
  },
})
