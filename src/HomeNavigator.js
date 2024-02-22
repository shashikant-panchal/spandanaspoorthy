import * as React from 'react';
import {Text, Image} from 'react-native';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import MyTopicsScreen from './Home/MyTopics';
import SettingsScreen from './Profile/Settings';
import CourseStructureScreen from './Topics/CourseStructure';
import MyProgressScreen from './Topics/MyProgress';
import CoursePlayerScreen from './Topics/CoursePlayer';
import MultimediaViewScreen from './Profile/MultimediaView';
import CourseViewScreen from './Topics/CourseView';
import ApplyApplicationScreen from './Topics/ApplyApplication';
import QuizDetailsScreen from './Topics/QuizDetails';
import QuizDetailsTimerScreen from './Topics/QuizDetailsTimer';
import SearchScreen from './Topics/Search';
import ExploreScreen from './Topics/Explore';
import CalendarsScreen from './Topics/Calendars';
import CertificatesScreen from './Topics/Certificates';
import BookmarksScreen from './Topics/Bookmarks';
import TopicListScreen from './Topics/TopicList';
import NotificationsScreen from './Topics/Notification';
import ObjectViewScreen from './Topics/ObjectView';
import QuizObjectScreen from './Topics/QuizObject';
import EditProfileScreen from './Topics/EditProfile';
import LiveSessionScreen from './Topics/LiveSession';
import WishlistScreen from './Topics/Wishlist';
import LearningPathScreen from './Topics/LearningPath';
import FeedbackScreen from './Topics/Feedback';
import SessionRegisterScreen from './Topics/SessionRegister';
import SummarySlideScreen from './Topics/SummarySlide';
import QuizAnswersScreen from './Topics/QuizAnswers';
import constants from './constants';
import {useSelector} from 'react-redux';
import {authData} from './redux/auth/authSlice';
import OJTTLO from './OJT/OJT-TLO';
import {DropDown} from './OJT/DropDown';
import OJTLOBM from './OJT/OJT-BM-LO';
import {DropDownBM} from './OJT/DropDownBM';
import ActivitiesBM from './OJT/ActivitiesBM';
import ActivitiesMentor from './OJT/ActivitiesMentor';
import ActivitiesTlo from './OJT/ActivitiesTLO';
import {Activities} from './OJT/Activities';
import OJTMentor from './OJT/OJT-Mentor';

const notHomeIcon = require('./Assets/Images/home.png');
const homeIcon = require('./Assets/Images/home_focus.png');
const notExpoloreIcon = require('./Assets/Images/explore.png');
const exploreIcon = require('./Assets/Images/explore_focus.png');
const notProfileIcon = require('./Assets/Images/profile.png');
const profileIcon = require('./Assets/Images/profile_focus.png');
const notSearchIcon = require('./Assets/Images/searchHome.png');
const searchIcon = require('./Assets/Images/search_focus.png');
const OJTactive = require('./Assets/Images/OJT-Active.png');
const OJTinActive = require('./Assets/Images/OJT-InActive.png');

const MyTopicsStack = createStackNavigator();

