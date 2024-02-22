import React, {useState, useEffect, useRef} from 'react';
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
  ImageBackground,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import Amplify, {API} from 'aws-amplify';
import DeviceInfo from 'react-native-device-info';
import SInfo from 'react-native-sensitive-info';
import {ProgressBar} from '@react-native-community/progress-bar-android';
import {ProgressView} from '@react-native-community/progress-view';
import SkeletonLoader from '../common/appSkeletonLoader';
import config from '../../aws-exports';
import Constants from '../constants';
import {awsSignIn, authData} from '../redux/auth/authSlice';
import {useSelector, useDispatch} from 'react-redux';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';

const myTopicsWidth = (Constants.app_width - 10) / 2 - 10;
let myTopicsHeight = myTopicsWidth;
let progressViewHeight = 2;
if (myTopicsHeight / 2 < 80) {
  myTopicsHeight += 10;
}
if (myTopicsHeight <= 155) {
  myTopicsHeight += 10;
}
if (Platform.OS === 'android' && DeviceInfo.getApiLevel() <= 22) {
  progressViewHeight = 5;
}
const logoWidth = 25;
const logoHeight = 30;
const toolbarHeight = 50;
const topicsWidth = Constants.app_width / 3.4;
const topicsHeight = 140;
const exploreWidth = (Constants.app_width - 20) / 2 - 10;
const exploreHeight = exploreWidth - 30;
const topicsImgHeight = topicsHeight / 1.2;
const topicsObjHeight = Constants.app_width / 3;
const emptyResultIcon = require('../Assets/Images/nocategory.png');
const profileIcon = require('../Assets/Images/my_profile.png');
const appLogo = require('../Assets/Images/logo.png');
const notificationIcon = require('../Assets/Images/notification_white.png');
const newnotificationIcon = require('../Assets/Images/new_notification.png');
const starIcon = require('../Assets/Images/star.png');
const bookmarkIcon1 = require('../Assets/Images/bookmark1.png');
const bookmarkIcon2 = require('../Assets/Images/bookmark2.png');
const heartFilled = require('../Assets/Images/heart_filled.png');
const heartOutlined = require('../Assets/Images/heart_outlined.png');
const moduleIcon = require('../Assets/Images/modules.png');
const learningPathIcon = require('../Assets/Images/learningpathImage.png');
const liveSession = require('../Assets/Images/liveSession.png');
const LeaderBoard = require('../Assets/Images/Leaderboard.png');
const badgeYellow = require('../Assets/Images/badgeYellow.png');
const badgeBlack = require('../Assets/Images/badgeBlack.png');
const badgeBrown = require('../Assets/Images/badgeBrown.png');
const badgeGreen = require('../Assets/Images/badgeGreen.png');
const BadgeSideIcon = require('../Assets/Images/Badge_icon.png');
const audioIcon = require('../Assets/Images/audioObject.png');
const videoIcon = require('../Assets/Images/videoObject.png');
const interactivityIcon = require('../Assets/Images/reviewObject.png');
const quizIcon = require('../Assets/Images/quizObject.png');
const pdfIcon = require('../Assets/Images/pdfObject.png');
const htmlIcon = require('../Assets/Images/htmlObject.png');
const scormIcon = require('../Assets/Images/scormObject.png');
const clockIcon = require('../Assets/Images/clock_img.png');

