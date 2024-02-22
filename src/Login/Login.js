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
  Linking,
  TouchableOpacity,
} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import SInfo from 'react-native-sensitive-info';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import Amplify, {API} from 'aws-amplify';
import Constants from '../constants';
import config from '../../aws-exports';
import {awsSignIn} from '../redux/auth/authSlice';
import {useDispatch} from 'react-redux';

const logoWidth = 145;
const logoHeight = 120;
const myTopicsWidth = (Constants.app_width - 10) / 2 - 10;
let marginTop = 130;
if (myTopicsWidth <= 155 && Platform.OS === 'android') {
  marginTop = 100;
}

const appLogo = require('../Assets/Images/logo.png');
const emailIcon = require('../Assets/Images/name.png');
const passwordIcon = require('../Assets/Images/password.png');
const eyeIcon = require('../Assets/Images/eye.png');
const closeEyeIcon = require('../Assets/Images/eyeClose.png');
const appLogoName = require('../Assets/Images/logowithname.png');

async function urlOpener(url, redirectUrl) {
  await InAppBrowser.isAvailable();

  const {type, url: newUrl} = await InAppBrowser.openAuth(url, redirectUrl, {
    showTitle: false,
    enableUrlBarHiding: true,
    enableDefaultShare: false,
    ephemeralWebSession: false,
  });
  if (type === 'success') {
    Linking.openURL(newUrl);
  }
}

Amplify.configure({
  ...config,
  oauth: {
    ...config.oauth,
    urlOpener,
  },
});