function MyTopicsStackScreen() {
  return (
    <MyTopicsStack.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#621FF7',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <MyTopicsStack.Screen name="MyTopics" component={MyTopicsScreen} />
      <MyTopicsStack.Screen
        name="Notification"
        component={NotificationsScreen}
      />
      <MyTopicsStack.Screen name="TopicList" component={TopicListScreen} />
      <MyTopicsStack.Screen
        name="CourseStructure"
        component={CourseStructureScreen}
      />
      <MyTopicsStack.Screen name="MyProgress" component={MyProgressScreen} />
      <MyTopicsStack.Screen
        name="CoursePlayer"
        component={CoursePlayerScreen}
      />
      <MyTopicsStack.Screen name="QuizDetails" component={QuizDetailsScreen} />
      <MyTopicsStack.Screen
        name="QuizDetailsTimer"
        component={QuizDetailsTimerScreen}
      />
      <MyTopicsStack.Screen name="CourseView" component={CourseViewScreen} />
      <MyTopicsStack.Screen name="LiveSession" component={LiveSessionScreen} />
      <MyTopicsStack.Screen
        name="ApplyApplication"
        component={ApplyApplicationScreen}
      />
      <MyTopicsStack.Screen name="ObjectView" component={ObjectViewScreen} />
      <MyTopicsStack.Screen name="QuizObject" component={QuizObjectScreen} />
      <MyTopicsStack.Screen name="EditProfile" component={EditProfileScreen} />
      <MyTopicsStack.Screen
        name="LearningPath"
        component={LearningPathScreen}
      />
      <MyTopicsStack.Screen name="Feedback" component={FeedbackScreen} />
      <MyTopicsStack.Screen
        name="SessionRegister"
        component={SessionRegisterScreen}
      />
      <MyTopicsStack.Screen
        name="SummarySlide"
        component={SummarySlideScreen}
      />
      <MyTopicsStack.Screen name="QuizAnswers" component={QuizAnswersScreen} />
    </MyTopicsStack.Navigator>
  );
}

const SearchStack = createStackNavigator();

function SearchStackScreen() {
  return (
    <SearchStack.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#621FF7',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <SearchStack.Screen name="Search" component={SearchScreen} />
      <SearchStack.Screen name="Notification" component={NotificationsScreen} />
      <SearchStack.Screen name="TopicList" component={TopicListScreen} />
      <SearchStack.Screen
        name="CourseStructure"
        component={CourseStructureScreen}
      />
      <SearchStack.Screen name="MyProgress" component={MyProgressScreen} />
      <SearchStack.Screen name="CoursePlayer" component={CoursePlayerScreen} />
      <SearchStack.Screen name="QuizDetails" component={QuizDetailsScreen} />
      <SearchStack.Screen
        name="QuizDetailsTimer"
        component={QuizDetailsTimerScreen}
      />
      <SearchStack.Screen name="CourseView" component={CourseViewScreen} />
      <SearchStack.Screen
        name="ApplyApplication"
        component={ApplyApplicationScreen}
      />
      <SearchStack.Screen name="ObjectView" component={ObjectViewScreen} />
      <SearchStack.Screen name="QuizObject" component={QuizObjectScreen} />
      <SearchStack.Screen name="EditProfile" component={EditProfileScreen} />
      <SearchStack.Screen name="LiveSession" component={LiveSessionScreen} />
      <SearchStack.Screen name="LearningPath" component={LearningPathScreen} />
      <SearchStack.Screen name="Feedback" component={FeedbackScreen} />
      <SearchStack.Screen
        name="SessionRegister"
        component={SessionRegisterScreen}
      />
      <SearchStack.Screen name="SummarySlide" component={SummarySlideScreen} />
      <SearchStack.Screen name="QuizAnswers" component={QuizAnswersScreen} />
    </SearchStack.Navigator>
  );
}

const OJTStack = createStackNavigator();

function OJTStackScreen() {
  return (
    <OJTStack.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#621FF7',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <OJTStack.Screen name="OJTScreen" component={OJTTLO} />
      <OJTBMStack.Screen name="DropDown" component={DropDown} />
      <OJTBMStack.Screen name="DropDownBM" component={DropDownBM} />
      <OJTBMStack.Screen name="ActivitiesBM" component={ActivitiesBM} />
      <OJTBMStack.Screen name="ActivitiesMentor" component={ActivitiesMentor} />
      <OJTBMStack.Screen name="ActivitiesTlo" component={ActivitiesTlo} />
      <OJTBMStack.Screen name="Activities" component={Activities} />
    </OJTStack.Navigator>
  );
}

const OJTBMStack = createStackNavigator();

