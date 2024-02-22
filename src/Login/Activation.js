import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
  Modal,
  ActivityIndicator,
  TouchableHighlight,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
  Image,
  TouchableOpacity
} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import {Auth} from 'aws-amplify';
import Constants from '../constants';

const backIcon = require('../Assets/Images/back.png');
const passwordIcon = require('../Assets/Images/password.png');
const appLogo = require('../Assets/Images/logo.png');
const mandatoryIcon = require('../Assets/Images/required.png');
const eyeIcon = require('../Assets/Images/eye.png');
const closeEyeIcon = require('../Assets/Images/eyeClose.png');
const appLogoName = require('../Assets/Images/logowithname.png');

const smallIcon = 20;
const logoWidth = 145;
const logoHeight = 120;

export default function ActivationScreen(props) {
  const {navigation, onDismissLoadingCallback, route} = props;
  // const [navfrom] = useState(navigation.getParam('navfrom', null));
  // const [username] = useState(navigation.getParam('username', null));
  // const [fromForgotPwdScreen] = useState(navigation.getParam('fromForgotPwdScreen', false));
  const {navfrom} = route.params;
  const {username} = route.params;
  const {fromForgotPwdScreen} = route.params;
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmpassword] = useState('');
  const [validation, setValidation] = useState('');
  const [status, setStatus] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [num3, setNum3] = useState('');
  const [num4, setNum4] = useState('');
  const [num5, setNum5] = useState('');
  const [num6, setNum6] = useState('');
  const focusPassword = useRef(null);
  const focusNum1 = useRef(null);
  const focusNum2 = useRef(null);
  const focusNum3 = useRef(null);
  const focusNum4 = useRef(null);
  const focusNum5 = useRef(null);
  const focusNum6 = useRef(null);
  const [isSecureEntry, setIdSecureEntry] = useState(true);
  const [isNextSecureEntry, setIdNextSecureEntry] = useState(true);

  useEffect(() => {
    const unsubscribe = (ActivationScreen.navListener = navigation.addListener(
      'didFocus',
      () => {
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('#FFFFFF');
          StatusBar.setTranslucent(true);
        }
      },
    ));
    return () => {
      unsubscribe();
    };
  }, []);

  function onChangeNum1(value) {
    if (value) {
      focusNum1.current.focus();
    }
    setStatus(false);
    setValidation('');
    setNum1(value);
  }
  function onChangeNum2(value) {
    if (value) {
      focusNum2.current.focus();
    }
    setStatus(false);
    setValidation('');
    setNum2(value);
  }
  function onChangeNum3(value) {
    if (value) {
      focusNum3.current.focus();
    }
    setStatus(false);
    setValidation('');
    setNum3(value);
  }
  function onChangeNum4(value) {
    if (value) {
      focusNum4.current.focus();
    }
    setStatus(false);
    setValidation('');
    setNum4(value);
  }
  function onChangeNum5(value) {
    if (value) {
      focusNum5.current.focus();
    }
    setStatus(false);
    setValidation('');
    setNum5(value);
  }
  function onChangeNum6(value) {
    if (value) {
      focusNum6.current.focus();
    }
    setStatus(false);
    setValidation('');
    setNum6(value);
  }
  function onChangePassword(value) {
    setStatus(false);
    setValidation('');
    setPassword(value);
  }
  function onChangeConfirmPassword(value) {
    setStatus(false);
    setValidation('');
    setConfirmpassword(value);
  }

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack());
  }

  function resendCodePressed() {
    Auth.resendSignUp(username)
      .then(res => {
        const msg = `Verification Code has been sent to Registered ${res.CodeDeliveryDetails.AttributeName} ID ${res.CodeDeliveryDetails.Destination}`;
        setValidation(msg);
        setStatus(true);
      })
      .catch(err => {
        Alert.alert(
          '',
          err.message,
          [{text: 'Ok', onPress: () => console.log('Ok Pressed')}],
          {cancelable: false},
        );
      });
  }

  function activateButtonPressed() {
    const specialCharacters = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
    const numberCharacters = /[1234567890]/;
    const alphaCharacters = /[abcdefghijklmnopqrstuvwxyz]/;

    if (fromForgotPwdScreen) {
      if (
        num1.trim() === '' ||
        num2.trim() === '' ||
        num3.trim() === '' ||
        num4.trim() === '' ||
        num5.trim() === '' ||
        num6.trim() === ''
      ) {
        setValidation('Enter Verification Code');
        setStatus(true);
        return;
      }
      if (password.trim() === '') {
        setValidation('Enter Password');
        setStatus(true);
        return;
      }
      if (password.indexOf(' ') >= 0) {
        setValidation('Password should not contain space');
        setStatus(true);
        return;
      }
      if (password.trim().length < 7) {
        setValidation('Password length should be more than 7 characters');
        setStatus(true);
        return;
      }
      if (
        !specialCharacters.test(password) ||
        !numberCharacters.test(password) ||
        !alphaCharacters.test(password)
      ) {
        setValidation('Invalid Password Format');
        setStatus(true);
        return;
      }
      if (confirmpassword.trim() === '') {
        setValidation('Confirm Password');
        setStatus(true);
        return;
      }
      if (password.trim() !== confirmpassword.trim()) {
        setValidation('Password Mismatch');
        setStatus(true);
        return;
      }
    }
    setValidation(null);
    setStatus(false);
    setSpinner(true);
    const verificationCode =
      num1.trim() +
      num2.trim() +
      num3.trim() +
      num4.trim() +
      num5.trim() +
      num6.trim();
    if (verificationCode) {
      if (fromForgotPwdScreen) {
        Auth.forgotPasswordSubmit(username, verificationCode, password.trim())
          .then(() => {
            setSpinner(false);
            setTimeout(() => {
              Alert.alert(
                '',
                'Password has been changed successfully',
                [
                  {
                    text: 'Ok',
                    onPress: () => {
                      if (navfrom === 'login') {
                        navigation.navigate('Login');
                      }
                    },
                  },
                ],
                {cancelable: false},
              );
            }, 500);
          })
          .catch(err => {
            let errMessage;
            if (
              err.message ===
              'Password does not conform to policy: Password must have lowercase characters.'
            ) {
              errMessage = 'Invalid Password Format';
            } else if (
              err.message ===
              'Invalid verification code provided, please try again.'
            ) {
              errMessage = 'Invalid verification code. Try again';
            } else if (err.message === 'Network error') {
              errMessage = 'No internet connectivity';
            }
            setSpinner(false);
            setValidation(errMessage);
            setStatus(true);
          });
      } else {
        Auth.confirmSignUp(username, verificationCode)
          .then(() => {
            setSpinner(false);
            Alert.alert(
              '',
              'SignUp completed successfully.',
              [
                {
                  text: 'Ok',
                  onPress: () => {
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        key: null,
                        // actions: [NavigationActions.navigate({ routeName: 'Login' })],
                        routes: [
                          // {
                          //   name: 'Profile',
                          //   params: { user: 'jane', key: route.params.key },
                          // },
                          {name: 'Login'},
                        ],
                      }),
                    );
                  },
                },
              ],
              {cancelable: false},
            );
          })
          .catch(err => {
            setSpinner(false);
            setValidation(err.message);
            setStatus(true);
          });
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
        {/* <Toolbar
          left={(
            <View style={styles.toolBarHolder}>
              <TouchableHighlight underlayColor="transparent" onPress={() => onBackPressed()}>
                <Image source={backIcon} style={styles.backButton} />
              </TouchableHighlight>
            </View>
          )}
        /> */}
        <Modal
          animationType="none"
          transparent
          visible={spinner}
          onRequestClose={onDismissLoadingCallback}>
          <View style={styles.spinnerStyle}>
            <ActivityIndicator
              animating
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
            <View style={styles.holderView}>
              <View style={styles.logoHolder}>
                <Image source={appLogoName} style={styles.logoStyle} />
              </View>
              <View style={styles.msgTextHolder}>
                <Text style={[styles.msgText, styles.appFontFamily]}>
                  Please enter the verification code sent to your email / phone
                  number
                </Text>
              </View>
              <View style={styles.validationTextHolder}>
                {status ? (
                  <Text style={[styles.validationText, styles.appFontFamily]}>
                    {validation}
                  </Text>
                ) : null}
              </View>
              <View style={styles.numericTextfieldStyle}>
                <TextInput
                  underlineColorAndroid="transparent"
                  maxLength={1}
                  style={[styles.otpInput, styles.appFontFamily]}
                  returnKeyType="next"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  onChangeText={val => onChangeNum1(val)}
                  onFocus={() => setStatus(false)}
                />
                <TextInput
                  ref={focusNum1}
                  underlineColorAndroid="transparent"
                  maxLength={1}
                  style={[styles.otpInput, styles.appFontFamily]}
                  returnKeyType="next"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  onChangeText={val => onChangeNum2(val)}
                  onFocus={() => setStatus(false)}
                />
                <TextInput
                  ref={focusNum2}
                  underlineColorAndroid="transparent"
                  maxLength={1}
                  style={[styles.otpInput, styles.appFontFamily]}
                  returnKeyType="next"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  onChangeText={val => onChangeNum3(val)}
                  onFocus={() => setStatus(false)}
                />
                <TextInput
                  ref={focusNum3}
                  underlineColorAndroid="transparent"
                  maxLength={1}
                  style={[styles.otpInput, styles.appFontFamily]}
                  returnKeyType="next"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  onChangeText={val => onChangeNum4(val)}
                  onFocus={() => setStatus(false)}
                />
                <TextInput
                  ref={focusNum4}
                  underlineColorAndroid="transparent"
                  maxLength={1}
                  style={[styles.otpInput, styles.appFontFamily]}
                  returnKeyType="next"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  onChangeText={val => onChangeNum5(val)}
                  onFocus={() => setStatus(false)}
                />
                <TextInput
                  ref={focusNum5}
                  underlineColorAndroid="transparent"
                  maxLength={1}
                  style={[styles.otpInput, styles.appFontFamily]}
                  returnKeyType="next"
                  keyboardType="numeric"
                  blurOnSubmit={false}
                  onChangeText={val => onChangeNum6(val)}
                  onFocus={() => setStatus(false)}
                />
              </View>

              <View>
                {fromForgotPwdScreen ? (
                  <View>
                    <View style={styles.textfieldHolder}>
                      <View style={styles.textfieldStyle}>
                        <Image
                          source={passwordIcon}
                          style={styles.passwordIconStyle}
                        />
                        <TextInput
                          onSubmitEditing={() => focusPassword.current.focus()}
                          ref={focusNum6}
                          placeholderTextColor={Constants.app_placeholder_color}
                          underlineColorAndroid="transparent"
                          style={[styles.input, styles.appFontFamily]}
                          returnKeyType="next"
                          placeholder="New password"
                          blurOnSubmit={false}
                          secureTextEntry={isSecureEntry}
                          onChangeText={val => onChangePassword(val)}
                          onFocus={() => setStatus(false)}
                        />
                        <TouchableOpacity
                          style={{marginRight: 10}}
                          onPress={() => setIdSecureEntry(prev => !prev)}>
                          {isSecureEntry ? (
                            <Image
                              source={eyeIcon}
                              style={styles.eyeIconStyle}
                            />
                          ) : (
                            <Image
                              source={closeEyeIcon}
                              style={styles.eyeIconStyle}
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={[styles.textfieldHolder, {marginTop: 10}]}>
                      <View style={styles.textfieldStyle}>
                        <Image
                          source={passwordIcon}
                          style={styles.passwordIconStyle}
                        />
                        <TextInput
                          onSubmitEditing={() => activateButtonPressed()}
                          ref={focusPassword}
                          placeholderTextColor={Constants.app_placeholder_color}
                          underlineColorAndroid="transparent"
                          style={[styles.input, styles.appFontFamily]}
                          returnKeyType="done"
                          placeholder="Confirm password"
                          secureTextEntry={isNextSecureEntry}
                          onChangeText={val => onChangeConfirmPassword(val)}
                          onFocus={() => setStatus(false)}
                        />
                        <TouchableOpacity
                          style={{marginRight: 10}}
                          onPress={() => setIdNextSecureEntry(prev => !prev)}>
                          {isNextSecureEntry ? (
                            <Image
                              source={eyeIcon}
                              style={styles.eyeIconStyle}
                            />
                          ) : (
                            <Image
                              source={closeEyeIcon}
                              style={styles.eyeIconStyle}
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.pwdMsgHolder}>
                      <Text style={[styles.pwdMsgText, styles.appFontFamily]}>
                        Password should have at least 8 characters, letter, one
                        number & one special character
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
              <View style={styles.buttonHolder}>
                <TouchableHighlight
                  onPress={() => activateButtonPressed()}
                  underlayColor="transparent"
                  style={[
                    styles.buttonStyle,
                    {backgroundColor: Constants.app_button_color},
                  ]}>
                  <Text style={styles.activateText}>Reset</Text>
                </TouchableHighlight>
              </View>
              {fromForgotPwdScreen ? null : (
                <View style={styles.plainButtonStyle}>
                  <TouchableHighlight
                    onPress={() => resendCodePressed()}
                    underlayColor="transparent">
                    <Text style={[styles.resendCodeText, styles.appFontFamily]}>
                      Resend Code
                    </Text>
                  </TouchableHighlight>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.app_background_color,
    justifyContent: 'flex-start',
  },
  screenstyle: {
    width: '100%',
    height: '100%',
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
  toolbar: {
    flexDirection: 'row',
    width: Constants.app_width,
    ...Platform.select({
      ios: {
        height: Constants.app_toolbar_height,
        paddingTop: Constants.app_toolbar_position,
      },
      android: {
        height: 45,
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
  appFontFamily: {
    fontFamily: Constants.app_font_family_regular,
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
  msgTextHolder: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  holderView: {
    marginTop: Constants.app_height * 0.15,
    width: '90%',
    marginLeft: '5%',
    marginRight: '5%',
  },
  msgText: {
    color: 'grey',
    fontSize: 14,
    textAlign: 'center',
  },
  textfieldStyle: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buttonHolderLink: {
    // marginTop: 95,
    width: 240,
    height: 50,
    bottom: 5,
    alignSelf: 'center',
    justifyContent: 'flex-end',
  },
  buttonText: {
    color: Constants.app_text_color,
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 15,
    fontFamily: Constants.app_font_family_regular,
    textDecorationLine: 'underline',
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
  bottomLineStyle: {
    height: 1,
    backgroundColor: Constants.app_grey_color,
  },
  passwordIconStyle: {
    marginLeft: 10,
    marginRight: 11,
    marginTop: 10,
    width: 15,
    height: smallIcon,
    tintColor: Constants.app_button_color
  },
  eyeIconStyle: {
    marginLeft: 10,
    marginRight: 11,
    marginTop: 10,
    width: 15,
    height: smallIcon,
  },
  buttonStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
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
  logoHolder: {
    alignSelf: 'center',
    marginTop: 10,
  },
  logoStyle: {
    width: logoWidth,
    height: logoHeight,
  },
  MsgUniText: {
    color: Constants.app_text_color,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '700',
  },
  otpInput: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    textAlign: 'center',
    fontSize: 18,
    borderWidth: 1,
    borderColor: Constants.app_grey_color,
  },
  requiredIcon: {
    marginLeft: 5,
    marginRight: 5,
    //marginTop: 13,
    width: 15,
    height: 15,
  },
  numericTextfieldStyle: {
    height: 40,
    marginLeft: 30,
    marginRight: 30,
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  validationTextHolder: {
    marginLeft: 10,
    marginRight: 15,
    marginTop: 5,
    marginBottom: 15,
  },
  validationText: {
    marginLeft: 20,
    position: 'absolute',
    color: 'red',
    fontSize: 11,
    // justifyContent: 'center',
    // alignSelf: 'center',
    fontFamily: Constants.app_font_family_regular,
  },
  buttonHolder: {
    marginTop: 35,
    width: '90%',
    height: 50,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  buttonStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  activationButtonStyle: {
    width: '70%',
    height: '100%',
  },
  activateText: {
    color: Constants.app_button_text_color,
    fontSize: 19,
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
  pwdMsgHolder: {
    width: '75%',
    alignSelf: 'center',
    marginTop: 0,
    alignItems: 'flex-start',
  },
  pwdMsgText: {
    color: Constants.app_button_color,
    fontSize: 11,
  },
  plainButtonStyle: {
    backgroundColor: 'transparent',
    margin: 15,
    height: 50,
  },
  resendCodeText: {
    color: 'grey',
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 16,
    fontFamily: Constants.app_font_family_regular,
    margin: 15,
  },
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight,
      },
    }),
  },
});
