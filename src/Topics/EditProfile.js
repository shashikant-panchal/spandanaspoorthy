/* eslint-disable camelcase */
/* eslint-disable react/destructuring-assignment */
import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  Platform,
  TouchableHighlight,
  StatusBar,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Linking,
  ImageBackground,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import NetInfo from '@react-native-community/netinfo'
import Cookie from 'react-native-cookie'
import { CommonActions, useNavigation } from '@react-navigation/native'
import SInfo from 'react-native-sensitive-info'
import LinearGradient from 'react-native-linear-gradient'
import Amplify, { API, Cache, Auth } from 'aws-amplify'
import config from '../../aws-exports'
import Toolbar from '../Profile/Toolbar'
import Constants from '../constants'
import { useSelector, useDispatch } from 'react-redux'
import { awsSignIn, authData } from '../redux/auth/authSlice'
import CountryPicker from 'rn-country-dropdown-picker'

const logoWidth = 25
const logoHeight = 30
const toolbarHeight = 50

const calendar = require('../Assets/Images/calendar.png')
const certificate = require('../Assets/Images/certificate.png')
const passwordIcon = require('../Assets/Images/password.png')
const eyeIcon = require('../Assets/Images/eye.png')
const closeEyeIcon = require('../Assets/Images/eyeClose.png')
const backIcon = require('../Assets/Images/back.png')
const editIcon = require('../Assets/Images/edit.png')
const profileIcon = require('../Assets/Images/profile_icon.png')