function OJTBMStackScreen() {
  return (
    <OJTBMStack.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#621FF7',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <OJTBMStack.Screen name="OJTLOBM" component={OJTLOBM} />
      <OJTBMStack.Screen name="DropDown" component={DropDown} />
      <OJTBMStack.Screen name="DropDownBM" component={DropDownBM} />
      <OJTBMStack.Screen name="ActivitiesBM" component={ActivitiesBM} />
      <OJTBMStack.Screen name="ActivitiesMentor" component={ActivitiesMentor} />
      <OJTBMStack.Screen name="ActivitiesTlo" component={ActivitiesTlo} />
      <OJTBMStack.Screen name="Activities" component={Activities} />
      <OJTBMStack.Screen name="OJTMentor" component={OJTMentor} />
    </OJTBMStack.Navigator>
  );
}

const ExploreStack = createStackNavigator();

function ExploreStackScreen() {
  return (
    <ExploreStack.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#621FF7',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <ExploreStack.Screen name="Explore" component={ExploreScreen} />
      <ExploreStack.Screen
        name="Notification"
        component={NotificationsScreen}
      />
      <ExploreStack.Screen name="TopicList" component={TopicListScreen} />
      <ExploreStack.Screen
        name="CourseStructure"
        component={CourseStructureScreen}
      />
      <ExploreStack.Screen name="MyProgress" component={MyProgressScreen} />
      <ExploreStack.Screen name="CoursePlayer" component={CoursePlayerScreen} />
      <ExploreStack.Screen name="QuizDetails" component={QuizDetailsScreen} />
      <ExploreStack.Screen
        name="QuizDetailsTimer"
        component={QuizDetailsTimerScreen}
      />
      <ExploreStack.Screen name="CourseView" component={CourseViewScreen} />
      <ExploreStack.Screen
        name="ApplyApplication"
        component={ApplyApplicationScreen}
      />
      <ExploreStack.Screen name="ObjectView" component={ObjectViewScreen} />
      <ExploreStack.Screen name="QuizObject" component={QuizObjectScreen} />
      <ExploreStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ExploreStack.Screen name="LiveSession" component={LiveSessionScreen} />
      <ExploreStack.Screen name="LearningPath" component={LearningPathScreen} />
      <ExploreStack.Screen name="Feedback" component={FeedbackScreen} />
      <ExploreStack.Screen
        name="SessionRegister"
        component={SessionRegisterScreen}
      />
      <ExploreStack.Screen name="SummarySlide" component={SummarySlideScreen} />
      <ExploreStack.Screen name="QuizAnswers" component={QuizAnswersScreen} />
    </ExploreStack.Navigator>
  );
}

const SettingsStack = createStackNavigator();

function SettingsStackScreen() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#621FF7',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      <SettingsStack.Screen
        name="MultimediaView"
        component={MultimediaViewScreen}
      />
      <SettingsStack.Screen name="Calendars" component={CalendarsScreen} />
      <SettingsStack.Screen
        name="Certificates"
        component={CertificatesScreen}
      />
      <SettingsStack.Screen name="Bookmarks" component={BookmarksScreen} />
      <SettingsStack.Screen
        name="Notification"
        component={NotificationsScreen}
      />
      <SettingsStack.Screen name="TopicList" component={TopicListScreen} />
      <SettingsStack.Screen
        name="CourseStructure"
        component={CourseStructureScreen}
      />
      <SettingsStack.Screen name="MyProgress" component={MyProgressScreen} />
      <SettingsStack.Screen
        name="CoursePlayer"
        component={CoursePlayerScreen}
      />
      <SettingsStack.Screen name="QuizDetails" component={QuizDetailsScreen} />
      <SettingsStack.Screen
        name="QuizDetailsTimer"
        component={QuizDetailsTimerScreen}
      />
      <SettingsStack.Screen name="CourseView" component={CourseViewScreen} />
      <SettingsStack.Screen
        name="ApplyApplication"
        component={ApplyApplicationScreen}
      />
      <SettingsStack.Screen name="ObjectView" component={ObjectViewScreen} />
      <SettingsStack.Screen name="QuizObject" component={QuizObjectScreen} />
      <SettingsStack.Screen name="EditProfile" component={EditProfileScreen} />
      <SettingsStack.Screen name="LiveSession" component={LiveSessionScreen} />
      <SettingsStack.Screen name="Wishlist" component={WishlistScreen} />
      <SettingsStack.Screen
        name="LearningPath"
        component={LearningPathScreen}
      />
      <SettingsStack.Screen name="Feedback" component={FeedbackScreen} />
      <SettingsStack.Screen
        name="SessionRegister"
        component={SessionRegisterScreen}
      />
      <SettingsStack.Screen
        name="SummarySlide"
        component={SummarySlideScreen}
      />
      <SettingsStack.Screen name="QuizAnswers" component={QuizAnswersScreen} />
    </SettingsStack.Navigator>
  );
}

