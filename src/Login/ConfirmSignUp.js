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
} from 'react-native';

import {CommonActions} from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import Amplify, {Auth, API} from 'aws-amplify';
import Constants from '../constants';
import config from '../../aws-exports';
import {useSelector, useDispatch} from 'react-redux';
import {awsSignIn, authData} from '../redux/auth/authSlice';

const logoWidth = 145;
const logoHeight = 120;
const smallIcon = 20;

const passwordIcon = require('../Assets/Images/password.png');
const appLogo = require('../Assets/Images/logo.png');
const appLogoName = require('../Assets/Images/logowithname.png');
const eyeIcon = require('../Assets/Images/eye.png');
const closeEyeIcon = require('../Assets/Images/eyeClose.png');

export default function ConfirmSignUpScreen(props) {
  const {navigation, onDismissLoadingCallback, route} = props;

  const {username, firstPassword1} = route.params;
  const [states, setStates] = useState({
    // email: (email1, null),
    // firstPassword: (firstPassword1, null),
    password: '',
    cnfPassword: '',
    users: {},
    spinner: false,
    status: false,
    validation: '',
  });
  const [resendLoad, setResendLoad] = useState(false);
  const focusHere = useRef(null);
  const [isSecureEntry, setIdSecureEntry] = useState(true);
  const [isNextSecureEntry, setIdNextSecureEntry] = useState(true);
  let userDetails = useSelector(authData);
  // let userdata = useSelector((state) => state.user.value);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(JSON.stringify(username));
    getInitialState();
    const unsubscribe = NetInfo.addEventListener(state => {
      handleConnectivityChange(state.isInternetReachable);
    });
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    ConfirmSignUpScreen.navListener = navigation.addListener('didFocus', () => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#FFFFFF');
        StatusBar.setTranslucent(true);
      }
    });
    return () => {
      removeBackPressListner();
      // ConfirmSignUpScreen.navListener.remove();
      // NetInfo.removeEventListener('connectionChange', handleConnectivityChange);
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

  function onChangeFirstPassword(value) {
    setStates({
      ...states,
      status: false,
      validation: '',
      password: value,
    });
  }

  async function resetButtonPressed() {
    // alert(JSON.stringify(userdata))
    if (states.password.trim() === '') {
      setStates({
        ...states,
        validation: 'Enter code',
        status: true,
        spinner: false,
      });
      return;
    }
    // console.log('userdata1', userDetails);
    // let username = userDetails?.ur_id;
    let code = states.password;
    try {
      const bodyParam = {
        body: {
          otp: code,
          id: username.toUpperCase(),
          schema: config.aws_schema,
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          // Authorization: jwttoken,
        },
      };
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/confirm-sign-up',
        bodyParam,
      );
      // alert(JSON.stringify(response))
      if (response.statusCode === 200) {
        let res = response?.body?.data;
        let body = {
          id: res.eid,
          username: res.uid,
          name: res?.first_name + ' ' + res?.last_name,
          email: res.uid,
          locale: res.oid,
          tenant: res.oid,
          uData: {
            ...res,
          },
        };
        dispatch(awsSignIn(userDetails));
        analyticsWebApp(body);
      } else {
        // let code = error.code;
        return setStates({
          ...states,
          validation: response?.body?.message,
          status: true,
          spinner: false,
        });
      }
      console.log('body==', body);
    } catch (error) {
      console.log('error confirming sign up', error);
    }
    removeBackPressListner();
  }

  async function analyticsWebApp(userDetails) {
    setStates({
      ...states,
      spinner: false,
    });
    console.log('userDetails==== ' + JSON.stringify(userDetails));
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
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Authorization: jwttoken,
      },
    };
    console.log('analytic==' + JSON.stringify(bodyParam.body));

    try {
      await API.post(
        config.aws_cloud_logic_custom_name,
        '/analyticsWebApp',
        bodyParam,
      );
      setStates({
        ...states,
        spinner: false,
      });
      dispatch(awsSignIn(userDetails));
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          key: null,
          routes: [{name: 'HomeScreenNavigator'}],
        }),
      );
    } catch (err) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          key: null,
          routes: [{name: 'HomeScreenNavigator'}],
        }),
      );
      console.log(err);
    }
  }

  async function resendConfirmationCode() {
    setStates({
      ...states,
      validation: null,
      status: false,
      spinner: true,
    });
    let username = userDetails?.username;
    try {
      setResendLoad(true);
      await Auth.resendSignUp(username?.toUpperCase());
      console.log('code resent successfully');
      setResendLoad(false);
      setStates({
        ...states,
        validation: null,
        status: false,
        spinner: false,
      });
    } catch (err) {
      setResendLoad(false);
      console.log('error resending code: ', err);
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
          style={{justifyContent: 'center', alignSelf: 'center', width: '90%'}}>
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
                      placeholder="Enter code sent to your phone"
                      blurOnSubmit={false}
                      //   secureTextEntry={isSecureEntry}
                      onFocus={() => setStates({...states, status: false})}
                      onSubmitEditing={() => resetButtonPressed()}
                      onChangeText={val => onChangeFirstPassword(val)}
                    />
                  </View>
                </View>
                <View style={styles.phonebuttonLogin}>
                  <TouchableHighlight
                    key="login"
                    onPress={() => resendConfirmationCode()}
                    //   style={styles.buttonStyle}
                    underlayColor="transparent">
                    <Text style={styles.phoneloginText}>Resend code</Text>
                  </TouchableHighlight>
                </View>
                <TouchableHighlight
                  key="login"
                  onPress={() => resetButtonPressed()}
                  style={[
                    styles.buttonStyle,
                    {backgroundColor: Constants.app_button_color},
                  ]}
                  underlayColor="transparent">
                  <Text style={styles.loginText}>Submit</Text>
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
    marginTop: -30,
    marginBottom: 10,
    marginLeft: 60,
    // position: 'absolute',
    color: 'red',
    fontSize: 11,
    fontFamily: Constants.app_font_family_regular,
  },
  holderView: {
    // position: 'absolute',
    marginTop: Constants.app_height * 0.2,
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
    marginLeft: 35,
    marginRight: 35,
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
    marginRight: '10%',
    flexDirection: 'row',
    // justifyContent: 'center',
    // alignItems: 'center',
    marginTop: 40,
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
  phonebuttonLogin: {
    height: 25,
    width: Constants.app_width / 2,
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    marginRight: 22,
  },
  phoneloginText: {
    textAlign: 'right',
  },
});
