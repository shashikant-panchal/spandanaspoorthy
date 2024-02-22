import React from 'react';
import {
  StyleSheet, View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Constants from '../constants';

export default function Toolbar(props) {
  const {
    left,
    center,
    right,
    bgColor = [Constants.app_toolbar_color, Constants.app_toolbar_color],
    height,
  } = props;

  return (
    <View style={styles.toolbarStyle}>
    <LinearGradient
      colors={bgColor}
      style={styles.linearGradient}
    >
      <View style={styles.mainView}>
        <View style={styles.left}>{left}</View>
        <View style={styles.center}>
          {center}
        </View>
        <View style={styles.right}>{right}</View>
      </View>
    </LinearGradient>
    </View>

  );
}


const styles = StyleSheet.create({
  linearGradient: {
    paddingTop: 45,
    ...Platform.select({
      android: {
        paddingTop: 30,
      },
    }),
    flex: 1,
    // flexDirection: 'column',
  },
  toolbarStyle: {
    paddingTop:40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: '#c0c0c0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 3,
    elevation: 5,
  },
  mainView :{
    justifyContent: 'center',
    // marginBottom: 10
  },
  left: {
    // backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  right: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 20,
  },
  center: {
    marginTop: -20,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 50,
    alignSelf: 'center',
  },
});