const getRouteName = route => {
  const routeName = getFocusedRouteNameFromRoute(route);
  if (
    routeName?.includes('CourseStructure') ||
    routeName?.includes('MyProgress') ||
    routeName?.includes('CoursePlayer') ||
    routeName?.includes('MultimediaView') ||
    routeName?.includes('CourseView') ||
    routeName?.includes('ApplyApplication') ||
    routeName?.includes('QuizDetails') ||
    routeName?.includes('QuizDetailsTimer') ||
    routeName?.includes('Calendars') ||
    routeName?.includes('Bookmarks') ||
    routeName?.includes('Certificates') ||
    routeName?.includes('TopicList') ||
    routeName?.includes('Notification') ||
    routeName?.includes('QuizObject') ||
    routeName?.includes('EditProfile') ||
    routeName?.includes('LiveSession') ||
    routeName?.includes('Wishlist') ||
    routeName?.includes('LearningPath') ||
    routeName?.includes('ObjectView') ||
    routeName?.includes('Feedback') ||
    routeName?.includes('SessionRegister') ||
    routeName?.includes('SummarySlide') ||
    routeName?.includes('QuizAnswers') ||
    routeName?.includes('DropDown') ||
    routeName?.includes('DropDownBM') ||
    routeName?.includes('ActivitiesBM') ||
    routeName?.includes('ActivitiesMentor') ||
    routeName?.includes('ActivitiesTlo') ||
    routeName?.includes('Activities')
  ) {
    return 'none';
  }
};

const Tab = createBottomTabNavigator();

