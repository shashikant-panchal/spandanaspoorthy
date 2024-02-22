import React, {useState, useEffect, useRef, useMemo} from 'react';
import {
  StyleSheet,
  Image,
  ImageBackground,
  Text,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  FlatList,
  StatusBar,
  Linking,
  BackHandler,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Amplify, {Cache, API, Auth} from 'aws-amplify';
import {CommonActions} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import LinearGradient from 'react-native-linear-gradient';
import Toolbar from '../Profile/Toolbar';
import {isThisIPhoneX} from '../Home/isIphoneX';
import {awsSignIn, authData} from '../redux/auth/authSlice';
import {useSelector, useDispatch} from 'react-redux';
import SkeletonLoader from '../common/appSkeletonLoader';
import Constants from '../constants';
import CourseStructureScreen from './CourseStructure';
import MyProgressScreen from './MyProgress';
import config from '../../aws-exports';
import {
  TabView,
  NavigationState,
  SceneRendererProps,
  TabBar,
} from 'react-native-tab-view';

const topicsWidth = (Constants.app_width - 5) / 2.4 - 5;
const topicsHeight = 120;
const topicsImgHeight = topicsHeight / 2;

const backIcon = require('../Assets/Images/back.png');
const starPointsIcon = require('../Assets/Images/starpoints.png');
const durationIcon = require('../Assets/Images/duration.png');
const profileIcon = require('../Assets/Images/my_profile.png');

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

export default function CourseViewScreen(props) {
  const source = {
    uri: 'http://samples.leanpub.com/thereactnativebook-sample.pdf',
    cache: true,
  };
  const {navigation, onDismissLoadingCallback, route} = props;
  const redux = useRef({});
  const {courseId} = route.params;
  const networkStatusRef = useRef(true);
  const [spinner, setSpinner] = useState(false);
  const [programDetails, setProgramDetails] = useState();
  const [uDetails, setUDetails] = useState();
  const [compDateValue, setCompDateValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastNuggetObject, setLastNuggetObject] = useState({});
  const [courseTitle, setCourseTitle] = useState('');

  let userDetails = useSelector(authData);
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'first', title: 'Content'},
    {key: 'second', title: 'Progress'},
  ]);

  useEffect(() => {
    getCourse();
    const unsubscribe = NetInfo.addEventListener(state => {
      handleConnectivityChange(state.isInternetReachable);
    });
    const listners = [navigation.addListener('willFocus', () => checkFocus())];
    StatusBar.setHidden(false);
    CourseViewScreen.navListener = navigation.addListener('didFocus', () => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(Constants.app_statusbar_color);
        StatusBar.setTranslucent(true);
      }
    });
    return () => {
      unsubscribe();
      listners.forEach(listner => {
        unsubscribe();
      });
    };
  }, []);

  useEffect(() => {
    // const handleBackPress = () => {
    //   navigation.navigate('HomeScreenNavigator');
    //   return true;
    // };
    // BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    // return () => {
    //   BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    // };
    const handleBackPress = () => {
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  });

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
      // fetchMytopicsDataset();
    }
  }

  async function getCourse() {
    setSpinner(true);

    const bodyParam = {
      body: {
        oid: config.aws_org_id,
        eid: userDetails.username,
        tenant: userDetails.locale,
        id: userDetails.username,
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

    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getTopicDetails',
        bodyParam,
      );

      const course = response?.ttitle || 'Unknown Course Title';

      setCourseTitle(course);

      setSpinner(false);
    } catch (error) {
      console.error('Error fetching course details:', error);
      setSpinner(false);
    }
  }

  function onBackPressed() {
    if (courseId) {
      navigation.goBack() || navigation.navigate('HomeScreenNavigator');
    } else {
      navigation.navigate('HomeScreenNavigator');
    }
  }

  const renderScene = ({route}) => {
    switch (route.key) {
      case 'first':
        return (
          <CourseStructureScreen nuggetTitle={'title'} courseId={courseId} />
        );
      case 'second':
        return <MyProgressScreen nuggetTitle={'title'} courseId={courseId} />;
      default:
        return null;
    }
  };

  const renderLabel = useMemo(() => {
    return ({route, focused}) => {
      const {key} = route;

      const isDetail = key === 'first';
      const isRanking = key === 'fourth';
      const tabBorderRadiusStyles = {
        borderTopLeftRadius: isDetail ? 50 : 0,
        borderBottomLeftRadius: isDetail ? 50 : 0,
        borderTopRightRadius: isRanking ? 50 : 0,
        borderBottomRightRadius: isRanking ? 50 : 0,
      };
      return (
        <View>
          {focused ? (
            <View>
              <Text style={styles.text}>{route.title}</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.text}>{route.title}</Text>
            </View>
          )}
        </View>
      );
    };
  }, []);

  // const renderTabBar = useMemo(() => {
  //   return (props: SceneRendererProps & { navigationState: TNavState }) => {
  //     return (
  //       <TabBar
  //         {...props}
  //         tabStyle={styles.tabLabel}
  //         indicatorStyle={{ backgroundColor: Constants.app_blue_color }}
  //         style={{ backgroundColor: 'transparent' }}
  //         contentContainerStyle={styles.tabBarContentContainer}
  //         renderLabel={renderLabel}
  //         onTabLongPress={(scene) => {
  //           const { route } = scene
  //           props.jumpTo(route.key)
  //         }}
  //       />
  //     )
  //   }
  // }, [renderLabel])

  const renderTabBar = useMemo(() => {
    return props => {
      const {navigationState} = props;

      return (
        <TabBar
          {...props}
          tabStyle={styles.tabLabel}
          indicatorStyle={{backgroundColor: Constants.app_blue_color}}
          style={{backgroundColor: 'transparent'}}
          contentContainerStyle={styles.tabBarContentContainer}
          renderLabel={renderLabel}
          onTabLongPress={scene => {
            const {route} = scene;
            props.jumpTo(route.key);
          }}
        />
      );
    };
  }, [renderLabel]);

  function viewCoursePage() {
    return (
      <TabView
        renderTabBar={renderTabBar}
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        style={{flex: 1, height: '100%'}}
      />
    );
  }

  return (
    <View
      style={styles.container}
      pointerEvents={!networkStatusRef.current ? 'none' : 'auto'}>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={['#FFFFFF', '#FFFFFF']}
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
                <Text numberOfLines={1} style={styles.headerStyle}>
                  {courseTitle}
                </Text>
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
          {!networkStatusRef.current && (
            <Text style={[styles.noNetwork, styles.appFontFamily]}>
              No internet connectivity
            </Text>
          )}
        </View>
        {!spinner ? viewCoursePage() : <SkeletonLoader loader="home1" />}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.app_background_color,
  },
  screenstyle: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight - 5,
      },
    }),
  },
  backButton: {
    width: 25,
    height: 25,
    tintColor: '#000000',
    alignSelf: 'center',
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
  startButtonHolder: {
    height: 35,
    backgroundColor: Constants.app_button_color,
    marginBottom: 10,
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
  },
  startText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 7,
    alignSelf: 'center',
  },
  endText: {
    color: Constants.app_button_color,
    fontWeight: '700',
    fontSize: 16,
    // marginTop: 7,
    alignSelf: 'center',
    marginBottom: 20,
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
  headerStyle1: {
    marginLeft: 18,
    //textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    fontWeight: 'bold',
    ...Platform.select({
      ios: {
        fontSize: 16,
        // alignSelf: 'flex-start',
        marginTop: 15,
      },
      android: {
        marginTop: 15,
        fontSize: 16,
        justifyContent: 'center',
        alignSelf: 'flex-start',
      },
    }),
    color: Constants.app_text_color,
  },
  programTopicImg: {
    // marginTop: 15,
    borderRadius: 10,
    width: topicsWidth + 210,
    height: topicsImgHeight + 150,
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
    }),
  },
  courseButtonHolder: {
    marginBottom: 15,
    marginRight: 10,
    height: 30,
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: Constants.app_button_color,
    borderRadius: 5,
  },
  courseButton: {
    color: Constants.app_color,
    fontSize: Constants.app_button_text_size,
    fontFamily: Constants.app_font_family_regular,
    marginHorizontal: 10,
    ...Platform.select({
      ios: {
        fontWeight: 'bold',
      },
    }),
    ...Platform.select({
      android: {
        justifyContent: 'center',
        marginBottom: 1.5,
        fontWeight: '700',
      },
    }),
  },
  courseView: {
    ...Platform.select({
      android: {
        paddingTop: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#c0c0c0',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 1,
        // elevation: 5,
        marginVertical: 20,
      },
      ios: {
        paddingTop: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#c0c0c0',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 5,
        marginVertical: 20,
      },
    }),
  },
  text: {
    fontSize: 16,
    color: Constants.app_text_color,
  },
});
