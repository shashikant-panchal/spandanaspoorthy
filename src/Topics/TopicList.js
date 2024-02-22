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
  ScrollView,
  Alert,
  TouchableOpacity,
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

const emptyResultIcon = require('../Assets/Images/nocategory.png')
const backIcon = require('../Assets/Images/back.png')
const profileIcon = require('../Assets/Images/my_profile.png')
const starIcon = require('../Assets/Images/star.png')
const bookmarkIcon1 = require('../Assets/Images/bookmark1.png')
const bookmarkIcon2 = require('../Assets/Images/bookmark2.png')
const moduleIcon = require('../Assets/Images/modules.png')
const audioIcon = require('../Assets/Images/audioObject.png')
const videoIcon = require('../Assets/Images/videoObject.png')
const interactivityIcon = require('../Assets/Images/reviewObject.png')
const quizIcon = require('../Assets/Images/quizObject.png')
const pdfIcon = require('../Assets/Images/pdfObject.png')
const htmlIcon = require('../Assets/Images/htmlObject.png')
const scormIcon = require('../Assets/Images/scormObject.png')
const clockIcon = require('../Assets/Images/clock_img.png')

const exploreWidth = (Constants.app_width - 20) / 2 - 10
const exploreHeight = exploreWidth - 30
const myTopicsWidth = (Constants.app_width - 10) / 2 - 10
const topicsWidth = Constants.app_width / 3.8
const topicsHeight = 140
const topicsImgHeight = topicsHeight / 1.2
const topicsObjHeight = Constants.app_width / 3
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

