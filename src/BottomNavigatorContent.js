import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {Drawer} from 'react-native-paper';
import {DrawerItem} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {authData} from './redux/auth/authSlice';
import {useSelector, useDispatch} from 'react-redux';

const logoWidth = 100;
const logoHeight = 23;

const appLogo = require('./Assets/Images/companyLogo.png');
const homeIcon = require('./Assets/Images/home.png');
const downloadIcon = require('./Assets/Images/download.png');
const certificateIcon = require('./Assets/Images/certificate.png');
const helpandsupportIcon = require('./Assets/Images/helpandsupport.png');
const profilePicture = require('./Assets/Images/profile_icon.png');

export function BottomNavigatorContent(props) {
  const dispatch = useDispatch();
  let userDetails = useSelector(authData);

  const navigation = useNavigation();
  // console.log("userDetailsNavigation " + JSON.stringify(userDetails.res[0].emailid));

  return (
    <View style={{flex: 1}}>
      <View style={styles.drawerContent}>
        <Drawer.Section style={styles.drawerSection}>
          <DrawerItem
            icon={() => (
              <Image
                style={{height: 28, width: 28, marginLeft: 2, marginRight: -28}}
                source={homeIcon}
              />
            )}
            label="  Home"
            onPress={() => {
              navigation.navigate('MyTopics');
            }}
          />
          <DrawerItem
            icon={() => (
              <Image
                style={{height: 25, width: 25, marginLeft: 2, marginRight: -25}}
                source={downloadIcon}
              />
            )}
            label="  Search"
            onPress={() => {
              navigation.navigate('MyTopics');
            }}
          />
          <DrawerItem
            icon={() => (
              <Image
                style={{height: 25, width: 25, marginLeft: 2, marginRight: -25}}
                source={downloadIcon}
              />
            )}
            label="  Downloads"
            onPress={() => {
              navigation.navigate('MyTopics');
            }}
          />
          <DrawerItem
            icon={() => (
              <Image
                style={{height: 25, width: 25, marginLeft: 6, marginRight: -20}}
                source={helpandsupportIcon}
              />
            )}
            label="Help & support"
            onPress={() => {
              navigation.navigate('Settings');
            }}
          />
        </Drawer.Section>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 10,
    backgroundColor: Constants.app_shade_color,
    height: 110,
  },
  title: {
    fontSize: 16,
    //marginTop: 3,
    fontWeight: 'bold',
    lineHeight: 20,
    width: 200,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    width: 180,
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bottomLineStyle: {
    height: 0.5,
    backgroundColor: Constants.app_grey_color,
    width: '87%',
    alignSelf: 'center',
  },
  appLogo: {
    width: logoWidth,
    height: logoHeight,
    ...Platform.select({
      ios: {
        marginTop: 5,
      },
      android: {
        marginTop: 7,
      },
    }),
  },
  profilePicture: {
    width: 50,
    height: 50,
    // marginTop: 0,
  },
});
