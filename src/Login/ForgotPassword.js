/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/destructuring-assignment */
import React, {useState, useEffect, useRef} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  Platform,
  TextInput,
  View,
  Modal,
  ActivityIndicator,
  TouchableHighlight,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import Amplify, {API} from 'aws-amplify';
import {CommonActions} from '@react-navigation/native';
import Constants from '../constants';
import config from '../../aws-exports';

const appLogo = require('../Assets/Images/logo.png');
const appLogoName = require('../Assets/Images/logowithname.png');
const emailIcon = require('../Assets/Images/name.png');
const backIcon = require('../Assets/Images/back.png');

const logoWidth = 145;
const logoHeight = 120;

export default function ForgotPasswordScreen(props) {
  const {navigation, onDismissLoadingCallback, route} = props;
  const [email, setEmail] = useState('');
  // const [navfrom] = useState(navigation.getParam('navfrom', null));
  const {navfrom} = route.params;
  const [status, setStatus] = useState(false);
  const [validation, setValidation] = useState('');
  const [spinner, setSpinner] = useState(false);
  // const [orgURL] = useState(`${Constants.AWS_IMAGES_URL}${config.aws_org_id.toLowerCase()}-resources/images/org-images/${config.aws_org_id}.png`);
  const networkStatusRef = useRef(true);

  useEffect(() => {
    const unsubscribe = (ForgotPasswordScreen.navListener =
      navigation.addListener('didFocus', () => {
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('#FFFFFF');
          StatusBar.setTranslucent(true);
        }
        handleConnectivityChange(state.isInternetReachable);
      }));
    return () => {
      // ForgotPasswordScreen.navListener.remove();
      unsubscribe();
    };
  }, []);

  function onChangeText(value) {
    setValidation('');
    setStatus(false);
    setEmail(value);
  }

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack());
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
      // fetchMytopicsDataset();
    }
  }

  async function resetPWDButtonPressed() {
    if (email.trim() === '') {
      setValidation('Please enter employee id');
      setStatus(true);
      return;
    }
    setValidation('');
    setStatus(false);
    setSpinner(false);
    try {
      const bodyParam = {
        body: {
          id: email.toUpperCase(),
          schema: config.aws_schema,
          company_name: 'SPANDANA SPHOORTY',
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          // Authorization: jwttoken,
        },
      };

      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/forgot-password',
        bodyParam,
      );
      console.log(JSON.stringify(response));
      if (response.statusCode === 200) {
        navigation.navigate('ConfirmForgotPassword', {
          username: email.toUpperCase(),
        });
      } else {
        setValidation(response.body.message);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View
        style={styles.container}
        pointerEvents={!networkStatusRef.current ? 'none' : 'auto'}>
        <View style={styles.statusBar}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#FFFFFF"
            translucent={true}
          />
        </View>
        <Modal
          animationType="none"
          transparent={true}
          visible={spinner}
          onRequestClose={onDismissLoadingCallback}>
          <View style={styles.spinnerStyle}>
            <ActivityIndicator
              animating={true}
              size="large"
              color={Constants.app_button_color}
            />
          </View>
        </Modal>
        <View style={{flex: 1}}>
          <View
            style={{
              justifyContent: 'center',
              alignSelf: 'center',
              width: '90%',
            }}>
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}>
              <View style={styles.holderView}>
                <View style={styles.logoHolder}>
                  <Image source={appLogoName} style={styles.logoStyle} />
                </View>
                <View style={styles.msgHolder}>
                  <Text style={[styles.headerText, styles.appFontFamily]}>
                    Forgot password?
                  </Text>
                </View>
                <View style={{alignItems: 'center', marginBottom: 10}}>
                  <Text style={[styles.validationText, styles.appFontFamily]}>
                    {validation}
                  </Text>
                </View>
                <View style={styles.textfieldHolder}>
                  <View style={styles.textfieldStyle}>
                    <Image
                      source={emailIcon}
                      style={{
                        marginLeft: 30,
                        marginRight: 10,
                        marginTop: 9,
                        width: 25,
                        height: 25,
                      }}
                    />
                    <TextInput
                      underlineColorAndroid="transparent"
                      style={styles.input}
                      placeholderTextColor={Constants.app_placeholder_color}
                      returnKeyType="done"
                      placeholder="Enter employee ID"
                      onSubmitEditing={() => resetPWDButtonPressed()}
                      autoCapitalize="none"
                      onChangeText={val => onChangeText(val)}
                      onFocus={() => setStatus(false)}
                    />
                  </View>
                </View>
                <View style={styles.buttonHolder}>
                  <TouchableHighlight
                    onPress={() => resetPWDButtonPressed()}
                    underlayColor="transparent"
                    style={[
                      styles.buttonStyle,
                      {backgroundColor: Constants.app_button_color},
                    ]}>
                    <Text style={styles.resetPWDText}>Next</Text>
                  </TouchableHighlight>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
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
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
  },
  screenstyle: {
    width: '100%',
    height: '100%',
  },
  navigatioBar: {
    height: 45,
    borderColor: 'white',
    marginLeft: -3,
    marginRight: -3,
    borderTopWidth: 0,
    borderBottomWidth: 5,
    shadowColor: 'white',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0,
    shadowRadius: 0,
    ...Platform.select({
      android: {
        marginTop: -1,
      },
    }),
  },
  backButton: {
    width: 25,
    height: 25,
    tintColor: '#000000',
    alignSelf: 'center',
  },
  toolBarHolder: {
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        marginTop: -35,
      },
      android: {
        marginTop: -30,
      },
    }),
  },
  headerStyle: {
    marginLeft: 12,
    width: Constants.app_width - 60,
    textDecorationStyle: 'solid',
    fontWeight: '700',
    color: Constants.app_text_color,
    fontSize: 16,
    ...Platform.select({
      ios: {
        marginTop: 2,
      },
      android: {
        marginTop: 0,
      },
    }),
  },
  buttonHolderLink: {
    // marginTop: 95,
    width: 240,
    height: 50,
    bottom: 5,
    alignSelf: 'center',
    justifyContent: 'flex-end',
  },
  uniHolder: {
    marginHorizontal: 30,
    marginBottom: 0,
    // marginTop: 15,
    alignItems: 'center',
  },
  MsgUniText: {
    color: Constants.app_text_color,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '700',
  },
  buttonText: {
    color: Constants.app_text_color,
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 15,
    fontFamily: Constants.app_font_family_regular,
    textDecorationLine: 'underline',
  },
  spinnerStyle: {
    top: Constants.app_height / 2 - 20,
    height: 100,
    width: 100,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  appFontFamily: {
    fontFamily: Constants.app_font_family_regular,
  },
  holderView: {
    marginTop: Constants.app_height * 0.15,
    width: '90%',
    marginLeft: '5%',
    marginRight: '5%',
  },
  logoHolder: {
    marginTop: 70,
    marginBottom: 0,
    position: 'absolute',
    alignSelf: 'center',
    // top: (Constants.app_height / 6),
  },
  logoStyle: {
    width: logoWidth,
    height: logoHeight,
  },
  msgHolder: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 10,
    marginTop: 210,
    alignItems: 'center',
  },
  headerText: {
    color: Constants.app_button_color,
    fontSize: 19,
    textAlign: 'center',
  },
  msgText: {
    color: Constants.app_text_color,
    fontSize: 14,
    textAlign: 'center',
  },
  validationText: {
    // position: 'absolute',
    color: 'red',
    fontSize: 11,
    // marginLeft: 62,
  },
  textfieldHolder: {
    height: 60,
    marginBottom: 10,
    marginLeft: 15,
    marginRight: 15,
    flexDirection: 'column',
    backgroundColor: 'transparent',
    borderColor: 'grey',
    borderWidth: 0.1,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .3)',
        shadowOffset: {height: 1, width: 0},
        shadowOpacity: 5,
        shadowRadius: 5,
      },
      android: {
        shadowColor: 'rgba(0,0,0, .3)',
        shadowOpacity: 5,
        elevation: 2,
      },
    }),
  },
  textfieldStyle: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  bottomLineStyle: {
    width: '80%',
    height: 1,
    alignSelf: 'center',
    backgroundColor: Constants.app_grey_color,
  },
  input: {
    flex: 1,
    marginLeft: 3,
    marginTop: 9,
    color: '#424242',
    ...Platform.select({
      android: {
        fontSize: 14,
      },
      ios: {
        fontSize: 16,
      },
    }),
    fontFamily: Constants.app_font_family_regular,
    padding: 0,
  },
  buttonHolder: {
    marginTop: 40,
    height: 50,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  buttonStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  resetPWDText: {
    color: Constants.app_button_text_color,
    fontSize: 20,
    fontFamily: Constants.app_font_family_regular,
    ...Platform.select({
      ios: {
        fontWeight: 'bold',
      },
    }),
    ...Platform.select({
      android: {
        justifyContent: 'center',
        marginBottom: 1.5,
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
});