export default function EditProfileScreen(props) {
  // const {
  //   navigation,
  // } = props;
  const navigation = useNavigation()
  const [modalSpinner, setModalSpinner] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(true)
  const [openPassModal, setOpenPassModal] = useState(false)
  const dispatch = useDispatch()
  let userDetails = useSelector(authData)
  const [values, setValues] = useState(INITIAL_STATE)
  const [profileData, setProfileData] = useState({})
  const [avtid, setAvtid] = useState(null)
  const [editAvatar, setEditAvatar] = useState(false)
  const [country, setCountry] = useState('')
  const [finalAvt, setFinalAvt] = useState(null)
  const [errorValidation, setErrorValidation] = useState('')
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [spinner, setSpinner] = useState(true)
  const [isSecureEntry, setIdSecureEntry] = useState(true)
  const [isNextSecureEntry, setIdNextSecureEntry] = useState(true)
  const [isCurrentSecureEntry, setIdCurrentSecureEntry] = useState(true)
  const [validation, setValidation] = useState('')
  const [status, setStatus] = useState(false)
  const [newNumber, setNewNumber] = useState('')

  const INITIAL_STATE = {
    name: '',
    cno: '',
    uid: '',
    address: '',
  }

  useEffect(() => {
    getUserDetails()
  }, [])

  const handleChange = (prop) => (value) => {
    console.log({ prop, value })
    setValues((prev) => ({ ...prev, [prop]: value }))
  }

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack())
  }

  const getUserDetails = async () => {
    // alert(JSON.stringify(userDetails))
    setSpinner(true)
    const bodyParam = {
      body: {
        emailid: userDetails.email,
        uid: userDetails.uData.uid,
        schema: config.aws_schema,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    // alert(JSON.stringify(bodyParam.body))
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getUserDetails',
        bodyParam
      )
      console.log('response', response)
      const { body } = response
      // alert(JSON.stringify(body[0]))
      setProfileData(body[0])
      let regData = body[0] ?? {}
      if (
        regData !== undefined &&
        regData !== null &&
        Object.keys(regData).length > 0
      ) {
        setValues(regData)
      } else {
        setValues({
          ...INITIAL_STATE,
        })
      }
      setAvtid(response.body[0].avtid)
      // alert(JSON.stringify(values))
      setSpinner(false)
    } catch (err) {
      setSpinner(false)
      console.error(err)
    }
  }

  function onsubmit() {
    // alert(JSON.stringify(values))
    let formIsValid = true
    // const {first_name, last_name, pno} = values;

    if (
      values.name === '' ||
      values.name === null ||
      (values.name !== undefined && values.name.trim() === '')
    ) {
      formIsValid = false
      setErrorValidation('Please enter name')
      return
    }

    if (values.cno === undefined || values.cno.length != 10) {
      formIsValid = false
      setErrorValidation('Please enter a valid phone number ')
      return
    }

    if (values.name !== '') {
      if (!values.name.match(/^[a-zA-Z ]*$/)) {
        formIsValid = false
        setErrorValidation('*Please enter alphabet characters only.')
        return
      }
    }

    if (country === null || country === undefined) {
      formIsValid = false
      setErrorValidation('*Please enter alphabet characters only.')
      return
    }

    if (formIsValid === true) {
      // alert(JSON.stringify(userDetails))
      // alert(finalAvt)
      // alert(JSON.stringify(user))
      /*  if (!finalAvt) return; */
      let updateProfile = {
        oid: config.aws_org_id,
        ur_id: userDetails?.uData?.ur_id,
        tenant: userDetails?.tenant,
        emailid: userDetails?.uData?.emailid,
        first_name: values.name,

        dev: userDetails?.uData?.dev,
        uid: userDetails?.uData?.uid,
        gen: parseInt(userDetails?.gen),
        address: 'IN',
        schema: config.aws_schema,

        avtid: finalAvt,
        type: 'edit',
        atype: 1,
      }
      profileUpdate(updateProfile)
    }
  }

  function onchangePhoneNumber(value) {
    setNewNumber(value)
  }

  const profileUpdate = async (data) => {
    const bodyParam = {
      body: { ...data },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
    // alert(JSON.stringify(bodyParam.body))
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/updateProfileSSFL',
        bodyParam
      )
      // dispatch(setUserdata(body));
      Alert.alert('User updated successfully')
      console.log(JSON.stringify(response))
      onBackPressed()
      return response
    } catch (error) {
      throw error
    }
  }

  function chooseAvatar() {
    // alert(finalAvt)
    if (editAvatar) {
      if (avtid === null) {
        return profileData?.avtid
      }
      return avtid
    } else if (finalAvt === null) {
      return profileData?.avtid
    } else return finalAvt
  }

  function handleSelection(e) {
    // alert(JSON.stringify(e));
    setCountry(e.country)
  }

  const onSaveButtonPressed = async (event) => {
    // alert(newNumber.length)
    if (newNumber.length === 0) {
      setValidation('Enter phone number')
    } else {
      // alert('tru');
      setValidation('')
      setModalSpinner(true)
      try {
        const bodyParam = {
          body: {
            phoneNumber: newNumber,
            schema: config.aws_schema,
            uid: userDetails?.uData?.uid,
          },
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            // Authorization: jwttoken,
          },
        }
        const response = await API.post(
          config.aws_cloud_logic_custom_name,
          '/edit-phone-number',
          bodyParam
        )
        if (response.statusCode === 200) {
          setValues((prev) => ({ ...prev, pno: newNumber }))
          setOpenPassModal(false)
        } else {
          let code = response?.code
          switch (code) {
            case 'InvalidPhoneNumber':
              return setValidation(response?.body?.message)
            default:
              return false
          }
        }
      } catch (error) {
        setModalSpinner(false)
      }
    }
  }

  function renderSettingsView() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ marginBottom: 150 }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, marginTop: 20, alignItems: 'center' }}>
              {profileData?.avtid === undefined ||
              profileData?.avtid === null ? (
                <Image style={styles.topicImg} source={profileIcon}></Image>
              ) : (
                <Image
                  source={{
                    uri: `https://${
                      Constants.DOMAIN
                    }/${config.aws_org_id.toLowerCase()}-resources/images/profile-images/${chooseAvatar()}.png`,
                  }}
                  style={styles.topicImg}
                />
              )}
            </View>
            {/* <Text>{chooseAvatar()}</Text> */}
            <View style={styles.buttonLogin}>
              <TouchableHighlight
                key="login"
                onPress={() => setEditAvatar(true)}
                style={[
                  styles.buttonStyle,
                  { backgroundColor: Constants.app_dark_color },
                ]}
                underlayColor="transparent"
              >
                <Text style={styles.loginText}>Edit Avatar</Text>
              </TouchableHighlight>
            </View>
          </View>
          <Text style={{ color: 'red', marginLeft: '10%' }}>
            {errorValidation}
          </Text>
          <View
            style={{
              marginTop: 10,
              marginHorizontal: 10,
              flexDirection: 'row',
            }}
          >
            <View style={{ flexDirection: 'row', width: 80, marginTop: 5 }}>
              <Text>Name:</Text>
            </View>
            <TextInput
              style={styles.input}
              value={values?.name || ''}
              placeholderTextColor={Constants.app_searchbar_placeholder}
              onChangeText={handleChange('name')}
              required
            />
          </View>
          <View
            style={{
              marginTop: 20,
              marginHorizontal: 10,
              flexDirection: 'row',
            }}
          >
            <View style={{ flexDirection: 'row', width: 80, marginTop: 5 }}>
              <Text>ID:</Text>
            </View>
            <TextInput
              style={styles.input}
              value={values?.uid || ''}
              placeholderTextColor={Constants.app_searchbar_placeholder}
              onChangeText={handleChange('uid')}
              required
              editable={false}
            />
          </View>
          <View
            style={{
              marginTop: 20,
              marginHorizontal: 10,
              flexDirection: 'row',
            }}
          >
            <View style={{ flexDirection: 'row', width: 80, marginTop: 5 }}>
              <Text>Password:</Text>
            </View>
            <TextInput
              style={styles.input}
              value="*********"
              placeholderTextColor={Constants.app_grey_color}
              //   onChangeText={handleChange('first_name')}
              required
              editable={false}
            />
          </View>
          <View
            style={{
              marginTop: 10,
              marginHorizontal: 10,
              flexDirection: 'row',
            }}
          >
            <View style={{ flexDirection: 'row', width: 80, marginTop: 5 }}>
              <Text>Phone Number:</Text>
            </View>
            <TextInput
              style={styles.passinput}
              value={values?.cno || ''}
              placeholderTextColor={Constants.app_searchbar_placeholder}
              onChangeText={handleChange('cno')}
              required
              keyboardType="number-pad"
            />
            <View>
              <TouchableHighlight
                underlayColor="transparent"
                onPress={() => setOpenPassModal(true)}
              >
                <Image
                  source={editIcon}
                  style={{
                    width: 22,
                    height: 22,
                    alignSelf: 'center',
                    marginTop: 8,
                    marginLeft: 10,
                  }}
                />
              </TouchableHighlight>
            </View>
          </View>
          <View
            style={{
              marginTop: 10,
              marginHorizontal: 10,
              flexDirection: 'row',
              width: '76%',
            }}
          >
            <View style={{ flexDirection: 'row', width: 80, marginTop: 5 }}>
              <Text>Country:</Text>
            </View>
            <CountryPicker
              value={values?.address || ''}
              InputFieldStyle={styles.countryinput}
              countryNameStyle={styles.mycountryNameStyle}
              DropdownCountryTextStyle={styles.mycountryNameStyle}
              selectedItem={handleSelection}
              Placeholder={values?.address}
              ContainerStyle={styles.countryContainerStyle}
            />
          </View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={openPassModal}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.')
              setOpenPassModal(!openPassModal)
            }}
          >
            <View style={styles.centeredViewPass}>
              <View style={styles.modalViewPass}>
                <View>
                  <View>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '600',
                        textAlign: 'right',
                        margin: 20,
                      }}
                      onPress={() => {
                        setOpenPassModal(false)
                      }}
                    >
                      X
                    </Text>
                    <View>
                      <Text
                        style={{
                          color: 'red',
                          fontSize: 10,
                          textAlign: 'center',
                        }}
                      >
                        {validation}
                      </Text>
                      <View style={[styles.textfieldHolder, { marginTop: 10 }]}>
                        <View
                          style={{
                            height: 50,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            // alignItems: 'center',
                            width: Constants.app_width / 1.8,
                          }}
                        >
                          <Text style={{ fontSize: 15, marginBottom: 5 }}>
                            Edit phone number
                          </Text>
                          <TextInput
                            placeholderTextColor={
                              Constants.app_placeholder_color
                            }
                            underlineColorAndroid="transparent"
                            style={[styles.input, styles.appFontFamily]}
                            placeholder="  Phone number"
                            onChangeText={(val) => onchangePhoneNumber(val)}
                            required
                            keyboardType="numeric"
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                  <View
                    style={{
                      // display: 'flex',
                      // justifyContent: 'center',
                      //   padding: '20px',
                      alignItems: 'center',
                    }}
                  >
                    <View style={styles.buttonLogin}>
                      <TouchableHighlight
                        key="login"
                        onPress={() => {
                          // setOpenPassModal(false);
                          onSaveButtonPressed()
                        }}
                        style={[
                          styles.buttonStyle,
                          { backgroundColor: Constants.app_dark_color },
                        ]}
                        underlayColor="transparent"
                      >
                        <Text style={styles.loginText}>Save</Text>
                      </TouchableHighlight>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={editAvatar}
            onRequestClose={() => {
              // Alert.alert('Modal has been closed.');
              setEditAvatar(!editAvatar)
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <ScrollView>
                  <View
                    // container
                    // spacing={3}
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      flex: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    {[...Array(21).fill(null)].map((item, i) => {
                      i = i + 1
                      return (
                        <View>
                          <TouchableHighlight
                            key="login"
                            onPress={() => {
                              setAvtid(i)
                            }}
                            underlayColor="transparent"
                          >
                            <Image
                              source={{
                                uri: `https://${
                                  Constants.DOMAIN
                                }/${config.aws_org_id.toLowerCase()}-resources/images/profile-images/${i}.png`,
                              }}
                              style={
                                i === avtid || i === userDetails?.avtid
                                  ? styles.topicImgSelect
                                  : styles.topicImg
                              }
                            />
                          </TouchableHighlight>
                        </View>
                      )
                    })}
                  </View>
                </ScrollView>
                <View
                  style={{
                    // display: 'flex',
                    justifyContent: 'center',
                    //   padding: '20px',
                  }}
                >
                  <View style={styles.buttonLogin}>
                    <TouchableHighlight
                      key="login"
                      onPress={() => {
                        // alert(avtid)
                        setEditAvatar(false)
                        setFinalAvt(avtid)
                      }}
                      style={[
                        styles.buttonStyle,
                        { backgroundColor: Constants.app_dark_color },
                      ]}
                      underlayColor="transparent"
                    >
                      <Text style={styles.loginText}>Save Avatar</Text>
                    </TouchableHighlight>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
          <TouchableHighlight
            onPress={() => onsubmit()}
            style={{
              backgroundColor: Constants.app_dark_color,
              justifyContent: 'center',
              alignSelf: 'center',
              alignContent: 'center',
              width: 100,
              height: 40,
              marginTop: 50,
            }}
            underlayColor="transparent"
          >
            <Text
              style={{
                color: 'black',
                fontSize: 18,
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              Save
            </Text>
          </TouchableHighlight>
        </ScrollView>
      </View>
    )
  }

  return (
    <View
      style={styles.container}
      pointerEvents={!connectionStatus ? 'none' : 'auto'}
    >
      <LinearGradient
        start={{ x: 0.0, y: 0.0 }}
        end={{ x: 0.0, y: 1.0 }}
        colors={['#FFFFFF', '#FFFFFF']}
        style={styles.screenstyle}
      >
        {modalSpinner && (
          <View style={styles.spinnerStyle}>
            <ActivityIndicator
              animating
              size="large"
              color={Constants.app_button_color}
            />
          </View>
        )}
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
                  onPress={() => onBackPressed()}
                >
                  <Image source={backIcon} style={styles.backButton} />
                </TouchableHighlight>
              </View>
              <View>
                <Text numberOfLines={1} style={styles.headerStyle}>
                  Edit Profile
                </Text>
              </View>
            </View>
          }
        />
        <ScrollView
          style={styles.scrollview}
          showsVerticalScrollIndicator={false}
        >
          {renderSettingsView()}
        </ScrollView>
        <View
          style={{
            flex: 1,
            position: 'absolute',
            bottom: 0,
            width: '100%',
            opacity: 0.8,
            zIndex: 1000,
          }}
        >
          {!connectionStatus && (
            <Text style={[styles.noNetwork, styles.appFontFamily]}>
              No Internet Connectivity
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenstyle: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  appFontFamily: {
    fontFamily: Constants.app_font_family_regular,
  },
  profileHolder: {
    height: toolbarHeight,
    ...Platform.select({
      ios: {
        marginTop: -22,
      },
      android: {
        marginTop: -35,
      },
    }),
    marginLeft: -10,
  },
  profileImage: {
    height: 30,
    width: 30,
  },
  appLogo: {
    height: 30,
    width: 80,
    ...Platform.select({
      ios: {
        marginTop: -15,
      },
      android: {
        marginTop: -35,
      },
    }),
  },
  notifyImage: {
    height: 30,
    width: 30,
  },
  notifyHolder: {
    marginRight: -10,
    ...Platform.select({
      ios: {
        marginTop: -50,
      },
      android: {
        marginTop: -48,
      },
    }),
  },

  settingsListview: {
    flex: 1,
    marginTop: 0,
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    height: 65,
  },
  borderLine: {
    borderBottomColor: '#D3D3D3',
    borderBottomWidth: 0.5,
  },
  iconStyle: {
    marginLeft: 18,
    marginTop: 15,
    width: 30,
    height: 30,
  },
  arrowStyle: {
    marginLeft: 18,
    marginTop: 20,
    width: 22,
    height: 22,
  },
  itemText: {
    marginLeft: 10,
    marginTop: 20,
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontSize: 18,
    color: Constants.app_text_color,
  },
  scrollview: {
    marginBottom: 50,
  },
  headerStyle: {
    marginLeft: 5,
    width: Constants.app_width - 100,
    fontWeight: '500',
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
  versionHolder: {
    // flex: 1,
    height: 30,
    flexDirection: 'column',
    alignSelf: 'center',
    marginBottom: 60,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: 13,
    color: Constants.app_text_color,
    justifyContent: 'center',
  },
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight - 5,
      },
    }),
  },
  spinnerStyle: {
    top: Constants.app_height / 2 - 50,
    height: 100,
    width: 100,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 10,
    position: 'absolute',
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
  topicImg: {
    width: 100,
    height: 100,
    borderRadius: 100,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
    }),
  },
  topicImgSelect: {
    width: 100,
    height: 100,
    borderRadius: 100,
    ...Platform.select({
      ios: {
        overflow: 'hidden',
      },
    }),
    borderColor: Constants.app_dark_color,
    borderWidth: 4,
  },
  buttonLogin: {
    width: 90,
    height: 30,
    marginVertical: 20,
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginRight: 25,
  },
  buttonStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
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
  input: {
    borderWidth: 0.5,
    borderColor: 'black',
    borderRadius: 5,
    ...Platform.select({
      ios: {
        height: 35,
      },
      android: {
        height: 40,
      },
    }),
    width: '75%',
    color: 'black',
  },
  passinput: {
    borderWidth: 0.5,
    borderColor: 'black',
    borderRadius: 5,
    ...Platform.select({
      ios: {
        height: 35,
      },
      android: {
        height: 40,
      },
    }),
    width: '65%',
    color: 'black',
  },
  countryinput: {
    borderWidth: 0.5,
    borderColor: 'black',
    borderRadius: 5,
    ...Platform.select({
      ios: {
        height: 35,
      },
      android: {
        height: 40,
      },
    }),
    // width: '55%',
    marginRight: 22,
    color: 'black',
  },
  mycountryNameStyle: {
    fontSize: 14,
  },
  centeredView: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20%',
    marginLeft: '10%',
    width: '80%',
    height: '85%',
  },
  modalView: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    height: '100%',
  },
  centeredViewPass: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    marginTop: '40%',
    marginLeft: '10%',
    width: Dimensions.get('window').width - 80,
    height: Dimensions.get('window').height / 3.8,
  },
  modalViewPass: {
    backgroundColor: 'white',
    // justifyContent: 'center',
    // alignItems: 'center',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    height: '100%',
  },
  textfieldHolder: {
    height: 60,
    marginBottom: 5,
    marginLeft: 15,
    marginRight: 15,
    flexDirection: 'column',
    backgroundColor: 'transparent',
    borderColor: 'grey',
    borderWidth: 0.1,
    backgroundColor: 'white',
  },
  textfieldStyle: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  passwordIconStyle: {
    marginLeft: 10,
    marginRight: 11,
    // marginTop: 10,
    width: 15,
    height: 20,
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
})
