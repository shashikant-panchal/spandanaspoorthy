import React, { useState, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  ImageBackground,
  ScrollView,
  StatusBar,
  TouchableHighlight,
  Modal,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert
} from 'react-native'
import { color } from 'react-native-reanimated'
import { shadow } from 'react-native-paper'
import { ScreenWidth } from 'react-native-elements/dist/helpers'
import Constants from '../constants'
import { useSelector, useDispatch } from 'react-redux'
import { awsSignIn, authData } from '../redux/auth/authSlice'
import NetInfo from '@react-native-community/netinfo'
import Amplify, { Cache, API, Auth } from 'aws-amplify'
import { CommonActions, useNavigation } from '@react-navigation/native'
import Toolbar from '../Profile/Toolbar'
import config from '../../aws-exports'
import SkeletonLoader from '../common/appSkeletonLoader'
import { AirbnbRating, Rating } from 'react-native-ratings'

const backIcon = require('../Assets/Images/back.png')
const requiredIcon = require('../Assets/Images/required.png')

const INITIAL_STATE = {
    regUsername: '',
    designation: '',
    department: '',
    organization: '',
    officeAddress: '',
    pin: '',
    mobile: '',
    state: '',
    city: '',
    email: '',
    std: '',
    phone: '',
    gst: '',
    pan: '',
    ext: '',
  }

