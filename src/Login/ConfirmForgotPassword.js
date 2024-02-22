import React, {useState, useEffect, useRef} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  StatusBar,
  Platform,
  BackHandler,
  Modal,
  ActivityIndicator,
  TouchableHighlight,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
} from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import Amplify, {API} from 'aws-amplify';
import Constants from '../constants';
import config from '../../aws-exports';
import {useSelector} from 'react-redux';
import {authData} from '../redux/auth/authSlice';

const logoWidth = 145;
const logoHeight = 120;
const smallIcon = 20;

const passwordIcon = require('../Assets/Images/password.png');
const appLogo = require('../Assets/Images/logo.png');
const appLogoName = require('../Assets/Images/logowithname.png');
const eyeIcon = require('../Assets/Images/eye.png');
const closeEyeIcon = require('../Assets/Images/eyeClose.png');
const emailIcon = require('../Assets/Images/mail.png');
const phoneIcon = require('../Assets/Images/phone.png');

export default function ConfirmForgotPasswordScreen(props) {
  const {navigation, onDismissLoadingCallback, route} = props;

  const {username, password, body} = route.params;
  const [states, setStates] = useState({
    // email: (email1, null),
    // firstPassword: (firstPassword1, null),
    password: '',
    cnfPassword: '',
    code: '',
    users: {},
    spinner: false,
    status: false,
    validation: '',
  });
  const numberInput = useRef();
  const focusHere = useRef(null);
  const [isSecureEntry, setIdSecureEntry] = useState(true);
  const [isNextSecureEntry, setIdNextSecureEntry] = useState(true);
  let userDetails = useSelector(authData);

  useEffect(() => {
    // console.log("-------" +JSON.stringify(userdata))
    getInitialState();
    const unsubscribe = NetInfo.addEventListener(state => {
      handleConnectivityChange(state.isInternetReachable);
    });
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    ConfirmForgotPasswordScreen.navListener = navigation.addListener(
      'didFocus',
      () => {
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('#FFFFFF');
          StatusBar.setTranslucent(true);
        }
      },
    );
    return () => {
      removeBackPressListner();
      unsubscribe();
    };
  }, []);

  function handleBackButton() {
    return true;
  }

  function removeBackPressListner() {
    BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
  }

  function getInitialState() {
    NetInfo.fetch().then(state => {
      if (state.isConnected === true) {
        setStates({
          ...states,
          loaded: false,
          spinner: false,
          connection_Status: true,
        });
      } else {
        setStates({
          ...states,
          loaded: false,
          spinner: false,
          connection_Status: false,
        });
      }
    });
  }

  function handleConnectivityChange(isConnected) {
    if (isConnected === false) {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      });
      setStates({
        ...states,
        connection_Status: false,
        spinner: false,
      });
    } else {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      });
      setStates({
        ...states,
        connection_Status: true,
      });
    }
  }

  function onChangeNumberText(value) {
    setStates({
      ...states,
      status: false,
      validation: '',
      code: value.replace(/\s/g, ''),
    });
  }

  function onChangeFirstPassword(value) {
    setStates({
      ...states,
      status: false,
      validation: '',
      password: value,
    });
  }

  function onChangeConfirmPassword(value) {
    setStates({
      ...states,
      status: false,
      validation: '',
      cnfPassword: value,
    });
  }

  async function signUpButtonPressed() {
    // alert("hi")
    const emailCharacters = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const specialCharacters = /[ !@#$%^&*()_+\-=[\]{};':"\\|,.<>/? ]/;
    const numberCharacters = /[1234567890]/;
    const alphaCharacters = /[abcdefghijklmnopqrstuvwxyz]/;
    if (states.code.trim() === '') {
      setStates({
        ...states,
        validation: 'Please enter code',
        status: true,
      });
      return;
    } else if (states.password.trim().length < 8) {
      setStates({
        ...states,
        validation: 'Password length should be more than 7 characters',
        status: true,
      });
      return;
    } else if (states.cnfPassword.trim() === '') {
      setStates({
        ...states,
        validation: 'Confirm password',
        status: true,
      });
      return;
    } else if (states.password.trim() !== states.cnfPassword.trim()) {
      setStates({
        ...states,
        validation: ' Passwords do not match',
        status: true,
      });
      return;
    } else if (
      !specialCharacters.test(states.password) ||
      !numberCharacters.test(states.password) ||
      !alphaCharacters.test(states.password)
    ) {
      setStates({
        ...states,
        validation: 'Invalid password format',
        status: true,
      });
      return;
    } else {
      setStates({
        ...states,
        validation: null,
        status: false,
        spinner: true,
      });
      try {
        // console.log('username in local ' +JSON.stringify(userdata));

        // let username = userdata?.username;
        const bodyParam = {
          body: {
            id: username.toUpperCase(),
            password: states?.password,
            confirmPassword: states?.cnfPassword,
            otp: states?.code,
            schema: config.aws_schema,
          },
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            // Authorization: jwttoken,
          },
        };
        // alert(JSON.stringify(bodyParam.body))
        const response = await API.post(
          config.aws_cloud_logic_custom_name,
          '/confirm-forgot-password',
          bodyParam,
        );
        // alert(JSON.stringify(response?.body?.data?.uid))
        if (response.statusCode === 200) {
          Alert.alert(
            '',
            'Password changed successfully',
            [
              {
                text: 'Ok',
                onPress: () => navigation.navigate('Login'),
              },
            ],
            {cancelable: false},
          );
        } else {
          let body = JSON.parse(response?.body);
          let code = body?.code;
          let message = body?.message;
          switch (code) {
            case 'BadRequestException':
              return setStates({
                ...states,
                validation: message,
                status: true,
              });
            case 'UserNotFoundException':
              return setStates({
                ...states,
                validation: message,
                status: true,
              });
            case 'InternalServerError':
              return setStates({
                ...states,
                validation: message,
                status: true,
              });
            case 'MSG91Error':
              return setStates({
                ...states,
                validation: message,
                status: true,
              });
            default:
              return false;
          }
        }
      } catch (err) {
        console.log('error adding user:', err);
        // setBtnLoading(false);
      }
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.statusBar}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="#FFFFFF"
            translucent
          />
        </View>
        <Modal
          animationType="none"
          transparent
          visible={states.spinner}
          onRequestClose={onDismissLoadingCallback}>
          <View style={styles.spinnerStyle}>
            <ActivityIndicator
              animating
              size="large"
              color={Constants.app_button_color}
            />
          </View>
        </Modal>
        {/* <View style={{ flex: 1 }}> */}
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
              <View style={styles.textboxView}>
                <View style={styles.statusHolder}>
                  {states.status ? (
                    <Text style={styles.validationText}>
                      {states.validation}
                    </Text>
                  ) : null}
                </View>
                <View style={[styles.textfieldHolder, {marginTop: 10}]}>
                  <View style={styles.textfieldStyle}>
                    <Image source={phoneIcon} style={styles.uriPasswordImage} />
                    <TextInput
                      autoFocus={true}
                      underlineColorAndroid="transparent"
                      placeholderTextColor="#424242"
                      style={styles.passwordInput}
                      ref={numberInput}
                      returnKeyType="next"
                      keyboardType="numeric"
                      placeholder="Verfication code"
                      blurOnSubmit={false}
                      autoCapitalize="none"
                      onFocus={() => setStates({...states, status: false})}
                      onSubmitEditing={() => passwordInput.current.focus()}
                      onChangeText={val => onChangeNumberText(val)}
                      // onSelectionChange={onSelectionChange}
                      // selection={selection}
                      // value={this.state.value}
                    />
                  </View>
                </View>
                <View style={styles.textfieldHolder}>
                  <View style={styles.textfieldStyle}>
                    <Image
                      source={passwordIcon}
                      style={styles.uriPasswordImage}
                    />
                    <TextInput
                      underlineColorAndroid="transparent"
                      placeholderTextColor="#424242"
                      style={styles.passwordInput}
                      returnKeyType="next"
                      placeholder="New password"
                      blurOnSubmit={false}
                      secureTextEntry={isSecureEntry}
                      onFocus={() => setStates({...states, status: false})}
                      onSubmitEditing={() => focusHere.current.focus()}
                      onChangeText={val => onChangeFirstPassword(val)}
                    />
                    <TouchableOpacity
                      style={{marginRight: 10}}
                      onPress={() => setIdSecureEntry(prev => !prev)}>
                      {isSecureEntry ? (
                        <Image
                          source={eyeIcon}
                          style={styles.passwordIconStyle}
                        />
                      ) : (
                        <Image
                          source={closeEyeIcon}
                          style={styles.passwordIconStyle}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={[styles.textfieldHolder, {marginTop: 0}]}>
                  <View style={styles.textfieldStyle}>
                    <Image
                      source={passwordIcon}
                      style={styles.passwordIconStyle}
                    />
                    <TextInput
                      ref={focusHere}
                      underlineColorAndroid="transparent"
                      style={styles.passwordInput}
                      returnKeyType="done"
                      placeholderTextColor="#424242"
                      placeholder="Confirm password"
                      onSubmitEditing={() => signUpButtonPressed()}
                      secureTextEntry={isNextSecureEntry}
                      onFocus={() => setStates({...states, status: false})}
                      onChangeText={val => onChangeConfirmPassword(val)}
                    />
                    <TouchableOpacity
                      style={{marginRight: 10}}
                      onPress={() => setIdNextSecureEntry(prev => !prev)}>
                      {isNextSecureEntry ? (
                        <Image
                          source={eyeIcon}
                          style={styles.passwordIconStyle}
                        />
                      ) : (
                        <Image
                          source={closeEyeIcon}
                          style={styles.passwordIconStyle}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.pwdMsgHolder}>
                  <Text style={[styles.pwdMsgText, styles.appFontFamily]}>
                    Password should have at least 8 characters, contain at least
                    one lowercase letter, one number & one special character
                  </Text>
                </View>
                <TouchableHighlight
                  key="login"
                  onPress={() => signUpButtonPressed()}
                  style={[
                    styles.buttonStyle,
                    {backgroundColor: Constants.app_button_color},
                  ]}
                  underlayColor="transparent">
                  <Text style={styles.loginText}>Sign Up</Text>
                </TouchableHighlight>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.app_background_color,
  },
  screenstyle: {
    width: '100%',
    height: '100%',
  },
  spinnerStyle: {
    position: 'absolute',
    top: Constants.app_height / 2 - 50,
    height: 100,
    width: 100,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  backButton: {
    //tintColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        marginTop: 25,
        width: 18,
        height: 18,
      },
      android: {
        marginTop: 8,
        width: 25,
        height: 25,
      },
    }),
  },
  logoHolder: {
    marginTop: 70,
    marginBottom: 0,
    position: 'absolute',
    alignSelf: 'center',
  },
  logoStyle: {
    width: logoWidth,
    height: logoHeight,
  },
  validationText: {
    // marginTop: -30,
    // marginBottom: 10,
    // marginLeft: 60,
    // position: 'absolute',
    marginHorizontal: 50,
    color: 'red',
    fontSize: 11,
    fontFamily: Constants.app_font_family_regular,
  },
  holderView: {
    // position: 'absolute',
    marginTop: Constants.app_height * 0.08,
    width: '90%',
    marginLeft: '5%',
    marginRight: '5%',
  },
  textboxView: {
    marginTop: 180,
    width: '90%',
    marginLeft: '5%',
    marginRight: '5%',
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
    height: 1,
    backgroundColor: Constants.app_grey_color,
  },
  passwordIconStyle: {
    marginLeft: 10,
    marginRight: 11,
    marginTop: 10,
    width: smallIcon,
    height: smallIcon,
  },
  passwordInput: {
    flex: 1,
    marginLeft: 2.9,
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
  uniHolder: {
    marginHorizontal: 30,
    marginBottom: 0,
    // marginTop: 15,
    alignItems: 'center',
  },
  msgText: {
    color: Constants.app_text_color,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '700',
  },
  pwdMsgHolder: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 15,
    alignItems: 'flex-start',
  },
  pwdMsgText: {
    color: Constants.app_button_color,
    fontSize: 11,
  },
  buttonHolder: {
    top: 30,
    width: '60%',
    height: 35,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  buttonStyle: {
    marginTop: 30,
    width: '90%',
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  loginText: {
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
  statusHolder: {
    // marginLeft: '15%',
    // marginRight: '10%',
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  singleView: {
    marginLeft: '15%',
    marginRight: '15%',
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uriPasswordImage: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 9,
    width: smallIcon,
    height: smallIcon,
  },
});
