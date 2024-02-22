/* eslint-disable no-alert */
/* eslint-disable consistent-return */
import React, {useEffect, useState, useRef} from 'react';
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
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import LinearGradient from 'react-native-linear-gradient';
import Amplify, {Cache, API, Auth} from 'aws-amplify';
import config from '../../aws-exports';
import SInfo from 'react-native-sensitive-info';
import Toolbar from '../Profile/Toolbar';
import Constants from '../constants';
import SkeletonLoader from '../common/appSkeletonLoader';
import {awsSignIn, authData} from '../redux/auth/authSlice';
import {useSelector, useDispatch} from 'react-redux';
import ProgressCircle from 'react-native-progress-circle';
import {ScrollView} from 'react-native-gesture-handler';

// const appLogo = require('../Assets/Images/pearson_logo.png');
const appLogo = require('../Assets/Images/logo.png');
const notificationIcon = require('../Assets/Images/notification_white.png');
// const profileIcon = require('../Assets/Images/myTopicsIcons/my_profile.png');
const searchIcon = require('../Assets/Images/search.png');
const closeIcon = require('../Assets/Images/close_white.png');
const emptyResultIcon = require('../Assets/Images/nocategory.png');
const newnotificationIcon = require('../Assets/Images/new_notification.png');
const profileIcon = require('../Assets/Images/my_profile.png');

const exploreWidth = (Constants.app_width - 20) / 2 - 10;
const exploreHeight = exploreWidth - 30;
const myTopicsWidth = (Constants.app_width - 10) / 2 - 10;
const topicsWidth = Constants.app_width / 3.8;
const topicsHeight = 140;
const topicsImgHeight = topicsHeight / 1.2;
let myTopicsHeight = myTopicsWidth;
let toolbarHeight;

if (myTopicsHeight / 2 < 80) {
  myTopicsHeight += 10;
}
if (myTopicsHeight <= 155) {
  myTopicsHeight += 10;
}
if (Platform.OS === 'android') {
  toolbarHeight = 50;
} else {
  toolbarHeight = 45;
}