export default function LoginScreen(props) {
  const [states, setStates] = useState({
    username: '',
    password: '',
    spinner: false,
    status: false,
    validation: '',
  });

  const {navigation, onDismissLoadingCallback} = props;
  const emailInput = useRef();
  const passwordInput = useRef();
  const clearEmail = () => emailInput.current.clear();
  const clearPassword = () => passwordInput.current.clear();
  const [user, setUser] = useState(null);
  const statusCode = useRef();
  const responseRef = useRef();
  const networkStatusRef = useRef(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSecureEntry, setIdSecureEntry] = useState(true);

  const dispatch = useDispatch();

  // useEffect(() => {
  //   Hub.listen('auth', ({ payload: { event, data } }) => {
  //     switch (event) {
  //       case 'signIn':
  //         break
  //       case 'cognitoHostedUI':
  //         setStates({
  //           ...states,
  //           spinner: true,
  //         })
  //         // getUser().then((userData) => setUser(userData))
  //         break
  //       case 'signOut':
  //         setUser(null)
  //         break
  //       case 'signIn_failure':
  //         break
  //       case 'cognitoHostedUI_failure':
  //         break
  //       case 'parsingCallbackUrl':
  //         if (data.url === null) {
  //           setStates({
  //             ...states,
  //             spinner: false,
  //           })
  //         }
  //         break
  //     }
  //   })
  // }, [])
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    // Amplify.configure(config);
    // Amplify.configure({ storage: AmplifyAuthStorage });
    const unsubscribe = (LoginScreen.navListener = navigation.addListener(
      'didFocus',
      () => {
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('transparent');
          StatusBar.setTranslucent(true);
        }
        handleConnectivityChange(state.isInternetReachable);
      },
    ));
    return () => {
      removeBackPressListner();
      unsubscribe();
    };
  }, []);

  // function getUser() {
  //   return Auth.currentAuthenticatedUser()
  //     .then((userData) => userData)
  //     .catch(() => console.log('Not signed in'))
  // }

  function handleBackButton() {
    return false;
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
    }
  }

  function removeBackPressListner() {
    BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
  }

  function onChangeEmailText(value) {
    setStates({
      ...states,
      status: false,
      validation: '',
      username: value.replace(/\s/g, ''),
    });
  }

  function onChangePasswordText(value) {
    setStates({
      ...states,
      status: false,
      validation: '',
      password: value,
    });
  }

  function forgotPwdButtonPressed() {
    clearEmail();
    clearPassword();
    setStates({
      ...states,
      password: '',
      validation: '',
      status: false,
    });
    removeBackPressListner();
    navigation.navigate('ForgotPassword', {navfrom: 'login'});
  }

  async function loginButtonPressed() {
    // const reg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (states.username.trim() === '') {
      setStates({
        ...states,
        validation: 'Please enter registration id',
        status: true,
      });
      return;
    }
    if (states.password.trim() === '') {
      setStates({
        ...states,
        validation: 'Please enter Password',
        status: true,
      });
      return;
    }
    setStates({
      ...states,
      validation: null,
      status: false,
      spinner: true,
    });
    removeBackPressListner();
    signIn(states.username, states.password);
  }

  async function signIn(getEmail, getPassword) {
    try {
      const bodyParam = {
        body: {
          id: getEmail.toUpperCase(),
          password: getPassword,
          schema: config.aws_schema,
          company_name: config.title,
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
        '/sign-in',
        bodyParam,
      );
      // alert(JSON.stringify(response))
      const {code, body, statusCode} = response;
      // alert(JSON.stringify(body))
      const message = body?.message;
      if (statusCode === 200) {
        const userdata = {};
        userdata.tenant = body.oid;
        userdata.locale = body.oid;
        userdata.uData = body;
        userdata.location = {};
        userdata.name = body?.name;
        userdata.sub = body.eid;
        userdata.username = body.eid;
        userdata.email = '';
        analyticsWebApp(userdata);
      }
      if (statusCode !== 200) {
        console.log(code);
        switch (code) {
          case 'UserNotFoundException':
            {
              setStates({
                ...states,
                validation: message,
                status: true,
              });
            }
            break;
          case 'AuthorizedForSignUp':
            {
              setStates({
                ...states,
                spinner: false,
              });
              navigation.navigate('SignUp', {
                username: states.username,
                password: states.password,
                body: body,
              });
            }
            break;
          case 'NotAuthorizedException':
            {
              setStates({
                ...states,
                validation: message,
                status: true,
              });
            }
            break;
          case 'PasswordResetRequiredException':
            navigation.navigate('ForgotPassword', {navfrom: 'login'});
            break;
          case 'UserNotConfirmedException':
            {
              setStates({
                ...states,
                spinner: false,
              });
              navigation.navigate('ConfirmSignUp', {
                username: getEmail,
                body: {...response.body},
              });
            }
            break;
          default:
            return false;
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function analyticsWebApp(userDetails) {
    let deviceToken;
    const getData = await SInfo.getItem('device_token', {});
    const deviceType = Platform.OS === 'ios' ? 2 : 1;
    if (getData) {
      deviceToken = getData;
      const bodyParam = {
        body: {
          oid: config.aws_org_id,
          eventtype: 'AuthenticatedViaCognito',
          id: userDetails.id,
          iid: config.aws_cognito_identity_pool_id,
          email: userDetails.username,
          name: userDetails.name,
          emailid: userDetails.email,
          tenant: userDetails.locale,
          ur_id: userDetails.uData?.ur_id,
          schema: config.aws_schema,
          Token: deviceToken,
          device: deviceType,
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      };
      console.log('analytic==' + JSON.stringify(bodyParam.body));
      try {
        const response = await API.post(
          config.aws_cloud_logic_custom_name,
          '/analyticsWebApp',
          bodyParam,
        );
        dispatch(awsSignIn(userDetails));
        console.log('1 ' + JSON.stringify(response));
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            key: null,
            routes: [{name: 'HomeScreenNavigator'}],
          }),
        );
      } catch (err) {
        console.log('---->' + JSON.stringify(err));
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            key: null,
            routes: [{name: 'HomeScreenNavigator'}],
          }),
        );
      }
    } else {
      const bodyParam = {
        body: {
          oid: config.aws_org_id,
          eventtype: 'AuthenticatedViaCognito',
          id: userDetails.id,
          iid: config.aws_cognito_identity_pool_id,
          email: userDetails.username,
          name: userDetails.name,
          emailid: userDetails.email,
          tenant: userDetails.locale,
          ur_id: userDetails.uData?.ur_id,
          schema: config.aws_schema,
          device: deviceType,
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      };
      console.log('analytic==' + JSON.stringify(bodyParam.body));
      try {
        const response = await API.post(
          config.aws_cloud_logic_custom_name,
          '/analyticsWebApp',
          bodyParam,
        );
        dispatch(awsSignIn(userDetails));
        console.log('1 ' + JSON.stringify(response));
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            key: null,
            routes: [{name: 'HomeScreenNavigator'}],
          }),
        );
      } catch (err) {
        console.log('---->' + JSON.stringify(err));
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            key: null,
            routes: [{name: 'HomeScreenNavigator'}],
          }),
        );
      }
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
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View
            style={{
              justifyContent: 'center',
              alignSelf: 'center',
              width: '90%',
            }}>

              <View style={styles.logoHolder}>
                <Image source={appLogoName} style={styles.logoStyle} />
              </View>
              <View style={{marginLeft: 10, marginRight: 5, marginBottom: 25}}>
                {states.status ? (
                  <Text style={styles.validationText}>{states.validation}</Text>
                ) : null}
              </View>
              <View style={[styles.textfieldHolder, {marginTop: 30}]}>
                <View style={styles.textfieldStyle}>
                  <Image source={emailIcon} style={styles.emailIconStyle} />
                  <TextInput
                    autoFocus={true}
                    underlineColorAndroid="transparent"
                    style={styles.input}
                    ref={emailInput}
                    returnKeyType="next"
                    placeholder="Employee ID - (SFXXXXXX)"
                    placeholderTextColor={Constants.app_placeholder_color}
                    blurOnSubmit={false}
                    autoCapitalize="none"
                    onFocus={() => setStates({...states, status: false})}
                    onSubmitEditing={() => passwordInput.current.focus()}
                    onChangeText={val => onChangeEmailText(val)}
                  />
                </View>
              </View>
              <View style={[styles.textfieldHolder, {marginTop: 5}]}>
                <View style={styles.textfieldStyle}>
                  <Image
                    source={passwordIcon}
                    style={styles.passwordIconStyle}
                  />
                  <TextInput
                    underlineColorAndroid="transparent"
                    ref={passwordInput}
                    style={styles.passwordInput}
                    returnKeyType="done"
                    placeholder="Password"
                    autoCorrect={false}
                    placeholderTextColor={Constants.app_placeholder_color}
                    secureTextEntry={isSecureEntry}
                    onSubmitEditing={() => loginButtonPressed()}
                    onChangeText={val => onChangePasswordText(val)}
                  />
                  <TouchableOpacity
                    style={{marginRight: 10}}
                    onPress={() => setIdSecureEntry(prev => !prev)}>
                    {isSecureEntry ? (
                      <Image source={eyeIcon} style={styles.eyeIconStyle} />
                    ) : (
                      <Image
                        source={closeEyeIcon}
                        style={styles.eyeIconStyle}
                      />
                    )}
                  </TouchableOpacity>
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
              <View style={styles.buttonLogin}>
                <TouchableHighlight
                  key="login"
                  onPress={() => loginButtonPressed()}
                  style={[
                    styles.buttonStyle,
                    {backgroundColor: Constants.app_button_color},
                  ]}
                  underlayColor="transparent">
                  <Text style={styles.loginText}>Login</Text>
                </TouchableHighlight>
              </View>
          </View>
              <View style={styles.phonebuttonLogin}>
                <TouchableHighlight
                  key="login"
                  onPress={() => forgotPwdButtonPressed()}
                  style={styles.buttonStyle}
                  underlayColor="transparent">
                  <Text style={styles.phoneloginText}>Forgot Password?</Text>
                </TouchableHighlight>
              </View>
        </View>
        <View style={[styles.buttonHolderLink]}>
          <Text>For any queries: </Text>
          <Text
            onPress={() => Linking.openURL('mailto:support-ssfl@enhanzed.com')}
            style={[styles.buttonText, {fontWeight: '400'}]}>
            support-ssfl@enhanzed.com
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screenstyle: {
    width: '100%',
    height: '100%',
  },
  socialButton: {
    margin: 15,
  },
  socialImage: {
    width: 35,
    height: 35,
  },
  spinnerStyle: {
    top: Constants.app_height / 2 + 50,
    height: 100,
    width: 100,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  CircleShape: {
    width: 70,
    height: 70,
    marginLeft: '40%',
    borderRadius: 70 / 2,
    backgroundColor: '#FFFFFF',
  },
  logoHolder: {
    // top: 20,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  logoStyle: {
    marginTop: 10,
    width: logoWidth,
    height: logoHeight,
  },
  uniHolder: {
    marginHorizontal: 30,
    marginBottom: 0,
    // marginTop: 15,
    alignItems: 'center',
  },
  msgHolder: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 0,
    // marginTop: 15,
    alignItems: 'center',
  },
  msgText: {
    color: Constants.app_text_color,
    fontSize: 16,
    textAlign: 'center',
    // marginTop: 5,
    fontWeight: '700',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // height: Constants.app_width/2,
    // width: Constants.app_width - 40,
    marginHorizontal: 20,
    // marginTop: 22
  },
  modalView: {
    // margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    // padding: 35,
    height: Constants.app_width / 2.5,
    width: Constants.app_width - 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    alignItems: 'center',
    fontSize: 15,
  },
  buttonText: {
    color: 'blue',
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 15,
    fontFamily: Constants.app_font_family_regular,
    textDecorationLine: 'underline',
  },
  appFontFamily: {
    fontFamily: Constants.app_font_family_regular,
  },
  buttonClose: {
    height: 25,
    width: 30,
    // backgroundColor: Constants.app_button_color,
  },
  textStyle: {
    color: 'black',
    // fontWeight: "bold",
    fontSize: 18,
    textAlign: 'center',
  },
  validationText: {
    marginTop: 15,
    marginLeft: 42,
    position: 'absolute',
    color: 'red',
    fontSize: 11,
    fontFamily: Constants.app_font_family_regular,
  },
  textfieldHolder: {
    // height: 60,
    // marginBottom: 10,
    // marginLeft: 15,
    // marginRight: 15,
    // flexDirection: 'column',
    padding:'5%',
    width:'70%',
    alignSelf:'center',
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
    // height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  pickerHolderStyle: {
    height: 30,
    flexDirection: 'row',
    marginLeft: 10,
    // justifyContent: 'center',
    backgroundColor: 'transparent',
    // alignContent: 'flex-end'
  },
  bottomLineStyle: {
    height: 1,
    backgroundColor: Constants.app_grey_color,
    width: '93%',
    alignSelf: 'center',
  },
  passwordIconStyle: {
    marginLeft: 10,
    marginRight: 5,
    width: 25,
    height: 25,
    tintColor: Constants.app_button_color,
  },
  eyeIconStyle: {
    marginLeft: 10,
    marginRight: 5,
    width: 25,
    height: 25,
  },
  passwordInput: {
    flex: 1,
    marginTop: 3,
    color: Constants.app_text_color,
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
  emailIconStyle: {
    marginLeft: 10,
    marginRight: 5,
    marginTop: 0,
    width: 25,
    height: 25,
  },
  pickerIconStyle: {
    marginRight: 10,
    marginTop: 5,
    width: 25,
    height: 25,
  },
  input: {
    flex: 1,
    marginTop: 5,
    color: Constants.app_text_color,
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
  pickerinput: {
    flex: 1,
    // marginTop: 4,
    color: Constants.app_text_color,
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
  buttonLogin: {
    paddingTop:'10%',
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    alignSelf:'center'
  },
  phonebuttonLogin: {
    width: '100%',
    paddingTop: '5%',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  buttonSignup: {
    width: '100%',
    height: 35,
    marginTop: 0,
    borderWidth: 0.5,
    borderRadius: 5,
    color: 'grey',
    borderColor: Constants.app_grey_color,
    padding: 0,
  },
  buttonStyle: {
    width: '100%',
    padding:10,
    borderRadius: 5,
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
        fontWeight: '700',
      },
    }),
  },
  phoneloginText: {
    color: Constants.app_blue_color,
    fontSize: Constants.app_button_text_size,
    fontFamily: Constants.app_font_family_regular,
    // marginBottom: 20,
    ...Platform.select({
      ios: {
        fontWeight: '700',
      },
    }),
    ...Platform.select({
      android: {
        justifyContent: 'center',
        paddingBottom:40,
        fontWeight: '700',
      },
    }),
  },
  forgotButtonText: {
    fontSize: 13,
    fontWeight: '400',
    right: 7,
    height: 60,
    width: 150,
    top: 15,
    textAlign: 'center',
    alignSelf: 'center',
  },
  signUpButtonText: {
    fontSize: 14,
    fontWeight: '400',
  },
  buttonText: {
    color: Constants.app_text_color,
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 15,
    fontFamily: Constants.app_font_family_regular,
    textDecorationLine: 'underline',
  },
  buttonHolderLink: {
    // width: 240,
    // height: 50,
    paddingBottom:10,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  brandText: {
    // marginLeft: 0,
    // marginTop: 42,
    alignSelf: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    fontSize: 12,
    color: '#000',
  },
  brandContainer: {
    flexDirection: 'row',
  },
  brandHolder: {
    position: 'relative',
    bottom: '3%',
    alignItems: 'center',
    width: '100%',
  },
  brandIconStyle: {
    width: 90,
    height: 20,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight,
      },
    }),
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: 160,
    alignSelf: 'center',
  },
  facebookButton: {
    height: 35,
    width: 50,
    marginRight: 20,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    //backgroundColor: '#5890FF',
  },
  Googlesigninbutton: {
    height: 35,
    width: 150,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DD4B39',
  },
  Applesigninbutton: {
    height: 35,
    width: 150,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
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