export default function SessionRegisterScreen(props) {
  const { navigation, onDismissLoadingCallback, route } = props
  const { sessionId } = route.params
  const dispatch = useDispatch()
  let userDetails = useSelector(authData)

  const networkStatusRef = useRef(true)
  const [loading, setLoading] = useState(false)
  const [spinner, setSpinner] = useState(true)
  const [issueText, setIssueText] = useState('')
  const [values, setValues] = useState(INITIAL_STATE)

  useEffect(() => {
    // alert(JSON.stringify(learningsession));
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    fetchSession();
    const listners = [navigation.addListener('willFocus', () => checkFocus())]
    StatusBar.setHidden(false)
    SessionRegisterScreen.navListener = navigation.addListener(
      'didFocus',
      () => {
        StatusBar.setBarStyle('dark-content')
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(Constants.app_statusbar_color)
          StatusBar.setTranslucent(true)
        }
      }
    )
    return () => {
      unsubscribe()
      listners.forEach((listner) => {
        unsubscribe()
      })
    }
  }, [])

  function handleConnectivityChange(isConnected) {
    if (isConnected === false) {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      })
      networkStatusRef.current = false
      setSpinner(false)
    } else {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      })
      networkStatusRef.current = true
      // fetchMytopicsDataset();
    }
  }

  async function fetchSession() {
    const bodyParam = {
      body: {
        ur_id: userDetails?.uData?.ur_id,
        tenant: userDetails?.uData?.oid,
        eid: userDetails.sub,
        sid: sessionId,
        schema: config.aws_schema,
        emailid: userDetails?.email,
        groups: userDetails?.uData?.gid,
      },
      headers: {
        'content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    setSpinner(true)
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getSessionDetails',
        bodyParam
      )
      let regData = response?.regidtls ?? {}
      if (
        regData !== undefined &&
        regData !== null &&
        Object.keys(regData).length > 0
      ) {
        regData.ur_comment = ''
        setValues(regData)
      } else {
        setValues({
          ...INITIAL_STATE,
          regUsername: userDetails?.uData?.first_name,
          mobile: userDetails?.uData?.cno ? userDetails?.uData?.cno : '',
          email: userDetails?.uData?.emailid,
        })
      }
      console.log(JSON.stringify(response?.sData))
      setSpinner(false)
    } catch (error) {
      setSpinner(false)
      console.error(error)
    }
  }

  const handleChange = (prop) => (value) => {
    // console.log({ prop, value })
    setValues((prev) => ({ ...prev, [prop]: value }))
  }

  const saveRegisterDetails = async () => {
    let formIsValid = true
    if (values.regUsername === '' || values.regUsername === null) {
      formIsValid = false
      setIssueText('Please enter name')
      return
    }

    if (values.designation === '' || values.designation === null) {
      formIsValid = false
      setIssueText('Please enter designation')
      return
    }

    if (values.organization === undefined || values.organization === null) {
      formIsValid = false
      setIssueText('Please enter organization ')
      return
    }
    if (values.officeAddress === '' || values.officeAddress === null) {
      formIsValid = false
      setIssueText('Please enter office Address')
      return
    }
    if (values.pin === '' || values.pin === null) {
      formIsValid = false
      setIssueText('Please enter PIN')
      return
    }
    if (values.mobile === undefined || values.mobile === null) {
      formIsValid = false
      setIssueText('Please enter mobile number ')
      return
    }
    if (values.state === '' || values.state === null) {
      formIsValid = false
      setIssueText('Please enter your state')
      return
    }

    if (values.city === '' || values.city === null) {
      formIsValid = false
      setIssueText('Please enter your city')
      return
    }
    if (values.email === undefined || values.email === null) {
      formIsValid = false
      setIssueText('Please enter your email ')
      return
    }
    formIsValid = true
    const bodyParam = {
      body: {
        ur_id: userDetails?.uData?.ur_id,
        sid: sessionId,
        assign: 'self',
        paylater: true,
        schema: config.aws_schema,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Authorization: jwttoken,
      },
    }
    bodyParam.body.pstatus = 2
    if (values.ur_comment) {
      bodyParam.body.ur_comment = values.ur_comment.replaceAll("'", "''")
    }
    try {
      setLoading(true)
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/SessionRegistration',
        bodyParam
      )
        // alert(JSON.stringify(bodyParam.body))
        // alert(JSON.stringify(response))
      // window.location.reload();
      setLoading(false)
      Alert.alert(
        'Success',
        response.body,
        [
          {
            text: 'Ok',
            onPress: () => {
              onBackPressed();
              //   fetchSession()
            },
          },
        ],
        { cancelable: false }
      )
    } catch (error) {
      //   alert(JSON.stringify(error))
      setLoading(false)
    }
  }

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack())
  }

  return (
    <View
      style={styles.container}
      pointerEvents={!networkStatusRef.current ? 'none' : 'auto'}
    >
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
            <TouchableHighlight
              underlayColor="transparent"
              onPress={() => onBackPressed()}
            >
              <Image source={backIcon} style={styles.backButton} />
            </TouchableHighlight>

            <View>
              <Text numberOfLines={1} style={styles.headerStyle}>
                Register form
              </Text>
            </View>
          </View>
        }
      />
      <ScrollView style={{ marginBottom: 50}}>
      <ScrollView style={{marginBottom: 250, marginTop: 20, marginHorizontal: 20,}}>
        <View>
          <Text style={{ fontSize: 14, fontWeight: '600', marginHorizontal: 20 }}>
            Please provide your details
          </Text>
          <Text style={{ fontSize: 10, marginTop: 20, marginHorizontal: 23 }}>
            Company name and address you provide here will be printed on your
            taxable invoice (not editable after invoice is generated). Write in
            BLOCK letters only.Name you provide here will be printed on your
            participation certificate.
          </Text>
          <ScrollView
            style={{
              marginTop: 20,
              marginHorizontal: 20,
            }}
          >
            <Text
              style={{
                color: Constants.app_orange_color,
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              General Info
            </Text>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={requiredIcon} style={styles.requiredIcon} />
                <Text>Name (As per records):</Text>
              </View>
              <TextInput
                style={styles.input}
                value={values.regUsername || ''}
                placeholderTextColor={Constants.app_searchbar_placeholder}
                onChange={handleChange('regUsername')}
                required
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={requiredIcon} style={styles.requiredIcon} />
                <Text>Designation</Text>
              </View>
              <TextInput
                style={styles.input}
                value={values.designation || ''}
                placeholderTextColor={Constants.app_searchbar_placeholder}
                onChange={handleChange('designation')}
                required
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text>Department:</Text>
              </View>
              <TextInput
                style={styles.input}
                value={values.department || ''}
                placeholderTextColor={Constants.app_searchbar_placeholder}
                onChange={handleChange('department')}
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={requiredIcon} style={styles.requiredIcon} />
                <Text>Organization:</Text>
              </View>
              <TextInput
                style={styles.input}
                value={values.organization || ''}
                placeholderTextColor={Constants.app_searchbar_placeholder}
                onChange={handleChange('organization')}
                required
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={requiredIcon} style={styles.requiredIcon} />
                <Text>Office Address * (for invoice):</Text>
              </View>
              <TextInput
                style={styles.input}
                value={values.officeAddress || ''}
                placeholderTextColor={Constants.app_searchbar_placeholder}
                onChange={handleChange('officeAddress')}
                required
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={requiredIcon} style={styles.requiredIcon} />
                <Text>City:</Text>
              </View>
              <TextInput
                style={styles.input}
                value={values.city || ''}
                placeholderTextColor={Constants.app_searchbar_placeholder}
                onChange={handleChange('city')}
                required
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={requiredIcon} style={styles.requiredIcon} />
                <Text>PIN:</Text>
              </View>
              <TextInput
                style={styles.input}
                value={values.pin || ''}
                placeholderTextColor={Constants.app_searchbar_placeholder}
                onChange={handleChange('pin')}
                required
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={requiredIcon} style={styles.requiredIcon} />
                <Text>State:</Text>
              </View>
              <TextInput
                style={styles.input}
                value={values.state || ''}
                placeholderTextColor={Constants.app_searchbar_placeholder}
                onChange={handleChange('state')}
                required
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={requiredIcon} style={styles.requiredIcon} />
                <Text>Email:</Text>
              </View>
              <TextInput
                style={styles.input}
                value={userDetails.email || ''}
                placeholderTextColor={Constants.app_searchbar_placeholder}
                onChange={handleChange('email')}
                required
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text>STD:</Text>
              </View>
              <TextInput
                style={styles.input}
                value={values.std || ''}
                placeholderTextColor={Constants.app_searchbar_placeholder}
                onChange={handleChange('std')}
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text>Phone:</Text>
              </View>
              <TextInput
                style={styles.input}
                value={values.phone || ''}
                placeholderTextColor={Constants.app_searchbar_placeholder}
                onChange={handleChange('phone')}
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={requiredIcon} style={styles.requiredIcon} />
                <Text>Mobile:</Text>
              </View>
              <TextInput
                style={styles.input}
                value={values.mobile || ''}
                placeholderTextColor={Constants.app_searchbar_placeholder}
                onChange={handleChange('mobile')}
                required
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text>GST Number (if applicable):</Text>
              </View>
              <TextInput
                style={styles.input}
                value={values.gst || ''}
                placeholderTextColor={Constants.app_searchbar_placeholder}
                onChange={handleChange('gst')}
              />
            </View>
            <View style={{ marginTop: 10, marginHorizontal: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text>
                  If you registering first time, please provide your Company's
                  PAN:
                </Text>
              </View>
              <TextInput
                style={styles.input}
                value={values.pan || ''}
                placeholderTextColor={Constants.app_searchbar_placeholder}
                onChange={handleChange('pan')}
              />
            </View>
            <Text
              style={{
                color: 'red',
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              {issueText}
            </Text>
            <TouchableHighlight
              onPress={() => saveRegisterDetails()}
              style={{
                backgroundColor: Constants.app_button_color,
                justifyContent: 'center',
                alignSelf: 'center',
                alignContent: 'center',
                width: 100,
                height: 40,
              }}
              underlayColor="transparent"
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 18,
                  fontWeight: '700',
                  textAlign: 'center',
                }}
              >
                Save
              </Text>
            </TouchableHighlight>
          </ScrollView>
        </View>
        </ScrollView>
      </ScrollView>
    </View>
  )
}
const styles = StyleSheet.create({
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
  backButton: {
    width: 25,
    height: 25,
    tintColor: '#000000',
    alignSelf: 'center',
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
  container: {
    flex: 1,
  },
  screenstyle: {
    width: '100%',
    height: '100%',
  },
  appFontFamily: {
    fontFamily: Constants.app_font_family_regular,
  },
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight,
      },
    }),
  },
  requiredIcon: {
    height: 22,
    width: 22,
    marginTop: -2,
  },
  input: {
    borderWidth: 0.5,
    borderColor: 'black',
    borderRadius: 5,
    height: 35,
    marginVertical: 10,
    width: '100%',
  },
})