export default function MyProgressScreen(props) {
  const {onDismissLoadingCallback, route, nuggetId, nuggetTitle, courseId} =
    props;
  const [spinner, setSpinner] = useState(true);
  const [loaded, setLoaded] = useState(true);
  const [inputText, setInputText] = useState('');
  const [progressDetails, setProgressDetails] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newNotify, setNewNoify] = useState(false);
  const [allProgramDetails, setAllProgramDetails] = useState('');
  const [totalProgress, setTotalProgress] = useState(0);
  const [tpProgress, setTpProgress] = useState('');
  const [progress, setProgress] = React.useState(0);
  const progressRef = useRef(0);
  const [remaining, setRemaining] = useState({});

  const dispatch = useDispatch();
  let userDetails = useSelector(authData);

  useEffect(() => {
    getCourse();
    const unsubscribe = NetInfo.addEventListener(state => {
      handleConnectivityChange(state.isInternetReachable);
    });
    return () => {
      // NetInfo.removeEventListener('connectionChange', handleConnectivityChange);
      unsubscribe();
      //   ExploreScreen.navListener.remove();
    };
  }, []);

  function handleConnectivityChange(isConnected) {
    if (isConnected === false) {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      });
      setConnectionStatus(false);
      // setLoaded(false);
    } else {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      });
      setConnectionStatus(true);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    getCourse().then(() => {
      setRefreshing(false);
    });
  }

  async function getCourse() {
    setLoaded(true);
    const bodyParam = {
      body: {
        oid: config.aws_org_id,
        eid: userDetails.username,
        tenant: userDetails.locale,
        id: userDetails.id,
        iid: config.aws_cognito_identity_pool_id,
        topicid: courseId,
        urid: userDetails?.uData?.ur_id,
        schema: config.aws_schema,
        groups: userDetails?.uData?.gid,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    console.log('HJFGJHVFBJKDSHJK ' + JSON.stringify(bodyParam.body));
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        "/getTopicDetails",
        bodyParam,
      );
      console.log('blahhhh ' + JSON.stringify(response));
      setProgressDetails(response);
      if (response.userdataset.userdata == true) {
        setTotalProgress(
          response.userdataset.cobj === undefined
            ? 0
            : response.userdataset.cobj,
        );
      }
      setRemaining({
        mremaining: response.mremaining,
        tremaining: response.tremaining,
      });
      if (response.userdataset.userdata == true) {
        if (
          response.userdataset.tp !== undefined &&
          (response.userdataset.tp.charAt(0) == 2 ||
            response.userdataset.tp.charAt(0) == 3)
        ) {
          setProgress(100);
          progressRef.current = 100;
        } else {
          let cobj = totalProgress === undefined ? 0 : totalProgress;
          setProgress((cobj / response.tobj) * 100);
          progressRef.current = (cobj / response.tobj) * 100;
        }
      }
      setLoaded(false);
    } catch (error) {
      console.error('getCourseUserError ' + error);
    }
  }

  function renderProgressView() {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            tintColor={Constants.app_button_color}
            colors={[Constants.app_button_color, Constants.app_button_color]}
            progressViewOffset={35}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }>
        <View style={{marginTop: 20}}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 18,
              color: Constants.app_text_color,
            }}>
            Your Progress
          </Text>
          <View style={{alignSelf: 'center', marginTop: 30, marginBottom: 30}}>
            <ProgressCircle
              percent={progressRef.current}
              radius={70}
              borderWidth={7}
              color={Constants.app_blue_color}
              shadowColor="#999"
              bgColor={Constants.app_background_color}>
              <Text
                style={[
                  {fontSize: 27, textAlign: 'center'},
                  styles.appFontFamily,
                ]}>{`${Math.round(progressRef.current)}%`}</Text>
            </ProgressCircle>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: '50%',
            marginHorizontal: '25%',
            justifyContent: 'space-between',
          }}>
          <Text style={{fontSize: 18, color: Constants.app_text_color}}>
            Modules remaining
          </Text>
          <Text style={{fontSize: 18, color: Constants.app_text_color}}>
            {' '}
            {remaining.mremaining}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: '50%',
            marginHorizontal: '22%',
            justifyContent: 'space-between',
            marginTop: '10%',
          }}>
          <Text style={{fontSize: 18, color: Constants.app_text_color}}>
            Time remaining
          </Text>
          <View style={{flexDirection: 'row'}}>
            <Text style={{fontSize: 18, color: Constants.app_text_color}}>
              {' '}
              {Math.floor(remaining.tremaining / 3600)}
            </Text>
            <Text style={{fontSize: 18, color: Constants.app_text_color}}>
              h{' '}
            </Text>
            <Text style={{fontSize: 18, color: Constants.app_text_color}}>
              {Math.floor((remaining.tremaining % 3600) / 60)}
            </Text>
            <Text style={{fontSize: 18, color: Constants.app_text_color}}>
              m{' '}
            </Text>
            <Text style={{fontSize: 18, color: Constants.app_text_color}}>
              {Math.floor((remaining.tremaining % 3600) % 60)}
            </Text>
            <Text style={{fontSize: 18, color: Constants.app_text_color}}>
              {' '}
              s
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View
      style={styles.container}
      pointerEvents={!connectionStatus ? 'none' : 'auto'}>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={[
          Constants.app_background_dark_color,
          Constants.app_background_light_color,
        ]}
        style={styles.screenstyle}>
        <View style={styles.noInternet}>
          {!connectionStatus && (
            <Text style={[styles.noNetwork, styles.appFontFamily]}>
              No internet connectivity
            </Text>
          )}
        </View>
        {!loaded ? renderProgressView() : <SkeletonLoader loader="notification" />}
      </LinearGradient>
    </View>
  );
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
    width: topicsWidth,
    height: topicsHeight + 35,
    marginLeft: 15,
    borderRadius: 10,
    marginBottom: 10,
    // borderWidth: 0.1,
    backgroundColor: Constants.app_grey_color,
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
  programtopicImg: {
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
});