export default function HomeNavigator() {
  let userDetails = useSelector(authData);
  const isTLO =
    userDetails?.uData?.designation?.toLowerCase() === 'tlo' ||
    'credit assistant';
  return (
    <SafeAreaProvider>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          tabBarActiveTintColor: '#392D7D',
          headerShown: false,
        }}>
        <Tab.Screen
          name="Home"
          component={MyTopicsStackScreen}
          options={({route}) => ({
            tabBarStyle: {display: getRouteName(route)},
            tabBarLabel: ({focused}) =>
              focused ? (
                <Text style={{fontSize: 12, color: constants.app_button_color}}>
                  Home
                </Text>
              ) : (
                <Text style={{fontSize: 12, color: constants.app_text_color}}>
                  Home
                </Text>
              ),
            tabBarIcon: ({focused}) =>
              focused ? (
                <Image source={homeIcon} style={{height: 22, width: 22}} />
              ) : (
                <Image
                  source={notHomeIcon}
                  style={{height: 22, width: 22, opacity: 0.5}}
                />
              ),
          })}
        />
        <Tab.Screen
          name="Search"
          component={SearchStackScreen}
          options={({route}) => ({
            tabBarStyle: {display: getRouteName(route)},
            tabBarLabel: ({focused}) =>
              focused ? (
                <Text style={{fontSize: 12, color: constants.app_button_color}}>
                  Search
                </Text>
              ) : (
                <Text style={{fontSize: 12, color: constants.app_text_color}}>
                  Search
                </Text>
              ),
            tabBarIcon: ({focused}) =>
              focused ? (
                <Image source={searchIcon} style={{height: 22, width: 22}} />
              ) : (
                <Image
                  source={notSearchIcon}
                  style={{height: 22, width: 22, opacity: 0.5}}
                />
              ),
          })}
        />

        {[
          'tlo',
          'loan officer',
          'lo',
          'branch manager',
          'credit assistant',
        ].includes(userDetails?.uData?.designation?.toLowerCase()) &&
          (isTLO ? (
            <Tab.Screen
              name="OJT"
              component={OJTStackScreen}
              options={({route}) => ({
                tabBarStyle: {display: getRouteName(route)},
                tabBarLabel: ({focused}) =>
                  focused ? (
                    <Text
                      style={{
                        fontSize: 12,
                        color: constants.app_button_color,
                      }}>
                      OJT
                    </Text>
                  ) : (
                    <Text
                      style={{fontSize: 12, color: constants.app_text_color}}>
                      OJT
                    </Text>
                  ),
                tabBarIcon: ({focused}) =>
                  focused ? (
                    <Image source={OJTactive} style={{height: 22, width: 22}} />
                  ) : (
                    <Image
                      source={OJTinActive}
                      style={{height: 22, width: 22, opacity: 0.5}}
                    />
                  ),
              })}
            />
          ) : (
            <Tab.Screen
              name="OJT"
              component={OJTBMStackScreen}
              options={({route}) => ({
                tabBarStyle: {display: getRouteName(route)},
                tabBarLabel: ({focused}) =>
                  focused ? (
                    <Text
                      style={{
                        fontSize: 12,
                        color: constants.app_button_color,
                      }}>
                      OJT
                    </Text>
                  ) : (
                    <Text
                      style={{fontSize: 12, color: constants.app_text_color}}>
                      OJT
                    </Text>
                  ),
                tabBarIcon: ({focused}) =>
                  focused ? (
                    <Image source={OJTactive} style={{height: 22, width: 22}} />
                  ) : (
                    <Image
                      source={OJTinActive}
                      style={{height: 22, width: 22, opacity: 0.5}}
                    />
                  ),
              })}
            />
          ))}
        <Tab.Screen
          name="Explore"
          component={ExploreStackScreen}
          options={({route}) => ({
            tabBarStyle: {display: getRouteName(route)},
            tabBarLabel: ({focused}) =>
              focused ? (
                <Text style={{fontSize: 12, color: constants.app_button_color}}>
                  Explore
                </Text>
              ) : (
                <Text style={{fontSize: 12, color: constants.app_text_color}}>
                  Explore
                </Text>
              ),
            tabBarIcon: ({focused}) =>
              focused ? (
                <Image source={exploreIcon} style={{height: 22, width: 22}} />
              ) : (
                <Image
                  source={notExpoloreIcon}
                  style={{height: 22, width: 22, opacity: 0.5}}
                />
              ),
          })}
        />
        <Tab.Screen
          name="Profile"
          component={SettingsStackScreen}
          options={({route}) => ({
            tabBarStyle: {display: getRouteName(route)},
            tabBarLabel: ({focused}) =>
              focused ? (
                <Text style={{fontSize: 12, color: constants.app_button_color}}>
                  Profile
                </Text>
              ) : (
                <Text style={{fontSize: 12, color: constants.app_text_color}}>
                  Profile
                </Text>
              ),
            tabBarIcon: ({focused}) =>
              focused ? (
                <Image source={profileIcon} style={{height: 22, width: 22}} />
              ) : (
                <Image
                  source={notProfileIcon}
                  style={{height: 22, width: 22, opacity: 0.5}}
                />
              ),
          })}
        />
      </Tab.Navigator>
    </SafeAreaProvider>
  );
}