export default function TopicListScreen(props) {
  const { navigation, route } = props
  const { programId, programTitle } = route.params
  const [spinner, setSpinner] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [courseData, setCourseData] = useState([])
  const courseDataRef = useRef([])
  const [oCourseData, setOCourseData] = useState([])
  const [programData, setProgramData] = useState([])
  const [oprogramData, setOProgramData] = useState([])
  const [objectData, setObjectData] = useState([])
  const [oObjectData, setOObjectData] = useState([])

  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isBookmarkedLoaded, setIsBookmarkedLoaded] = useState(false)

  const dispatch = useDispatch()
  let userDetails = useSelector(authData)
  // let userdata = useSelector((state) => state.user.value)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    getCategoryData()
    TopicListScreen.navListener = navigation.addListener('didFocus', () => {
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
    getCategoryData().then(() => {
      setRefreshing(false)
    })
  }

  async function getCategoryData() {
    const bodyParam = {
      body: {
        tid: programId,
        oid: config.aws_org_id,
        tenant: userDetails.locale,
        schema: config.aws_schema,
        ur_id: userDetails?.uData?.ur_id,
        groups: userDetails?.uData?.gid,
      },
      headers: {
        'content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    console.log(JSON.stringify(bodyParam.body))
    setSpinner(true)
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/edGetCategoryData',
        bodyParam
      )
      // alert(JSON.stringify(response))
      if (response !== undefined) {
        let { objects, courses, programs } = response
        let copyObject = [...objects]
        let filldata = { ...userDetails }

        let temp = []
        let OCourse = []
        for (let i = 0; i < courses?.length; i++) {
          if (
            courses[i].pid != undefined &&
            courses[i].pid !== 0 &&
            courses[i].pid.replace(/\s/g, '').length != 0
          ) {
            temp.push(courses[i])
          } else {
            OCourse.push(courses[i])
          }
        }

        OCourse?.sort((a, b) => b['con'] - a['con'])
        setCourseData(OCourse)
        courseDataRef.current = OCourse
        setOCourseData(OCourse)

        let result = groupByKey(temp, 'pid')

        let program = []
        for (const [key, value] of Object.entries(result)) {
          let obj = {}
          obj.pid = value[0].pid
          obj.pname = value[0].pname
          obj.courses = value
          if (programs[value[0].pid] != undefined) {
            obj.con = programs[value[0].pid].con
            obj.tv = programs[value[0].pid].tv
          }
          program.push(obj)
        }
        program?.sort((a, b) => b['con'] - a['con'])
        setProgramData(program)
        setOProgramData(program)

        copyObject?.sort((a, b) => b['con'] - a['con'])
        setObjectData(copyObject)
        setOObjectData(copyObject)

        if (filldata.filter === undefined) {
          filldata.filter = {}
          filldata.filter.cdata = OCourse
          filldata.filter.pdata = program
          filldata.filter.odata = copyObject

          dispatch(awsSignIn(filldata))
        }

        setSpinner(false)
      }
    } catch (error) {
      setSpinner(false)
      console.error(error)
    }
  }

  function groupByKey(array, key) {
    return array.reduce((hash, obj) => {
      if (obj[key] === undefined) return hash
      return Object.assign(hash, {
        [obj[key]]: (hash[obj[key]] || []).concat(obj),
      })
    }, {})
  }

  const emptyData = (
    <View style={[styles.emptyData, { alignSelf: 'center' }]}>
      <Image
        style={{
          height: 60,
          width: 60,
          alignSelf: 'center',
          marginTop: 30,
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

  async function addAndRemoveBookmark(rowData, val) {
    // alert(JSON.stringify(userdata))
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
      // alert(JSON.stringify(bodyParam.body))
      if (val === 1) {
        bodyParam.body.bookmark_date = 1
      }

      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/updateTopicReport',
        bodyParam
      )
      // alert(JSON.stringify(response))
      val === 1 ? setIsBookmarked(true) : setIsBookmarked(false)
      setIsBookmarkedLoaded(false)
      onRefresh()
    } catch (error) {
      console.error(error)
    }
  }

  async function addAndRemoveBookmarkContent(rowData, val, idx) {
    // alert(JSON.stringify(rowData))
    try {
      const bodyParam = {
        body: {
          objid: rowData.objid,
          ur_id: userDetails?.uData?.ur_id,
          schema: config.aws_schema,
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
      // alert(JSON.stringify(bodyParam.body))
      if (val === 1) {
        bodyParam.body.bookmark = true
        bodyParam.body.bookmark_date = 1
      } else {
        bodyParam.body.bookmark = false
      }
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/updateContentReport',
        bodyParam
      )
      // alert(JSON.stringify(response))
      onRefresh()
    } catch (error) {
      console.error(error)
    }
  }

  function didSelectTopic(courseDetails) {
    if (courseDetails) {
      navigation.navigate('CourseView', {
        courseId: courseDetails.tid,
        courseTitle: courseDetails.tn,
        programId: courseDetails.cgry_id,
      })
    }
  }

  const didSelectObject = (courseDetails) => {
    // alert(JSON.stringify(courseDetails))
    if (courseDetails) {
      navigation.navigate('ObjectView', {
        objectOType: courseDetails.otype,
        objectOId: courseDetails.objid,
        objectOName: courseDetails.oname,
      })
    }
  }

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack())
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

  function renderCoursesView(data) {
    const rowData = data.item
    // alert(JSON.stringify(data))
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
            {rowData.bk === true ? (
              <TouchableOpacity
                onPress={() => addAndRemoveBookmark(rowData, 0)}
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
                onPress={() => addAndRemoveBookmark(rowData, 1)}
              >
                <View style={{ alignItems: 'flex-end' }}>
                  <Image
                    source={bookmarkIcon1}
                    style={{ height: 22, width: 22 }}
                  />
                </View>
              </TouchableOpacity>
            )}

            <View
              style={{
                backgroundColor: 'white',
                flexDirection: 'row',
                marginTop: '18%',
                borderRadius: 5,
                width: 50,
              }}
            >
              <Image source={starIcon} style={{ height: 20, width: 20 }} />
              <Text style={{ marginTop: 2, marginHorizontal: 5 }}>
                {rowData.sortdt?.rate ? rowData.sortdt?.rate.toFixed(1) : '0.0'}
              </Text>
            </View>
          </ImageBackground>
          {renderProgressBar(rowData)}
          <Text
            numberOfLines={2}
            style={[styles.topicTitle, styles.appFontFamily]}
          >
            {rowData.tn}
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
              {rowData.nugcnt} Modules
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  const renderBgColor = (param) => {
    // alert(param)
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
                  {programTitle}
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
        {!spinner ? (
          <View
            style={{
              justifyContent: 'flex-start',
              marginTop: 20,
            }}
          >
            <View>
              <View style={[styles.sectionHeader, styles.rowView]}>
                <Text style={[styles.headerText1, styles.appFontFamily]}>
                  Courses
                </Text>
              </View>
            </View>
            <FlatList
              style={styles.programDetailsView}
              data={courseDataRef.current}
              renderItem={renderCoursesView}
              keyExtractor={(_item, index) => index.toString()}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={emptyData}
              horizontal
              refreshControl={
                <RefreshControl
                  tintColor={Constants.app_button_color}
                  colors={[
                    Constants.app_button_color,
                    Constants.app_button_color,
                  ]}
                  progressViewOffset={35}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
            />
          </View>
        ) : (
          <SkeletonLoader loader="explore" />
        )}

        {!spinner ? (
          <View
            style={{
              justifyContent: 'flex-start',
              marginTop: 20,
            }}
          >
            <View>
              <View style={[styles.sectionHeader, styles.rowView]}>
                <Text style={[styles.headerText1, styles.appFontFamily]}>
                  Reading Material
                </Text>
              </View>
            </View>
            <FlatList
              style={styles.programDetailsView}
              data={oObjectData}
              refreshControl={
                <RefreshControl
                  tintColor={Constants.app_button_color}
                  colors={[
                    Constants.app_button_color,
                    Constants.app_button_color,
                  ]}
                  progressViewOffset={35}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                />
              }
              renderItem={({ item, index }) => (
                <TouchableHighlight
                  underlayColor={renderBgColor(item.otype)}
                  onPress={() => didSelectObject(item, index)}
                  style={[
                    styles.TopicsRowContainerObject,
                    { backgroundColor: renderBgColor(item.otype) },
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
                        {renderIcon(item.otype)}
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
                        <Image
                          source={starIcon}
                          style={{ height: 20, width: 20 }}
                        />
                        <Text style={{ marginTop: 2, marginHorizontal: 5 }}>
                          {item.sortdt?.rate
                            ? item.sortdt?.rate.toFixed(1)
                            : '0.0'}
                        </Text>
                      </View>
                    </View>
                    <Text
                      numberOfLines={2}
                      style={[styles.topicTitleObject, styles.appFontFamily]}
                    >
                      {item.oname}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginHorizontal: '2%',
                        marginTop: '2%',
                      }}
                    >
                      <View
                        style={{
                          alignItems: 'flex-end',
                          flexDirection: 'row',
                          marginLeft: 5,
                        }}
                      >
                        <Image
                          source={clockIcon}
                          style={{ height: 12, width: 12, marginBottom: 4 }}
                        />
                        <Text
                          style={{
                            marginLeft: 2,
                            fontSize: 12,
                            marginBottom: 2,
                          }}
                        >
                          {Math.floor(item.dur / 60)}m{' '}
                          {item.dur - Math.floor(item.dur / 60) * 60}s
                        </Text>
                      </View>
                      {item.bk && (
                        <TouchableOpacity
                          onPress={() =>
                            addAndRemoveBookmarkContent(item, 0, index)
                          }
                        >
                          <View style={{ alignItems: 'flex-end' }}>
                            <Image
                              source={bookmarkIcon2}
                              style={{ height: 22, width: 22 }}
                            />
                          </View>
                        </TouchableOpacity>
                      )}
                      {!item.bk && (
                        <TouchableOpacity
                          onPress={() =>
                            addAndRemoveBookmarkContent(item, 1, index)
                          }
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
                </TouchableHighlight>
              )}
              keyExtractor={(_item, index) => index.toString()}
              ListEmptyComponent={emptyData}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              horizontal
            />
          </View>
        ) : (
          <SkeletonLoader loader="explore" />
        )}
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
    marginLeft:
      Platform.OS === 'ios'
        ? Constants.app_width / 10
        : Constants.app_width / 2 - 80,
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
    flex: 1,
    color: Constants.app_searchbar_text,
    marginLeft: 6,
    fontFamily: Constants.app_font_family_regular,
    ...Platform.select({
      ios: {
        paddingTop: 4,
        justifyContent: 'center',
        alignSelf: 'center',
      },
      android: {
        padding: 4,
      },
    }),
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
    width: topicsHeight + 35,
    height: topicsWidth,
    marginLeft: 15,
    borderRadius: 10,
    marginBottom: 10,
    // borderWidth: 0.1,
    backgroundColor: 'black',
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
    height: 40,
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
    height: topicsImgHeight / 1.6,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
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
})
