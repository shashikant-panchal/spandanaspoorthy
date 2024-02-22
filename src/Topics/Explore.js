/* eslint-disable no-alert */
/* eslint-disable consistent-return */
import React, {useEffect, useState} from 'react';
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

export default function ExploreScreen(props) {
  const {navigation} = props;
  const [spinner, setSpinner] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [categoriesDetails, setCategoriesDetails] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newNotify, setNewNoify] = useState(false);
  const [allProgramDetails, setAllProgramDetails] = useState('');
  const [registeredCourseDetails, setRegisteredCourseDetails] = useState('');

  const dispatch = useDispatch();
  let userDetails = useSelector(authData);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      handleConnectivityChange(state.isInternetReachable);
    });
    fetchAllPrograms();
    ExploreScreen.navListener = navigation.addListener('didFocus', () => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(Constants.app_statusbar_color);
        StatusBar.setTranslucent(true);
      }
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
      setSpinner(false);
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
    getCategories().then(() => {
      setRefreshing(false);
    });
  }

  async function getCategories() {
    fetchAllPrograms();
    /* const getData = await Cache.getItem(`${config.aws_org_id}_categories`);
    if (getData !== null) {
      setSpinner(false);
      setLoaded(true);
      setCategoriesDetails(getData);
    } else {
      fetchCategories();
    } */
  }

  async function fetchAllPrograms() {
    let userdata = {...userDetails};
    // console.log(JSON.stringify(userdata))
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
    console.log(JSON.stringify(bodyParam.body));
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        Constants.GET_CATEGORIES,
        bodyParam,
      );
      console.log('qwertyuiop ' + JSON.stringify(response.topics));
      setAllProgramDetails(response.topics);
      setSpinner(false);
    } catch (error) {
      // console.log('getMyCoursesError', error);
    }
  }

  function showNotification() {
    navigation.navigate('Notification');
  }

  const emptyData = (
    <View style={[styles.emptyData, {alignSelf: 'center'}]}>
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
  );

  function didSelectProgram(programDetails) {
    // alert(JSON.stringify(programDetails))
    if (programDetails) {
      navigation.navigate('TopicList', {
        programId: programDetails.id,
        programTitle: programDetails.name,
      });
    }
  }

  function renderProgramView(data) {
    const rowData = data.item;
    // alert('rowData ' + JSON.stringify(rowData));
    return (
      <TouchableHighlight
        underlayColor="transparent"
        onPress={() => didSelectProgram(rowData)}>
        <View style={styles.topTopicsRowContainer}>
          <ImageBackground
            style={styles.programtopicImg}
            imageStyle={{borderTopRightRadius: 10, borderTopLeftRadius: 10}}
            source={{
              uri: `https://${
                Constants.DOMAIN
              }/${config.aws_org_id.toLowerCase()}-resources/images/category-images/${
                rowData.ct_img
              }`,
            }}
            imageStyle={{opacity: 0.4}}>
            <Text
              numberOfLines={2}
              style={[styles.topicTitle, styles.appFontFamily]}>
              {rowData.name}
            </Text>
          </ImageBackground>
        </View>
      </TouchableHighlight>
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
        <View style={styles.statusBar}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={Constants.app_statusbar_color}
            translucent
          />
        </View>
        <Toolbar
          center={<Image source={appLogo} style={styles.appLogo} />}
          right={
            <TouchableOpacity
              onPress={showNotification}
              style={styles.notifyHolder}>
                <Image source={notificationIcon} style={styles.notifyImage} />
            </TouchableOpacity>
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
            }}>
            <View>
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
              numColumns={2}
              ListEmptyComponent={emptyData}
              showsVerticalScrollIndicator={false}
              //   horizontal
            />
          </View>
        ) : (
          <SkeletonLoader loader="explore" />
        )}
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
        marginTop: -48,
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
    width: 50,
    ...Platform.select({
      ios: {
        marginTop: -17,
      },
      android: {
        marginTop: -35,
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
    width: Constants.app_width / 2.4,
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
  programtopicImg: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    width: '100%',
    height: topicsWidth,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
    }),
    opacity :0.7,
  },
  topicTitle: {
    // width: 100,
    // height: topicsWidth,
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
    marginTop: topicsWidth/2.2
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
