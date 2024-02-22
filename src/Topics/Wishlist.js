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
import moment from 'moment'

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
const emptyResultIcon = require('../Assets/Images/nocategory.png')
const backIcon = require('../Assets/Images/back.png')
const bookmarkIcon2 = require('../Assets/Images/bookmark2.png')
const starIcon = require('../Assets/Images/star.png')
const moduleIcon = require('../Assets/Images/modules.png')

export default function WishlistScreen(props) {
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
    getMyWishlist()
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    const listners = [navigation.addListener('willFocus', () => checkFocus())]
    netStatus()
    StatusBar.setHidden(false)

    WishlistScreen.navListener = navigation.addListener('didFocus', () => {
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

  async function getMyWishlist() {
    // alert(JSON.stringify(userDetails))
    const bodyParam = {
      body: {
        oid: config.aws_org_id,
        tenant: userDetails.locale,
        eid: userDetails.sub,
        ur_id: userDetails?.uData?.ur_id,
        schema: config.aws_schema,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    // alert(JSON.stringify(bodyParam.body));
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getMyInterests',
        bodyParam
      )
      //   alert(JSON.stringify(response))
      const { items } = response
      setList(response.items)

      setSpinner(false)
      return items
    } catch (err) {
      console.error(err)
    }
  }

  function didSelectSession(sessionDetails) {
    // alert(JSON.stringify(sessionDetails))
    if (sessionDetails) {
      navigation.navigate('LiveSession', {
        sessionId: sessionDetails.tid,
        sessionName: sessionDetails.tname[0].title
      })
    }
  }

  function renderWishlistView(data) {
    const rowData = data.item
    console.log(JSON.stringify(rowData))
    return (
      <TouchableHighlight
        underlayColor="transparent"
        onPress={() => didSelectSession(rowData)}
      >
        <View style={styles.TopicsRowContainer}>
          <ImageBackground
            style={styles.topicImg}
            imageStyle={{ borderTopRightRadius: 10, borderTopLeftRadius: 10 }}
            source={{
              uri: `https://${
                Constants.DOMAIN
              }/${config.aws_org_id.toLowerCase()}-resources/images/${
                rowData.type === 1 ? 'topic' : 'session'
              }-images/${rowData?.tid}.png`,
              cache: 'reload',
            }}
          ></ImageBackground>
          <View style={{ marginTop: 2, marginHorizontal: 2 }}>
            <Text numberOfLines={2} style={styles.headerStyle1}>{rowData.tname[0].title}</Text>
            <Text style = {{ fontSize: 12, marginTop: 2}}>{rowData?.tname[0]?.date_list !== undefined &&
            rowData?.tname[0]?.date_list !== null &&
            rowData.tname[0].date_list[0].combineStartTime !== undefined
              ? moment(
                  new Date(
                    rowData.tname[0].date_list[0].combineStartTime
                  ).getTime()
                ).format('DD MMM YYYY')
              : rowData?.startdate
              ? moment(parseInt(rowData?.startdate)).format('DD MMM YYYY')
              : 'yet to be scheduled'}</Text>
          </View>
        </View>
      </TouchableHighlight>
    )
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
                Wishlist
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
                renderItem={renderWishlistView}
                keyExtractor={(_item, index) => index.toString()}
                ListEmptyComponent={emptyData}
                //   showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                // horizontal
                numColumns={3}
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
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: topicsWidth,
    height: topicsImgHeight + 15,
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
})
