/* eslint-disable camelcase */
/* eslint-disable react/destructuring-assignment */
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  Platform,
  TouchableHighlight,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  RefreshControl,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {CommonActions, useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Amplify, {API} from 'aws-amplify';
import config from '../../aws-exports';
import Toolbar from './Toolbar';
import Constants from '../constants';
import {useSelector, useDispatch} from 'react-redux';
import {authData, awsSignOut} from '../redux/auth/authSlice';
import SkeletonLoader from '../common/appSkeletonLoader';

const logoWidth = 25;
const logoHeight = 30;
const toolbarHeight = 50;

const calendar = require('../Assets/Images/calendar.png');
const certificate = require('../Assets/Images/certificate.png');
const help_and_support = require('../Assets/Images/help_support.png');
const bookmark = require('../Assets/Images/bookmark.png');
const wishlist = require('../Assets/Images/wish_list.png');
const logout = require('../Assets/Images/logout.png');
const arrow = require('../Assets/Images/Arrow.png');
const profileIcon = require('../Assets/Images/profile_icon.png');
const appLogo = require('../Assets/Images/logo.png');
const notificationIcon = require('../Assets/Images/notification_white.png');
const newnotificationIcon = require('../Assets/Images/new_notification.png');
const profileBackgroundIcon = require('../Assets/Images/profile_background.png');

export default function SettingsScreen(props) {
  // const {
  //   navigation,
  // } = props;
  const navigation = useNavigation();
  const [modalSpinner, setModalSpinner] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newNotify, setNewNoify] = useState(false);
  const settingsListData = [
    'Bookmarks',
    'Calendar',
    'Certificates',
    'Help & Support',
  ];
  const [spinner, setSpinner] = useState(true);
  const [profileData, setProfileData] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  let userDetails = useSelector(authData);

  useEffect(() => {
    // alert(JSON.stringify(userDetails.uData))
    StatusBar.setHidden(false);
    const unsubscribe = NetInfo.addEventListener(state => {
      handleConnectivityChange(state.isInternetReachable);
    });
    getUserDetails();
    SettingsScreen.navListener = navigation.addListener('didFocus', () => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(Constants.app_statusbar_color);
        StatusBar.setTranslucent(true);
      }
    });
    // NetInfo.fetch().then(state => {
    //   if (state.isConnected === true) {
    //     renderSettingsItem();
    //   }
    // });
    return () => {
      // NetInfo.removeEventListener('connectionChange', handleConnectivityChange);
      unsubscribe();
      // SettingsScreen.navListener.remove();
    };
  }, []);

  function handleConnectivityChange(isconnected) {
    if (isconnected === false) {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      });
      setModalSpinner(false);
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

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack());
  }

  function showNotification() {
    navigation.navigate('Notification');
  }

  function didSelectRow(value) {
    if (value == 'Bookmarks') {
      navigation.navigate('Bookmarks');
    } else if (value == 'Wishlist') {
      navigation.navigate('Wishlist');
    } else if (value == 'Calendar') {
      navigation.navigate('Calendars');
    } else if (value == 'Certificates') {
      navigation.navigate('Certificates');
    } else if (value == 'Help & Support') {
      navigation.navigate('MultimediaView', {selectedText: value});
    } else if (value === 'Sign Out') {
      removeuser();
    }
  }

  function renderSettingsItem(data) {
    let rowData = data.item;
    let image_icon;
    if (rowData === 'Bookmarks') {
      image_icon = bookmark;
    } else if (rowData === 'Calendar') {
      image_icon = calendar;
    } else if (rowData === 'Certificates') {
      image_icon = certificate;
    } else if (rowData === 'Help & Support') {
      image_icon = help_and_support;
    }
    return (
      <TouchableHighlight
        underlayColor="transparent"
        onPress={() => didSelectRow(rowData)}>
        <View>
          <View style={styles.rowContainer}>
            <Image source={image_icon} style={styles.iconStyle} />
            <Text style={[styles.itemText, styles.appFontFamily]}>
              {rowData}
            </Text>
            <View style={{position: 'absolute', right: 25}}>
              <Image source={arrow} style={styles.arrowStyle} />
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  function editProfileButtonPressed() {
    navigation.navigate('EditProfile');
  }

  const getUserDetails = async () => {
    setSpinner(true);
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

    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getUserDetails',
        bodyParam,
      );
      //  alert(JSON.stringify(response))
      const {body} = response;
      setProfileData(body[0]);
      setSpinner(false);
    } catch (err) {
      setSpinner(false);
      console.error(err);
    }
  };

  function removeuser() {
    dispatch(awsSignOut());
    setModalSpinner(false);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        key: null,
        routes: [{name: 'AuthCheck'}],
      }),
    );
    // Auth.signOut()
    //   .then(() => {
    //     // Cache.removeItem('${config}');
    //     // SInfo.deleteItem('org_details', {});
    //     // Cache.removeItem(`${config.aws_org_id}_topic_progress`);
    //     // Cache.removeItem(`${config.aws_org_id}_specified_Topics`);
    //     // SInfo.deleteItem(`${config.aws_org_id}_topic_progress`, {});
    //     // SInfo.deleteItem(`${config.aws_org_id}_specified_Topics`, {});
    //     // Cache.removeItem(`${config.aws_org_id}_certificates`);
    //     // const getData = Cache.getItem('device_token');
    //     // Cache.clear();
    //     Cookie.clear()
    //     SInfo.deleteItem('device_token', {})
    //     // Cache.setItem('device_token', getData);
    //     setModalSpinner(false)
    //     navigation.dispatch(
    //       CommonActions.reset({
    //         index: 0,
    //         key: null,
    //         routes: [{ name: 'AuthCheck' }],
    //       })
    //     )
    //   })
    //   .catch((err) => console.log(err))
  }

  function onRefresh() {
    setRefreshing(true);
    getUserDetails().then(() => {
      setRefreshing(false);
    });
  }

  function renderSettingsView() {
    return (
      <View style={{flex: 1}}>
        <ScrollView
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
          <ImageBackground
            style={styles.topicImg}
            source={profileBackgroundIcon}>
            <View style={{flex: 1, marginTop: 20, alignItems: 'center'}}>
              {profileData?.avtid === undefined ||
              profileData?.avtid === null ? (
                <Image
                  style={styles.topicImgInside}
                  source={profileIcon}></Image>
              ) : (
                <Image
                  source={{
                    uri: `https://${
                      Constants.DOMAIN
                    }/${config.aws_org_id.toLowerCase()}-resources/images/profile-images/${
                      profileData?.avtid
                    }.png`,
                  }}
                  style={styles.topicImgInside}
                />
              )}
            </View>
            <Text
              style={{
                position: 'absolute',
                alignSelf: 'center',
                marginTop: 30,
                fontSize: 22,
                fontWeight: '600',
              }}>
              My Profile
            </Text>
          </ImageBackground>
          <View
            style={{
              borderWidth: 1,
              width: '90%',
              marginHorizontal: '5%',
              backgroundColor: '#ffffff',
              borderColor: '#ddd',
              shadowColor: '#c0c0c0',
              shadowOffset: {width: 0, height: 5},
              shadowOpacity: 0.2,
              shadowRadius: 1,
              elevation: 15,
              marginVertical: 20,
              borderRadius: 10,
              marginTop: -60,
            }}>
            <Text
              style={{
                margin: 20,
                fontSize: 16,
                color: Constants.app_text_color,
              }}>
              Personal Details
            </Text>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{width: '70%'}}>
                <Text
                  style={{
                    marginHorizontal: 20,
                    marginBottom: 10,
                    fontSize: 20,
                    fontWeight: '700',
                  }}>
                  {profileData?.name || userDetails?.name}
                </Text>
                <Text
                  style={{
                    marginHorizontal: 20,
                    // marginVertical: 10,
                    fontSize: 16,
                    color: Constants.app_text_color,
                  }}>
                  {profileData?.emailid}
                </Text>
                <Text
                  style={{
                    marginHorizontal: 20,
                    marginTop: 5,
                    marginBottom: 10,
                    fontSize: 16,
                    color: Constants.app_text_color,
                  }}>
                  {userDetails?.uData?.oid}
                </Text>
              </View>
              <View>
                <View style={styles.buttonLogin}>
                  <TouchableHighlight
                    key="login"
                    onPress={() => editProfileButtonPressed()}
                    style={[
                      styles.buttonStyle,
                      {backgroundColor: Constants.app_dark_color},
                    ]}
                    underlayColor="transparent">
                    <Text style={styles.loginText}>Edit Profile</Text>
                  </TouchableHighlight>
                </View>
              </View>
            </View>
          </View>
          <FlatList
            style={styles.settingsListview}
            data={settingsListData}
            renderItem={renderSettingsItem}
            keyExtractor={(item, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
          />
          <View style={[styles.borderLine]} />
          <TouchableHighlight
            underlayColor="transparent"
            onPress={() => removeuser()}>
            <View style={styles.rowContainer}>
              <Image source={logout} style={styles.iconStyle} />
              <Text style={[styles.itemText, styles.appFontFamily]}>
                Logout
              </Text>
            </View>
          </TouchableHighlight>
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      pointerEvents={!connectionStatus ? 'none' : 'auto'}>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={['#FFFFFF', '#FFFFFF']}
        style={styles.screenstyle}>
        {modalSpinner && (
          <View style={styles.spinnerStyle}>
            <ActivityIndicator
              animating
              size="large"
              color={Constants.app_button_color}
            />
          </View>
        )}
        <View style={styles.statusBar}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={Constants.app_statusbar_color}
            translucent
          />
        </View>
        <Toolbar
          // left={(
          //   <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.profileHolder}>
          //     <Image
          //       source={profileIcon}
          //       style={styles.profileImage}
          //     />
          //   </TouchableOpacity>
          // )}
          center={<Image source={appLogo} style={styles.appLogo} />}
          right={
            <TouchableOpacity
              onPress={showNotification}
              style={styles.notifyHolder}>
              {newNotify == false ? (
                <Image source={notificationIcon} style={styles.notifyImage} />
              ) : (
                <Image
                  source={newnotificationIcon}
                  style={styles.notifyImage}
                />
              )}
            </TouchableOpacity>
          }
        />
        {!spinner ? (
          renderSettingsView()
        ) : (
          <SkeletonLoader loader="notification" />
        )}
        {/* <View style={styles.versionHolder}>
          <Text style={[styles.versionText, styles.appFontFamily]}>
            {' '}
            Version
            {' '}
            {DeviceInfo.getVersion()}
          </Text>
        </View> */}
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
              No Internet Connectivity
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenstyle: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  appFontFamily: {
    fontFamily: Constants.app_font_family_regular,
  },
  profileHolder: {
    height: toolbarHeight,
    ...Platform.select({
      ios: {
        marginTop: -22,
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
    height: 30,
    width: 50,
    ...Platform.select({
      ios: {
        marginTop: -15,
      },
      android: {
        marginTop: -35,
      },
    }),
  },
  notifyImage: {
    height: 30,
    width: 30,
  },
  notifyHolder: {
    marginRight: -10,
    ...Platform.select({
      ios: {
        marginTop: -50,
      },
      android: {
        marginTop: -48,
      },
    }),
  },

  settingsListview: {
    flex: 1,
    marginTop: 0,
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: 65,
    alignItems: 'center',
  },
  borderLine: {
    borderBottomColor: '#D3D3D3',
    borderBottomWidth: 0.5,
  },
  iconStyle: {
    marginLeft: 15,
    marginTop: 0,
    width: 20,
    height: 20,
  },
  arrowStyle: {
    marginLeft: 18,
    marginTop: 0,
    width: 22,
    height: 22,
  },
  itemText: {
    marginLeft: 10,
    marginTop: 20,
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontSize: 18,
    color: Constants.app_text_color,
  },
  headerStyle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontFamily: Constants.app_font_family_regular,
    fontSize: 17,
    marginTop: 4,
  },
  backButton: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
    marginTop: 10,
    marginLeft: -10,
  },
  versionHolder: {
    // flex: 1,
    height: 30,
    flexDirection: 'column',
    alignSelf: 'center',
    marginBottom: 60,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 13,
    color: Constants.app_text_color,
    justifyContent: 'center',
  },
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight - 5,
      },
    }),
  },
  spinnerStyle: {
    top: Constants.app_height / 2 - 50,
    height: 100,
    width: 100,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 10,
    position: 'absolute',
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
  topicImg: {
    width: '100%',
    height: 305,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
    }),
  },
  topicImgInside: {
    marginTop: 55,
    width: 120,
    height: 120,
    borderRadius: 100,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
    }),
  },
  buttonLogin: {
    width: 90,
    height: 30,
    marginBottom: 15,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginRight: 15,
  },
  buttonStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
});