export default function MyTopicsScreen(props) {
  const navigation = useNavigation();
  // const { navigation } = props;
  const [loaded, setLoaded] = useState();
  const networkStatusRef = useRef(true);
  const [refreshing, setRefreshing] = useState(false);
  const [spinner, setSpinner] = useState(true);
  const [completedCourse, setCompletedCourse] = useState('');
  const [continueLearning, setContinueLearning] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState('');
  const [myTopics, setMyTopics] = useState('');
  const [allProgramDetails, setAllProgramDetails] = useState('');
  const [topTopics, setTopTopics] = useState('');
  const [liveSessions, setLiveSessions] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkedLoaded, setIsBookmarkedLoaded] = useState(false);
  const [learningPath, setLearningPath] = useState('');
  const [profileData, setProfileData] = useState('');
  const dispatch = useDispatch();
  let userDetails = useSelector(authData);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      handleConnectivityChange(state.isInternetReachable);
    });
    const listners = [navigation.addListener('willFocus', () => checkFocus())];
    fetchAllTopics();
    fetchRecentTopics();
    fetchAllPrograms();
    fetchSessions();
    getLearningPathDetails();
    getUserDetails();
    netStatus();
    StatusBar.setHidden(false);
    MyTopicsScreen.navListener = navigation.addListener(
      'didFocus',
      useIsFocused,
      () => {
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(Constants.app_statusbar_color_MyTopics);
          StatusBar.setTranslucent(true);
        }
      },
    );
    return () => {
      unsubscribe();
      listners.forEach(listner => {
        unsubscribe();
      });
    };
  }, []);

  async function fetchAllTopics() {
    const bodyParam = {
      body: {
        schema: config.aws_schema,
        ur_id: userDetails?.uData?.ur_id,
        tenant: userDetails?.locale,
        groups: userDetails?.uData?.gid,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        Constants.GET_MY_TOPICS,
        bodyParam,
      );
      let sdata = {...userDetails};
      sdata.topics = response;
      dispatch(awsSignIn(sdata));
      const {myTopics, toptopics} = response;
      setSpinner(false);
      if (myTopics) {
        const completedcourse = myTopics?.filter(top => {
          top.ref_type = 1;
          if (
            top.comp_date !== null &&
            (top.pid === undefined || top.pid === null || top.pid === 0)
          )
            return true;

          return false;
        });
        const continuelearning = myTopics?.filter(top => {
          top.ref_type = 1;
          if (top.comp_date === null) return true;
          return false;
        });
        setCompletedCourse(completedcourse);
        setContinueLearning(continuelearning);
        setMyTopics(myTopics);
        setTopTopics(toptopics);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchRecentTopics() {
    const bodyParam = {
      body: {
        schema: config.aws_schema,
        ur_id: userDetails?.uData?.ur_id,
        tenant: userDetails?.locale,
        emailid: userDetails?.emailid,
        groups: userDetails?.uData?.gid,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getRecenetView',
        bodyParam,
      );
      setRecentlyViewed(response.recentview);
      setSpinner(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchSessions() {
    let userdata = {...userDetails};
    const bodyParam = {
      body: {
        tenant: userDetails?.uData?.oid,
        eid: userDetails?.sub,
        ur_id: userDetails?.uData?.ur_id,
        schema: config.aws_schema,
        groups: userDetails?.uData?.gid,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/sessionData',
        bodyParam,
      );
      setLiveSessions(response);
      console.warn(response);
      setSpinner(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function getLearningPathDetails() {
    const bodyParam = {
      body: {
        schema: config.aws_schema,
        tenant: userDetails?.uData?.oid,
        groups: userDetails?.uData?.gid,
      },
      header: {
        'Contant-Type': 'application/json',
      },
    };
    bodyParam.body.tid = undefined;
    bodyParam.body.ur_id = userDetails?.uData?.ur_id;
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getLearningPath',
        bodyParam,
      );
      setLearningPath(response.body);
      return response;
    } catch (err) {
      throw err;
    }
  }

  async function fetchAllPrograms() {
    const bodyParam = {
      body: {
        schema: config.aws_schema,
        oid: config.aws_org_id,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        Constants.GET_CATEGORIES,
        bodyParam,
      );
      setAllProgramDetails(response.topics);
      setSpinner(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function checkFocus() {
    BackHandler.removeEventListener('hardwareBackPress', true);
    await SInfo.setItem('isnotClickable', JSON.stringify(false), {});
    window.isnotClickable = 'false';
    if (networkStatusRef.current) {
      fetchLocalCertDetails();
    } else {
      handleNetworkConnection();
    }
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(Constants.app_statusbar_color_MyTopics);
      StatusBar.setTranslucent(true);
    }
  }

  function netStatus() {
    NetInfo.fetch().then(state => {
      if (state.isConnected === true) {
        setLoaded(false);
        setSpinner(true);
        networkStatusRef.current = true;
      } else {
        setLoaded(false);
        setSpinner(true);
        networkStatusRef.current = false;
      }
    });
  }

  function onRefresh() {
    setRefreshing(true);
    fetchAllTopics().then(() => {
      setRefreshing(false);
    });
    fetchRecentTopics().then(() => {
      setRefreshing(false);
    });
    fetchAllPrograms().then(() => {
      setRefreshing(false);
    });
    fetchSessions().then(() => {
      setRefreshing(false);
    });
    getLearningPathDetails().then(() => {
      setRefreshing(false);
    });
    getUserDetails().then(() => {
      setRefreshing(false);
    });
  }

  function handleNetworkConnection() {
    setLoaded(true);
    setSpinner(false);
  }

  function handleConnectivityChange(isConnected) {
    if (isConnected === false) {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      });
      networkStatusRef.current = false;
      setSpinner(false);
    } else {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      });
      networkStatusRef.current = true;
    }
  }

  function getCourseProgress(data) {
    let Percent = (data.cobj / data.tobj) * 100;
    let res = Math.round(Percent * 100 + Number.EPSILON) / 100;
    let finalRes = res / 100;
    return finalRes;
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
            }}>
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
              transform: [{scaleX: 1.0}, {scaleY: 1.0}],
              height: 2,
              width: '90%',
              marginLeft: 5,
              marginTop: 10,
            }}
            progressTintColor={Constants.app_button_color}
          />
        )}
      </View>
    );
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
  );

  async function addAndRemoveBookmark(rowData, val) {
    try {
      const bodyParam = {
        body: {
          oid: config.aws_org_id,
          tid: rowData.tid,
          type: 'topics',
          eid: userDetails?.sub,
          userfullname: userDetails.name,
          emailid: userDetails?.email,
          tenant: userDetails?.locale,
          ur_id: userDetails?.uData?.ur_id,
          bookmark: val === 1 ? true : false,
          schema: config.aws_schema,
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      };
      if (val === 1) {
        bodyParam.body.bookmark_date = 1;
      }
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/updateTopicReport',
        bodyParam,
      );
      // alert(JSON.stringify(response))
      val === 1 ? setIsBookmarked(true) : setIsBookmarked(false);
      setIsBookmarkedLoaded(false);
      onRefresh();
    } catch (error) {
      // console.error(error)
    }
  }

  async function addAndRemoveBookmarkContent(val, id) {
    const bodyParam = {
      body: {
        objid: val.tid,
        ur_id: userDetails?.uData?.ur_id,
        schema: config.aws_schema,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    if (id === 1) {
      bodyParam.body.bookmark = true;
      bodyParam.body.bookmark_date = 1;
    } else {
      bodyParam.body.bookmark = false;
    }
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/updateContentReport',
        bodyParam,
      );
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  }

  function didSelectTopic(courseDetails) {
    if (courseDetails) {
      navigation.navigate('CourseView', {
        courseId: courseDetails.tid,
        // courseTitle: courseDetails.title,
      });
    }
  }

  function didSelectSession(sessionDetails) {
    if (sessionDetails) {
      navigation.navigate('LiveSession', {
        sessionId: sessionDetails.sid,
        sessionName: sessionDetails.sn,
      });
    }
  }

  function didSelectProgram(programDetails) {
    if (programDetails) {
      navigation.navigate('TopicList', {
        programId: programDetails.id,
        programTitle: programDetails.name,
      });
    }
  }

  const didSelectObject = courseDetails => {
    if (courseDetails) {
      navigation.navigate('ObjectView', {
        objectOType: courseDetails.dtls.otype,
        objectOId: courseDetails.tid,
        objectOName: courseDetails.dtls.title,
      });
    }
  };

  const didSelectLearningPath = learningsession => {
    if (learningsession) {
      navigation.navigate('LearningPath', {
        learningsession: learningsession,
      });
    }
  };

  const renderBgColor = param => {
    if (param === 'video' || param === 'youtube' || param === 'vimeo') {
      return '#E2D2FE';
    } else if (param === 'pdf' || param === 'html') {
      return '#FDE1AB';
    } else if (param?.toLowerCase() === 'interactivity') {
      return '#CCF0BF';
    } else if (param === 'quiz') {
      return '#FFD27E';
    } else if (param === 'scorm') {
      return '#BAE5F4';
    } else if (param === 'audio') {
      return '#EECFCF';
    } else if (param === 'scorm') {
      return '#BAE5F4';
    }
  };

  const renderIcon = param => {
    if (param === 'video' || param === 'youtube' || param === 'vimeo') {
      return <Image source={videoIcon} style={{height: 25, width: 25}} />;
    } else if (param === 'pdf') {
      return <Image source={pdfIcon} style={{height: 25, width: 25}} />;
    } else if (param === 'Interactivity') {
      return (
        <Image source={interactivityIcon} style={{height: 25, width: 25}} />
      );
    } else if (param === 'audio') {
      return <Image source={audioIcon} style={{height: 25, width: 25}} />;
    } else if (param === 'quiz') {
      return <Image source={quizIcon} style={{height: 25, width: 25}} />;
    } else if (param === 'scorm') {
      return <Image source={scormIcon} style={{height: 25, width: 25}} />;
    } else if (param === 'html') {
      return <Image source={htmlIcon} style={{height: 25, width: 25}} />;
    }
  };

  function renderRecentlyViewed(data) {
    const rowData = data.item;
    // console.log(JSON.stringify(rowData.ravg))
    if (rowData.type === 'object') {
      // alert(JSON.stringify(rowData.otype))
      return (
        <TouchableHighlight
          underlayColor={renderBgColor(rowData.otype)}
          onPress={() => didSelectObject(rowData)}
          style={[
            styles.TopicsRowContainerObject,
            {backgroundColor: renderBgColor(rowData.otype)},
          ]}>
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: '2%',
                marginTop: '2%',
              }}>
              <View style={{marginLeft: 5, marginTop: 3}}>
                {renderIcon(rowData.otype)}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  borderRadius: 5,
                  width: 50,
                  height: 22,
                  backgroundColor: 'white',
                }}>
                <Image source={starIcon} style={{height: 20, width: 20}} />
                <Text style={{marginTop: 2, marginHorizontal: 5}}>
                  {rowData?.ravg ? rowData?.ravg?.toFixed(1) : '0.0'}
                </Text>
              </View>
            </View>
            <Text
              numberOfLines={2}
              style={[styles.topicTitleObject, styles.appFontFamily]}>
              {rowData.title}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: '2%',
                marginTop: '2%',
              }}>
              <View
                style={{
                  alignItems: 'flex-end',
                  flexDirection: 'row',
                  marginLeft: 5,
                }}>
                <Image
                  source={clockIcon}
                  style={{height: 12, width: 12, marginBottom: 4}}
                />
                <Text
                  style={{
                    marginLeft: 2,
                    fontSize: 12,
                    marginBottom: 2,
                  }}>
                  {Math.floor(rowData.dur / 60)}m{' '}
                  {rowData.dur - Math.floor(rowData.dur / 60) * 60}s
                </Text>
              </View>
              {rowData.bk && (
                <TouchableOpacity
                  onPress={() => addAndRemoveBookmarkContent(rowData, 0)}>
                  <View style={{alignItems: 'flex-end'}}>
                    <Image
                      source={bookmarkIcon2}
                      style={{height: 22, width: 22}}
                    />
                  </View>
                </TouchableOpacity>
              )}
              {!rowData.bk && (
                <TouchableOpacity
                  onPress={() => addAndRemoveBookmarkContent(rowData, 1)}>
                  <View style={{alignItems: 'flex-end'}}>
                    <Image
                      source={bookmarkIcon1}
                      style={{height: 22, width: 22}}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableHighlight>
      );
    } else if (rowData.type === 'topic') {
      return (
        <TouchableHighlight
          underlayColor="transparent"
          onPress={() => didSelectTopic(rowData)}>
          <View style={styles.TopicsRowContainer}>
            <ImageBackground
              style={styles.topicImg}
              imageStyle={{borderTopRightRadius: 10, borderTopLeftRadius: 10}}
              source={{
                uri: `https://${
                  Constants.DOMAIN
                }/${config.aws_org_id.toLowerCase()}-resources/images/topic-images/${
                  rowData.tid
                }.png`,
                cache: 'reload',
              }}>
              <View style={{}}>
                {rowData.bk && (
                  <TouchableOpacity
                    onPress={() => addAndRemoveBookmark(rowData, 0)}>
                    <View style={{alignItems: 'flex-end'}}>
                      <Image
                        source={bookmarkIcon2}
                        style={{height: 22, width: 22}}
                      />
                    </View>
                  </TouchableOpacity>
                )}
                {!rowData.bk && (
                  <TouchableOpacity
                    onPress={() => addAndRemoveBookmark(rowData, 1)}>
                    <View style={{alignItems: 'flex-end'}}>
                      <Image
                        source={bookmarkIcon1}
                        style={{height: 22, width: 22}}
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  flexDirection: 'row',
                  marginTop: topicsImgHeight / 3.8,
                  // top: 55,
                  left: 5,
                  borderRadius: 5,
                  height: 20,
                  width: 50,
                }}>
                <Image source={starIcon} style={{height: 20, width: 20}} />
                <Text style={{marginTop: 2, marginHorizontal: 5}}>
                  {rowData?.ravg ? rowData.ravg.toFixed(1) : '0.0'}
                </Text>
              </View>
            </ImageBackground>
            {renderProgressBar(rowData)}
            <Text
              numberOfLines={2}
              style={[styles.topicTitle, styles.appFontFamily]}>
              {rowData.title}
            </Text>
            <View style={{flexDirection: 'row', marginHorizontal: 5}}>
              <Image
                source={moduleIcon}
                style={{height: 15, width: 15, marginTop: 2}}
              />
              <Text
                style={{
                  fontSize: 10,
                  marginTop: 3.5,
                  color: Constants.app_text_color,
                }}>
                {rowData.noofnuggets} Modules
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      );
    } else {
      return null;
    }
  }

  function renderCoursesView(data) {
    const rowData = data.item;
    return (
      <TouchableHighlight
        underlayColor="transparent"
        onPress={() => didSelectTopic(rowData)}>
        <View style={styles.TopicsRowContainer}>
          <ImageBackground
            style={styles.topicImg}
            imageStyle={{borderTopRightRadius: 10, borderTopLeftRadius: 10}}
            source={{
              uri: `https://${
                Constants.DOMAIN
              }/${config.aws_org_id.toLowerCase()}-resources/images/topic-images/${
                rowData.tid
              }.png`,
              cache: 'reload',
            }}>
            <View>
              {rowData.bk && (
                <TouchableOpacity
                  onPress={() => addAndRemoveBookmark(rowData, 0)}>
                  <View style={{alignItems: 'flex-end'}}>
                    <Image
                      source={bookmarkIcon2}
                      style={{height: 22, width: 22}}
                    />
                  </View>
                </TouchableOpacity>
              )}
              {!rowData.bk && (
                <TouchableOpacity
                  onPress={() => addAndRemoveBookmark(rowData, 1)}>
                  <View style={{alignItems: 'flex-end'}}>
                    <Image
                      source={bookmarkIcon1}
                      style={{height: 22, width: 22}}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                flexDirection: 'row',
                marginTop: topicsImgHeight / 3.8,
                // top: 55,
                left: 5,
                borderRadius: 5,
                height: 20,
                width: 50,
              }}>
              <Image source={starIcon} style={{height: 20, width: 20}} />
              <Text style={{marginTop: 2, marginHorizontal: 5}}>
                {rowData?.ravg ? rowData.ravg.toFixed(1) : '0.0'}
              </Text>
            </View>
          </ImageBackground>
          {renderProgressBar(rowData)}
          <Text
            numberOfLines={2}
            style={[styles.topicTitle, styles.appFontFamily]}>
            {rowData.title}
          </Text>
          <View style={{flexDirection: 'row', marginHorizontal: 5}}>
            <Image
              source={moduleIcon}
              style={{height: 15, width: 15, marginTop: 2}}
            />
            <Text
              style={{
                fontSize: 10,
                marginTop: 3.5,
                color: Constants.app_text_color,
              }}>
              {rowData.noofnuggets} Modules
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  function renderSessionsView(data) {
    const rowData = data.item;
    // console.log(JSON.stringify(rowData))
    return (
      <TouchableHighlight
        underlayColor="transparent"
        onPress={() => didSelectSession(rowData)}>
        <View style={styles.TopicsRowContainerSession}>
          <ImageBackground
            style={styles.topicImg}
            imageStyle={{borderTopRightRadius: 10, borderTopLeftRadius: 10}}
            source={liveSession}></ImageBackground>
          {/* {renderProgressBar(rowData)} */}
          <Text
            numberOfLines={2}
            style={[styles.topicTitle, styles.appFontFamily]}>
            {rowData.sn}
          </Text>
          <View
            style={{
              marginHorizontal: 5,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <View style={{marginTop: 3}}>
              {rowData.date_list ? (
                rowData.date_list[0]?.date === '' ? (
                  <Text style={{color: 'black', fontSize: 10}}>
                    Not scheduled
                  </Text>
                ) : (
                  <Text style={{color: 'black', fontSize: 12}}>
                    {moment(
                      new Date(rowData.date_list[0].combineStartTime).getTime(),
                    ).format('DD MMM YYYY')}
                  </Text>
                )
              ) : <Text>{rowData.startdate}</Text> ? (
                <Text>
                  {' '}
                  {moment(parseInt(rowData.startdate)).format(
                    'DD MMM YYYY',
                  )}{' '}
                </Text>
              ) : (
                <Text>Not scheduled</Text>
              )}
            </View>
            <View>
              {/* {rowData.EI === true ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <Image
                    source={heartFilled}
                    style={{ height: 20, width: 20 }}
                  />
                </View>
              ) : (
                <View style={{ alignItems: 'flex-end' }}>
                  <Image
                    source={heartOutlined}
                    style={{ height: 20, width: 20 }}
                  />
                </View>
              )} */}
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  function renderProgramView(data) {
    const rowData = data.item;
    // console.log("rowData " + JSON.stringify(rowData))
    return (
      <TouchableHighlight
        underlayColor="transparent"
        onPress={() => didSelectProgram(rowData)}>
        <View style={styles.topTopicsRowContainer}>
          <ImageBackground
            style={styles.programtopicImg}
            imageStyle={{
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              opacity: 0.4,
            }}
            source={{
              uri: `https://${
                Constants.DOMAIN
              }/${config.aws_org_id.toLowerCase()}-resources/images/category-images/${
                rowData.ct_img
              }`,
            }}>
            <Text
              numberOfLines={2}
              style={[styles.topicTitle2, styles.appFontFamily]}>
              {rowData.name}
            </Text>
          </ImageBackground>
        </View>
      </TouchableHighlight>
    );
  }

  function renderLearningPathView(data) {
    const rowData = data.item;
    // console.log(JSON.stringify(rowData))
    return (
      <TouchableHighlight
        underlayColor="transparent"
        onPress={() => didSelectLearningPath(rowData)}
        style={styles.learningpathContainer}>
        <View>
          <ImageBackground
            style={styles.learningPathImg}
            source={learningPathIcon}>
            <View
              style={{
                backgroundColor: 'white',
                flexDirection: 'row',
                borderRadius: 5,
                width: 50,
                alignSelf: 'flex-end',
                marginTop: 10,
                marginRight: 10,
                height: 25,
                ...Platform.select({
                  ios: {
                    shadowColor: 'rgba(0,0,0, .2)',
                    shadowOffset: {height: 1, width: 0},
                    shadowOpacity: 1,
                    shadowRadius: 1,
                  },
                  android: {
                    // shadowOpacity: 1,
                    // elevation: 2,
                  },
                }),
              }}>
              <Image
                source={starIcon}
                style={{height: 20, width: 20, marginLeft: 1, marginTop: 2}}
              />
              <Text style={{marginTop: 4, marginHorizontal: 5}}>
                {rowData?.ravg ? rowData.ravg.toFixed(1) : '0.0'}
              </Text>
            </View>
            <Text
              numberOfLines={2}
              style={[styles.topicTitle3, styles.appFontFamily]}>
              {rowData.lname}
            </Text>
          </ImageBackground>
          <View
            style={{
              height: '25%',
              backgroundColor: '#a7dcfa',
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}>
            <View style={{flexDirection: 'row'}}>
              <View
                style={{
                  height: 30,
                  width: 30,
                  borderRadius: 30,
                  backgroundColor: '#eaca1f',
                  marginTop: 3,
                  marginLeft: 5,
                }}>
                <Text style={{textAlign: 'center', marginTop: 7}}>
                  {rowData.points}
                </Text>
              </View>
              <Text style={{marginTop: 8}}> points</Text>
            </View>
            <View style={{marginTop: 5, marginRight: 5}}>
              {rowData.bookmark && (
                <TouchableOpacity
                  onPress={() => addAndRemoveBookmarkContent(rowData, 0)}>
                  <View style={{alignItems: 'flex-end'}}>
                    <Image
                      source={bookmarkIcon2}
                      style={{height: 25, width: 25}}
                    />
                  </View>
                </TouchableOpacity>
              )}
              {!rowData.bookmark && (
                <TouchableOpacity
                  onPress={() => addAndRemoveBookmarkContent(rowData, 1)}>
                  <View style={{alignItems: 'flex-end'}}>
                    <Image
                      source={bookmarkIcon1}
                      style={{height: 25, width: 25}}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  function showNotification() {
    navigation.navigate('Notification');
  }

  const isFocused = useIsFocused();

  const getUserDetails = async () => {
    // alert(JSON.stringify(userDetails.name))
    const bodyParam = {
      body: {
        emailid: userDetails.email,
        uid: userDetails.uData.uid,
        schema: config.aws_schema,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    // alert(JSON.stringify(bodyParam.body))
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getUserDetails',
        bodyParam,
      );
      // alert(JSON.stringify(response))
      // alert(JSON.stringify(body[0].name))
      setProfileData(response.body[0]);
      return body && body[0];
    } catch (err) {
      throw err;
    }
  };

  function displayBadge() {
    if (profileData.badge === 'Yellow') {
      return <Image source={badgeYellow} style={styles.badgeStyle} />;
    } else if (profileData.badge === 'Black') {
      return <Image source={badgeBlack} style={styles.badgeStyle} />;
    } else if (profileData.badge === 'Brown') {
      return <Image source={badgeBrown} style={styles.badgeStyle} />;
    } else if (profileData.badge === 'Green') {
      return <Image source={badgeGreen} style={styles.badgeStyle} />;
    } else {
      return <Image source={badgeGreen} style={styles.badgeStyle} />;
    }
  }

  function displayText() {
    if (profileData.badge === 'Yellow') {
      return <Text style={{fontSize: 12, fontWeight: '700'}}>Yellow Belt</Text>;
    } else if (profileData.badge === 'Black') {
      return <Text style={{fontSize: 12, fontWeight: '700'}}>Black Belt</Text>;
    } else if (profileData.badge === 'Brown') {
      return <Text style={{fontSize: 12, fontWeight: '700'}}>Brown Belt</Text>;
    } else if (profileData.badge === 'Green') {
      return <Text style={{fontSize: 12, fontWeight: '700'}}>Green Belt</Text>;
    } else {
      return <Text style={{fontSize: 12, fontWeight: '700'}}>No Belt</Text>;
    }
  }

  return (
    <View
      style={styles.container}
      pointerEvents={!networkStatusRef.current ? 'none' : 'auto'}>
      <View style={styles.statusBar}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Constants.app_statusbar_color}
          translucent
        />
      </View>
      {isFocused && (
        <StatusBar
          hidden={false}
          backgroundColor={Constants.app_statusbar_color_MyTopics}
          barStyle="dark-content"
        />
      )}
      <View style={styles.MYTopicHeaderBackground}>
        <View>
          <LinearGradient
            colors={['#ADD8E6', '#BF40BF']}
            style={styles.linearGradient}>
            {displayBadge()}
            <View style={styles.badgeInnerStyle}>
              <Image source={BadgeSideIcon} style={styles.badgeSideIconStyle} />
            </View>
          </LinearGradient>
        </View>
        <Image source={appLogo} style={styles.appLogo} />
        <TouchableOpacity
          onPress={showNotification}
          style={styles.notifyHolder}>
          <Image source={notificationIcon} style={styles.notifyImage} />
        </TouchableOpacity>
      </View>
      <View style={styles.MYTopicSubHeaderBackground}>{displayText()}</View>
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
        }>
        <View style={styles.spinnerView}>
          {!networkStatusRef.current && (
            <Text style={[styles.noNetwork, styles.appFontFamily]}>
              No internet connectivity
            </Text>
          )}
        </View>
        <View style={!spinner}>
          {!spinner ? (
            <View style={styles.leaderBoardBackground}>
              <View style={styles.leaderBoard}>
                <View style={styles.leaderBoardInnerStyle}>
                  <View style={styles.leaderBoardIconBackground}>
                    <Image
                      source={LeaderBoard}
                      style={styles.leaderBoardIcon}
                    />
                  </View>
                  <Text style={styles.leaderBoardText}>LeaderBoard</Text>
                </View>
                <View style={styles.headerProfileStyle}>
                  <View style={styles.headerInnerProfileStyle}>
                    <Text style={styles.headerTextProfileStyle}>
                      Profile Name
                    </Text>
                  </View>
                  <View style={styles.headerProfileName}>
                    <Text numberOfLines={2} style={styles.headerProfileText}>
                      {profileData?.name}
                    </Text>
                  </View>
                </View>
                <View style={styles.headerProfileStyle}>
                  <View style={styles.headerInnerProfileStyle}>
                    <Text style={styles.headerTextEmployeeScore}>
                      Employee ID
                    </Text>
                  </View>
                  <View style={styles.headerProfileName}>
                    <Text
                      numberOfLines={2}
                      style={styles.headerEmployeeScoreText}>
                      {profileData?.uid}
                    </Text>
                  </View>
                </View>
                <View style={styles.headerScoreRankStyle}>
                  <View style={styles.headerInnerProfileStyle}>
                    <Text style={styles.headerTextEmployeeScore}>Score</Text>
                  </View>
                  <View style={styles.headerProfileName}>
                    <Text
                      numberOfLines={2}
                      style={styles.headerEmployeeScoreText}>
                      {profileData?.total_points}
                    </Text>
                  </View>
                </View>
                <View style={styles.headerScoreRankStyle}>
                  <View style={styles.headerInnerRankStyle}>
                    <Text style={styles.headerTextRank}>Rank</Text>
                  </View>
                  <View style={styles.headerProfileName}>
                    <Text numberOfLines={2} style={styles.headerRankLowerText}>
                      #{profileData?.rank}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <SkeletonLoader loader="topicsDashboard" />
          )}
        </View>
        <View style={!spinner}>
          {!spinner ? (
            <View>
              {liveSessions?.popularSession?.length != 0 ? (
                <View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      marginTop: 20,
                    }}>
                    <View style={[styles.sectionHeader, styles.rowView]}>
                      <Text style={[styles.headerText1, styles.appFontFamily]}>
                        Popular Sessions
                      </Text>
                    </View>
                  </View>
                  <FlatList
                    style={styles.courseListview}
                    data={liveSessions?.popularSession}
                    renderItem={renderSessionsView}
                    keyExtractor={(item, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={emptyData}
                    horizontal
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <SkeletonLoader loader="topicsDashboard" />
          )}
        </View>
        <View style={!spinner}>
          {!spinner ? (
            <View>
              {liveSessions?.upcoming?.length != 0 ? (
                <View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      marginTop: 20,
                    }}>
                    <View style={[styles.sectionHeader, styles.rowView]}>
                      <Text style={[styles.headerText1, styles.appFontFamily]}>
                        Upcoming Sessions
                      </Text>
                    </View>
                  </View>
                  <FlatList
                    style={styles.courseListview}
                    data={liveSessions?.upcoming}
                    renderItem={renderSessionsView}
                    keyExtractor={(item, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={emptyData}
                    horizontal
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <SkeletonLoader loader="topicsDashboard" />
          )}
        </View>
        <View style={!spinner}>
          {!spinner ? (
            <View>
              {liveSessions?.ongoingSession?.length != 0 ? (
                <View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      marginTop: 20,
                    }}>
                    <View style={[styles.sectionHeader, styles.rowView]}>
                      <Text style={[styles.headerText1, styles.appFontFamily]}>
                        Ongoing Sessions
                      </Text>
                    </View>
                  </View>
                  <FlatList
                    style={styles.courseListview}
                    data={liveSessions?.ongoingSession}
                    renderItem={renderSessionsView}
                    keyExtractor={(item, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={emptyData}
                    horizontal
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <SkeletonLoader loader="topicsDashboard" />
          )}
        </View>
        <View style={!spinner}>
          {!spinner ? (
            <View>
              {liveSessions?.completedsession?.length != 0 ? (
                <View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      marginTop: 20,
                    }}>
                    <View style={[styles.sectionHeader, styles.rowView]}>
                      <Text style={[styles.headerText1, styles.appFontFamily]}>
                        Completed Sessions
                      </Text>
                    </View>
                  </View>
                  <FlatList
                    style={styles.courseListview}
                    data={liveSessions?.completedsession}
                    renderItem={renderSessionsView}
                    keyExtractor={(item, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={emptyData}
                    horizontal
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <SkeletonLoader loader="topicsDashboard" />
          )}
        </View>
        <View style={!spinner}>
          {!spinner ? (
            <View>
              {learningPath?.length != 0 ? (
                <View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      marginTop: 20,
                    }}>
                    <View style={[styles.sectionHeader, styles.rowView]}>
                      <Text style={[styles.headerText1, styles.appFontFamily]}>
                        Learning Path
                      </Text>
                    </View>
                  </View>
                  <FlatList
                    style={styles.courseListview}
                    data={learningPath}
                    renderItem={renderLearningPathView}
                    keyExtractor={(item, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={emptyData}
                    horizontal
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <SkeletonLoader loader="topicsDashboard" />
          )}
        </View>
        <View style={!spinner}>
          {!spinner ? (
            <View>
              {continueLearning.length != 0 ? (
                <View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      marginTop: 20,
                    }}>
                    <View style={[styles.sectionHeader, styles.rowView]}>
                      <Text style={[styles.headerText1, styles.appFontFamily]}>
                        Continue Learning
                      </Text>
                    </View>
                  </View>
                  <FlatList
                    style={styles.courseListview}
                    data={continueLearning}
                    renderItem={renderCoursesView}
                    keyExtractor={(item, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={emptyData}
                    horizontal
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <SkeletonLoader loader="topicsDashboard" />
          )}
        </View>
        <View style={!spinner}>
          {!spinner ? (
            <View>
              {recentlyViewed != undefined && recentlyViewed.length != 0 ? (
                <View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      marginTop: 10,
                    }}>
                    <View style={[styles.sectionHeader, styles.rowView]}>
                      <Text style={[styles.headerText1, styles.appFontFamily]}>
                        Recently Viewed
                      </Text>
                    </View>
                  </View>
                  <FlatList
                    style={styles.courseListview}
                    data={recentlyViewed}
                    renderItem={renderRecentlyViewed}
                    keyExtractor={(item, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={emptyData}
                    horizontal
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <SkeletonLoader loader="topicsDashboard" />
          )}
        </View>
        <View style={!spinner}>
          {!spinner ? (
            <View>
              {completedCourse.length != 0 ? (
                <View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      marginTop: 10,
                    }}>
                    <View style={[styles.sectionHeader, styles.rowView]}>
                      <Text style={[styles.headerText1, styles.appFontFamily]}>
                        Completed Courses
                      </Text>
                    </View>
                  </View>
                  <FlatList
                    style={styles.courseListview}
                    data={completedCourse}
                    renderItem={renderCoursesView}
                    keyExtractor={(item, index) => index.toString()}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={emptyData}
                    horizontal
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <SkeletonLoader loader="topicsDashboard" />
          )}
        </View>
        <View style={!spinner}>
          {!spinner ? (
            <View>
              {allProgramDetails.length != 0 ? (
                <View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      marginTop: 20,
                    }}>
                    <View style={[styles.sectionHeader, styles.rowView]}>
                      <Text style={[styles.headerText1, styles.appFontFamily]}>
                        All Topics
                      </Text>
                    </View>
                  </View>
                  <FlatList
                    style={styles.programDetailsView}
                    data={allProgramDetails}
                    renderItem={renderProgramView}
                    keyExtractor={(_item, index) => index.toString()}
                    ListEmptyComponent={emptyData}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    horizontal
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <SkeletonLoader loader="topicsDashboard" />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeStyle: {top: 1.5, left: 1.5, height: 38, width: 38},
  badgeSideIconStyle: {left: 4, height: 12, width: 12},
  badgeInnerStyle: {
    left: 28,
    bottom: 13,
    height: 20,
    width: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  MYTopicHeaderBackground: {
    height: '14%',
    paddingTop: 50,
    paddingLeft: 20,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Constants.app_statusbar_color_MyTopics,
    justifyContent: 'space-between',
  },
  MYTopicSubHeaderBackground: {
    paddingTop: 5,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Constants.app_statusbar_color_MyTopics,
    justifyContent: 'space-between',
  },
  leaderBoardIcon: {
    height: 40,
    width: 30,
  },
  leaderBoardText: {
    paddingVertical: 5,
    fontSize: 8,
    textAlign: 'center',
  },
  leaderBoardIconBackground: {
    // height: '50%',
    alignSelf: 'center',
    marginTop: 10,
  },
  headerProfileStyle: {
    flexDirection: 'column',
    width: '25%',
  },
  headerScoreRankStyle: {
    flexDirection: 'column',
    width: '15%',
  },
  headerInnerProfileStyle: {
    // top: -10,
    height: '40%',
    justifyContent: 'center',
    backgroundColor: '#ffead5',
  },
  headerInnerRankStyle: {
    // top: -10,
    height: '40%',
    borderTopRightRadius: 5,
    justifyContent: 'center',
    backgroundColor: '#ffead5',
  },
  headerTextProfileStyle: {
    // textAlign: 'center',
    left: 10,
    fontSize: 12,
  },
  headerTextEmployeeScore: {
    // textAlign: 'center',
    left: 15,
    fontSize: 12,
  },
  headerTextRank: {
    // textAlign: 'center',
    paddingLeft: 10,
    left: 10,
    fontSize: 12,
  },
  headerProfileName: {
    justifyContent: 'center',
    height: '60%',
  },
  headerProfileText: {
    // textAlign: 'center',
    // right: 5,
    left: 10,
    fontSize: 12,
    color: '#000000',
    fontWeight: '400',
  },
  headerEmployeeScoreText: {
    // textAlign: 'center',
    left: 15,
    fontSize: 12,
    color: '#000000',
    fontWeight: '400',
  },
  headerRankLowerText: {
    // textAlign: 'center',
    // left: 10,
    // paddingLeft: 10,
    // paddingRight: 5,
    fontSize: 12,
    color: '#000000',
    fontWeight: 'bold',
  },
  leaderBoardInnerStyle: {
    borderRightWidth: 0.2,
    borderColor: 'grey',
    width: '16%',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  leaderBoardBackground: {
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#ffbe6d',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  leaderBoard: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  linearGradient: {
    height: 40,
    width: 40,
    borderRadius: 50,
  },
  statusBar: {
    ...Platform.select({
      android: {
        // height: StatusBar.currentHeight - 5,
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
  appLogo: {
    height: 30,
    width: 50,
    ...Platform.select({
      ios: {},
      android: {
        marginTop: 10,
      },
    }),
  },
  notifyImage: {
    height: 30,
    width: 30,
  },
  notifyHolder: {
    ...Platform.select({
      ios: {},
      android: {
        marginTop: 12,
      },
    }),
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
  quickReadsTopTopicsRowContainer: {
    width: topicsHeight + 20,
    height: topicsWidth - 20,
    marginLeft: 15,
    borderRadius: 10,
    // marginBottom: 10,
    // borderWidth: 0.1,
    backgroundColor: '#ffdbac',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: {height: 1, width: 0},
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        shadowOpacity: 1,
        elevation: 2,
      },
    }),
  },
  learningpathContainer: {
    width: topicsHeight + 40,
    height: topicsWidth + 40,
    marginLeft: 15,
    borderRadius: 10,
    marginBottom: 10,
    // borderWidth: 0.1,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: {height: 1, width: 0},
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        shadowOpacity: 1,
        elevation: 2,
      },
    }),
  },
  learningPathImg: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
    ...Platform.select({
      ios: {
        overflow: 'hidden',
        height: topicsHeight - 30,
      },
      android: {
        height: topicsHeight - 20,
      },
    }),
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
        shadowOffset: {height: 1, width: 0},
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
        shadowOffset: {height: 1, width: 0},
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        shadowOpacity: 1,
        elevation: 2,
      },
    }),
  },
  TopicsRowContainerSession: {
    width: topicsWidth * 1.4,
    height: topicsHeight * 0.9,
    marginLeft: 15,
    borderRadius: 10,
    marginBottom: 10,
    // borderWidth: 0.1,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: {height: 1, width: 0},
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
    // opacity: 0.7,
  },
  topicTitle: {
    marginHorizontal: 8,
    // textAlign: 'center',
    ...Platform.select({
      ios: {
        fontSize: 12,
        marginTop: 5,
      },
      android: {
        fontSize: 11,
        marginTop: 3,
      },
    }),
    color: Constants.app_text_color,
    fontWeight: 'bold',
  },
  topicTitle2: {
    width: topicsHeight + 35,
    height: topicsWidth,
    ...Platform.select({
      ios: {
        fontSize: 14,
      },
      android: {
        fontSize: 13,
      },
    }),
    color: 'white',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: topicsWidth / 2.2,
  },
  topicTitle3: {
    ...Platform.select({
      ios: {
        fontSize: 16,
      },
      android: {
        fontSize: 13,
      },
    }),
    fontWeight: '700',
    width: '60%',
    marginLeft: 10,
  },
  progressView: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 15,
    borderRadius: 20,
    overflow: 'hidden',
    color: Constants.app_button_color,
  },
  andoidProgressView: {
    height: progressViewHeight,
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
    marginLeft:
      Platform.OS === 'ios'
        ? Constants.app_width / 2.8 - 37.5
        : Constants.app_width / 2 - 80,
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
  programDetailsView: {
    // flex: 1,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        padding: 10,
        marginTop: 5,
      },
      android: {
        marginLeft: 10,
        marginRight: 20,
        marginTop: 5,
      },
    }),
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
        shadowOffset: {height: 1, width: 0},
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
    height: 40,
    marginTop: 15,
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
});
