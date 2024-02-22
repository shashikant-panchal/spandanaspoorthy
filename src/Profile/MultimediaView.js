/* eslint-disable max-len */
import React, {useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableHighlight,
  Image,
  StatusBar,
  ScrollView,
  Linking,
} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Constants from '../constants';
import Toolbar from './Toolbar';

const backIcon = require('../Assets/Images/back.png');

export default function MultimediaViewScreen(props) {
  const {navigation, route} = props;
  const {selectedText} = route.params;
  // const selectedText = navigation.getParam('selectedText', null);
  useEffect(() => {
    const unsubscribe = (MultimediaViewScreen.navListener =
      navigation.addListener('didFocus', () => {
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(Constants.app_statusbar_color);
          StatusBar.setTranslucent(true);
        }
      }));

    return () => {
      unsubscribe();
    };
  }, []);

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack());
  }

  // let headerName;
  // if (selectedText === 'Help and Support') {
  //   headerName = 'HELP AND SUPPORT';
  // } else if (selectedText === 'Feedback') {
  //   headerName = 'FEEDBACK';
  // } else if (selectedText === 'Terms and Conditions') {
  //   headerName = 'TERMS AND CONDITIONS';
  // }
  return (
    <View style={styles.container}>
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
                  {selectedText}
                </Text>
              </View>
            </View>
          }
        />

        {selectedText === 'Help & Support' ? (
          <ScrollView style={styles.container2}>
            <View
              style={{
                flex: 1,
                margin: 20,
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'stretch',
              }}>
              <Text
                style={[styles.textParagraph, {fontSize: 18}]}
                scalesPageToFit>
                For any queries, Contact
              </Text>

              <Text
                style={[
                  styles.textLinkParagraph,
                  {fontSize: 18, marginTop: 10},
                ]}
                scalesPageToFit>
                <Text
                  onPress={() =>
                    Linking.openURL('mailto:support-ssfl@enhanzed.com')
                  }
                  style={[styles.buttonText, {fontWeight: '400'}]}>
                  support-ssfl@enhanzed.com
                </Text>
              </Text>
            </View>
          </ScrollView>
        ) : null}

        {/* <View style={[styles.spinnerStyle, { display: isVisible }]}>
        <ActivityIndicator animating={spinner} size="large" color={Constants.app_button_color} />
      </View> */}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight - 5,
      },
    }),
  },
  screenstyle: {
    flex: 1,
    width: '100%',
    height: '100%',
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
  backButton: {
    width: 25,
    height: 25,
    tintColor: '#000000',
    alignSelf: 'center',
  },
  header: {
    fontSize: 35,
    paddingTop: 40,
    justifyContent: 'center',
    fontWeight: 'bold',
    fontFamily: Constants.app_font_family_regular,
    color: '#000000',
  },
  textheader: {
    marginVertical: 10,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Constants.app_font_family_regular,
    color: '#e77c2d',
    // textDecorationLine: 'underline',
  },
  textLine: {
    paddingLeft: 20,
    fontSize: 20,
    fontFamily: Constants.app_font_family_regular,
    color: '#000000',
  },
  textParagraph: {
    fontSize: 15,
    flexDirection: 'row',
    // flexWrap: 'wrap',
    textAlign: 'justify',
    fontFamily: Constants.app_font_family_regular,
    color: '#000000',
  },
  textLinkParagraph: {
    fontSize: 15,
    textAlign: 'justify',
    fontFamily: Constants.app_font_family_regular,
    color: '#000000',
    textDecorationLine: 'underline',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  container1: {
    flex: 1,
  },
  container2: {
    flex: 1,
    margin: 5,
  },
  spinnerStyle: {
    height: 20,
    width: 20,
    padding: 120,
    top: -180,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // flexWrap: 'wrap',
    flex: 1,
    marginVertical: 4,
  },
  bullet: {
    marginLeft: 10,
  },
  bulletText: {
    flex: 1,
    marginRight: 10,
  },
});
