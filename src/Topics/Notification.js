import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  StatusBar,
  Platform,
  TouchableHighlight,
  Image,
  RefreshControl,
  Linking,
  Alert,
  BackHandler,
} from 'react-native';
import {Avatar} from 'react-native-paper';

import {CommonActions, useNavigation} from '@react-navigation/native';
import Moment from 'react-moment';
import LinearGradient from 'react-native-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import Amplify, {Cache, API, Auth} from 'aws-amplify';
import config from '../../aws-exports';
import Toolbar from '../Profile/Toolbar';
import Constants from '../constants';
import SkeletonLoader from '../common/appSkeletonLoader';
import SInfo from 'react-native-sensitive-info';
import {awsSignIn, authData} from '../redux/auth/authSlice';
import {useSelector, useDispatch} from 'react-redux';

const backIcon = require('../Assets/Images/back.png');
const emptyNotificationIcon = require('../Assets/Images/nonotification.png');
// const appLogo = require('../Assets/Images/pearson_logo.png');
const appLogo = require('../Assets/Images/logo.png');
const profilePicture = require('../Assets/Images/profile.png');

export default function NotificationsScreen(props) {
  const {navigation} = props;
  const [loaded, setLoaded] = useState(false);
  const [spinner, setSpinner] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(true);
  const [notificationDetails, setNotificationDetails] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  let userDetails = useSelector(authData);

  useEffect(() => {
    getInitialState();
    const unsubscribe = NetInfo.addEventListener(state => {
      handleConnectivityChange(state.isInternetReachable);
    });
    fetchNotifications();
    StatusBar.setHidden(false);
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    NotificationsScreen.navListener = navigation.addListener('didFocus', () => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(Constants.app_statusbar_color);
        StatusBar.setTranslucent(true);
      }
    });
    return () => {
      // NetInfo.removeEventListener('connectionChange', handleConnectivityChange);
      unsubscribe();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
      //   NotificationsScreen.navListener.remove();
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
    } else {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      });
      setConnectionStatus(true);
    }
  }

  function getInitialState() {
    NetInfo.fetch().then(state => {
      if (state.isConnected === true) {
        setConnectionStatus(true);
        setLoaded(false);
        setSpinner(true);
      } else {
        setConnectionStatus(false);
        setLoaded(false);
        setSpinner(true);
      }
    });
  }

  function handleBackButton() {
    navigation.dispatch(CommonActions.goBack());
    // navigation.state.params.exit({ isExit: true});
    return true;
  }

  async function fetchNotifications() {
    // alert(JSON.stringify(userDetails))
    const bodyParam = {
      body: {
        oid: config.aws_org_id,
        eid: userDetails.username,
        tenant: userDetails.locale,
        schema: config.aws_schema,
        ur_id: userDetails.uData?.ur_id,
        groups: userDetails?.uData?.gid
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    // alert("fetchNotifications " +JSON.stringify(bodyParam.body));
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name_E,
        '/getNotifications',
        bodyParam,
      );
      // alert(JSON.stringify(response))
      let notificationsJSON = JSON.stringify(response).toString();
      console.log('fetchnotifyresponse ' + notificationsJSON);
      notificationsJSON = JSON.parse(notificationsJSON);
      const expires = new Date().getTime() + 60 * 60 * 1000;
      Cache.setItem(`${config.aws_org_id_E}_notifications`, notificationsJSON, {
        expires,
      });
      const {notifications} = notificationsJSON;
      // let notificationDetailss = [];
      // if (notifications === 'false' || notifications === false) {
      //   notificationDetailss = null;
      // } else if (notifications.length > 0 && notifications.length > 9) {
      //   for (let i = 0; i <= 9; i += 1) {
      //     notificationDetailss.push(notifications[i]);
      //   }
      // } else {
      //   notificationDetailss = notifications;
      // }
      setNotificationDetails(notifications.reverse());
      setLoaded(true);
      setSpinner(false);
      readNotifications();
    } catch (error) {
      // eslint-disable-next-line no-console
      // console.log('getNotificationError', error);
      setLoaded(true);
      setSpinner(false);
    }
  }

  async function readNotifications() {
    const bodyParam = {
      body: {eid: info.username, oid: config.aws_org_id_E, action: 'put'},
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    // console.log("readNotifications " +JSON.stringify(bodyParam.body));
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name_E,
        Constants.GET_NOTIFICATIONS,
        bodyParam,
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      // console.log('getNotificationError', error);
      setLoaded(true);
      setSpinner(false);
    }
  }

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack());
    // navigation.state.params.exit({ isExit: true});
  }

  function emptyNotification() {
    return (
      <View style={styles.emptyNotificationContainer}>
        <View
          style={[
            loaded ? styles.notificationImgr2 : styles.notificationImgr1,
          ]}>
          <Image
            style={styles.emptyNotification}
            source={emptyNotificationIcon}
          />
          <Text style={styles.notify_text}>You have no notifications</Text>
        </View>
      </View>
    );
  }

  function onRefresh() {
    setRefreshing(true);
    fetchNotifications().then(() => {
      setRefreshing(false);
    });
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
                  onPress={() => onBackPressed()}>
                  <Image source={backIcon} style={styles.backButton} />
                </TouchableHighlight>
              </View>
              <View>
                <Text style={styles.headerStyle}>Notifications</Text>
              </View>
            </View>
          }
        />

        <View
          style={{
            flex: 1,
            position: 'absolute',
            bottom: 0,
            width: '100%',
            opacity: 0.8,
            zIndex: 1000,
          }}>
          {!connectionStatus && (
            <Text style={[styles.noNetwork, styles.appFontFamily]}>
              No internet connectivity
            </Text>
          )}
        </View>
        {!spinner ? renderTabView() : <SkeletonLoader loader="notification" />}
      </LinearGradient>
    </View>
  );

  function didSelectRow(notifications) {
    console.log('Notifyyyy===' + JSON.stringify(notifications));
    if (notifications.ctype === 1 && notifications.tid) {
      navigation.navigate('CourseDetails', {
        topicId: notifications.tid,
        topicTitle: notifications.msg,
      });
    } else if (notifications.ctype === 2) {
      navigation.navigate('MyQuiz');
    } else if (notifications.type === 2 && notifications.link) {
      Linking.openURL(notifications.link);
    } else {
      Alert.alert(
        notifications.title,
        notifications.msg,
        [{text: 'OK', onPress: () => console.log('Ok Pressed')}],
        {cancelable: false},
      );
    }
  }

  function renderTabView() {
    return (
      <FlatList
        style={styles.notificationsListview}
        data={notificationDetails}
        renderItem={renderNotificationsListItem}
        keyExtractor={(_item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={emptyNotification}
        refreshControl={
          <RefreshControl
            style={styles.refresh}
            tintColor={Constants.app_button_color}
            colors={[Constants.app_button_color, Constants.app_button_color]}
            progressViewOffset={35}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
    );
  }

  function renderNotificationsListItem(data) {
    const rowData = data.item;
    let res = new Date(Number(rowData.time));
    // let time = new Date(rowData.time)
    return (
      <TouchableHighlight
        onPress={() => didSelectRow(rowData)}
        underlayColor="transparent">
        <View>
          <View style={styles.notificationsListContainer}>
            <View>
              <Image source={profilePicture} style={styles.profilePicture} />
            </View>
            <View style={styles.notificationsHolder}>
              <Text style={[styles.notificationName, styles.appFontFamily]}>
                {rowData.title}
              </Text>
              <Text
                numberOfLines={2}
                style={[styles.notificationDetails, styles.appFontFamily]}>
                {rowData.msg}
              </Text>
              {rowData.link ? (
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => {
                    Linking.openURL(rowData.link);
                  }}>
                  <Text style={[styles.notificationDetailsLink, styles.appFontFamily]}>
                    {rowData.link}
                  </Text>
                </TouchableHighlight>
              ) : null}
            </View>
            <Text style={[styles.notificationTime, styles.appFontFamily]}>
              <Moment fromNow withTitle element={Text}>
                {res}
              </Moment>
            </Text>
          </View>
          <View style={[styles.borderLine]} />
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenstyle: {
    height: '100%',
    width: '100%',
  },
  appLogo: {
    height: 30,
    width: 100,
    ...Platform.select({
      ios: {
        marginTop: 8,
      },
      android: {
        marginTop: 9,
      },
    }),
  },
  notificationImgr1: {
    display: 'none',
  },
  notificationImgr2: {
    display: 'flex',
  },
  emptyNotification: {
    height: 100,
    width: 100,
    alignSelf: 'center',
  },
  notify_text: {
    textAlign: 'center',
    color: '#434343',
    fontSize: 16,
    marginTop: 20,
    fontFamily: Constants.app_font_family_regular,
  },
  backButton: {
    width: 25,
    height: 25,
    tintColor: '#000000',
    alignSelf: 'center',
  },
  borderLine: {
    borderBottomColor: '#D3D3D3',
    borderBottomWidth: 1,
    marginLeft: 20,
    marginRight: 20,
  },
  notificationsListview: {
    flex: 1,
    ...Platform.select({
      ios: {
        marginTop: 0,
      },
    }),
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
  emptyNotificationContainer: {
    justifyContent: 'center',
    flex: 1,
    margin: 10,
    paddingTop: 130,
  },
  notificationsListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    marginLeft: 12,
    marginRight: 10,
    //backgroundColor: 'white',
    paddingVertical: 12,
  },
  profilePicture: {
    width: 40,
    height: 40,
    marginTop: 20,
    borderWidth: 0.1,
    borderRadius: 20,
  },
  notificationsHolder: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '72%',
    marginTop: 20,
    marginLeft: 10,
  },
  notificationName: {
    color: Constants.app_text_color,
    textAlign: 'left',
    alignSelf: 'flex-start',
    width: Constants.app_width - 110,
    marginLeft: 10,
    ...Platform.select({
      ios: {
        fontSize: 16,
      },
      android: {
        fontSize: 14,
        fontFamily: Constants.app_font_family_bold,
      },
    }),
  },
  notificationDetails: {
    color: Constants.app_text_color,
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontSize: 13,
    width: '90%',
    marginLeft: 10,
  },
  notificationDetailsLink: {
    color: '#60A3D9',
    // textAlign: 'left',
    // alignSelf: 'flex-start',
    fontSize: 13,
    // width: '90%',
    right: 12,
  },
  notificationTime: {
    color: Constants.app_text_color,
    textAlign: 'right',
    alignSelf: 'center',
    fontSize: 11,
    width: '28%',
    right: 60,
    fontFamily: Constants.app_font_family_bold,
    ...Platform.select({
      ios: {
        fontWeight: 'bold',
      },
      android: {
        fontFamily: Constants.app_font_family_regular,
      },
    }),
  },
  notificationHead: {
    color: Constants.app_text_color,
    // textAlign: 'right',
    // alignSelf: 'center',
    fontSize: 16,
    // width: '28%',
    // right: 10,
    marginTop: 10,
    marginLeft: 10,
    fontFamily: Constants.app_font_family_bold,
    ...Platform.select({
      ios: {
        fontWeight: 'bold',
      },
      android: {
        fontFamily: Constants.app_font_family_regular,
      },
    }),
  },
  notificationRole: {
    color: Constants.app_text_color,
    // textAlign: 'right',
    // alignSelf: 'center',
    fontSize: 14,
    // width: '28%',
    // right: 10,
    marginLeft: 10,
    fontFamily: Constants.app_font_family_bold,
    ...Platform.select({
      ios: {
        fontWeight: '400',
      },
      android: {
        fontFamily: Constants.app_font_family_regular,
      },
    }),
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
    marginLeft: 15,
    fontWeight: '700',
    ...Platform.select({
      ios: {
        fontSize: 16,
        justifyContent: 'center',
        marginTop: 2,
      },
      android: {
        marginTop: 0,
        fontSize: 16,
        justifyContent: 'center',
      },
    }),
    color: Constants.app_text_color,
  },
});
