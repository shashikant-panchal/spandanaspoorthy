import React, { useState, useEffect, useRef } from 'react'
import {
  StyleSheet,
  Image,
  Text,
  View,
  TouchableHighlight,
  Modal,
  ActivityIndicator,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import Amplify, { API } from 'aws-amplify'
import 'react-native-gesture-handler'
import LinearGradient from 'react-native-linear-gradient'
import Toolbar from '../Profile/Toolbar'
import config from '../../aws-exports'
import { authData } from '../redux/auth/authSlice'
import { useSelector } from 'react-redux'
import SkeletonLoader from '../common/appSkeletonLoader'
import CollapsibleView from '@eliav2/react-native-collapsible-view'
import OJTLOBM from './OJT-BM-LO'
import OJTMentor from './OJT-Mentor'

const appLogo = require('../Assets/Images/logo.png')
const notificationIcon = require('../Assets/Images/notification_white.png')

export default function OJTTLO(props) {
  let userDetails = useSelector(authData)

  const { navigation, onDismissLoadingCallback } = props
  const networkStatusRef = useRef(true)
  const [spinner, setSpinner] = useState(true)
  const [modalSpinner, setModalSpinner] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const tloDesignations = ['credit assistant', 'tlo']
  const loDesignations = ['lo', 'loan officer']
  const bmDesignations = ['branch manager']
  const [spin, setSpin] = useState(false)
  const [activityload, setActivityLoad] = useState(false)
  const designation = userDetails?.uData?.designation?.toLowerCase()
  const [open, setOpen] = useState(false)
  const [TLOResponse, setTLOResponse] = useState({})
  const isTlo = tloDesignations.includes(designation)
  const [showModal, setShowModal] = useState(false)
  const [selectedValue, setSelectedValue] = useState(null)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivityChange(state.isInternetReachable)
    })
    fetchTloList()
    const listners = [navigation.addListener('willFocus', () => checkFocus())]
    StatusBar.setHidden(false)

    OJTTLO.navListener = navigation.addListener('didFocus', () => {
      StatusBar.setBarStyle('dark-content')
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(Constants.app_statusbar_color)
        StatusBar.setTranslucent(true)
      }
    })
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
    }
  }

  const updateUserActivities = async (body) => {
    try {
      const res = await API.post(
        config.aws_cloud_logic_custom_name,
        '/updateUserActivities',
        {
          body,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )
      return res
    } catch (err) {
      throw err
    }
  }

  const handleSaveChange = async () => {
    const obj = {
      ur_id: tloDesignations.includes(designation)
        ? userDetails.uData.ur_id
        : userDetails.tlodata.ur_id,
      mid: TLOResponse?.mdetails?.ur_id,
      activities: TLOResponse.activities,
    }
    console.log(TLOResponse.activities)
    try {
      const res = await updateUserActivities(obj)
      if (res.statusCode === 200) {
        Alert.alert(
          'Success',
          'Your activity data updated successfully!',
          [{ text: 'Ok', onPress: () => getTloDetails(userDetails) }],
          { cancelable: false }
        )
      }
    } catch (error) {
      console.error('An error occurred:', error)
    }
  }

  function showNotification() {
    navigation.navigate('Notification')
  }

  function renderDesignationText() {
    const userDesignation = userDetails?.uData?.designation?.toLowerCase()

    if (userDesignation === 'tlo' || userDesignation === 'credit assistant') {
      return <TLODropdowns />
    } else if (userDesignation === 'branch manager') {
      return <OJTLOBM />
    } else {
      return <OJTMentor />
    }
  }

  async function fetchTloList() {
    var body = {}
    body.method = 'get'
    let response = await getTloDetails(userDetails)
    if (!response) {
      throw new Error('Network response was not ok')
    }
    response.tlodata = {}
    const sourceData = tloDesignations.includes(
      userDetails?.uData?.designation?.toLowerCase()
    )
      ? userDetails.uData
      : userDetails.tlodata
    const { name, designation, uid } = sourceData

    console.log('souceData===========>', sourceData)

    response.tlodata = { name, designation, uid }
    // return response || {}
    console.log('TLODetails=======>', JSON.stringify(response))
    setTLOResponse(response || {})
    setIsLoading(false)
  }

  const getTloDetails = async ({ uData, tlodata }) => {
    console.log(JSON.stringify(uData.designation))
    const tloDesignations = ['credit assistant', 'tlo']
    let tloid = ''
    let mid = ''
    if (uData) {
      tloid = tloDesignations.includes(uData.designation?.toLowerCase())
        ? uData.ur_id
        : tlodata?.ur_id
      mid = tloDesignations.includes(uData.designation?.toLowerCase())
        ? uData.mentor_id
        : tlodata?.mentor_id
    }
    console.log(mid, 'getTloDetails', tloid)
    // Check if tloid and mid are not undefined or null
    if (!tloid || !mid) {
      throw new Error('Missing tloid or mid.')
    }

    try {
      const response = await API.get(
        config.aws_cloud_logic_custom_name,
        `/getTloDetails?tlo_id=${tloid}&mid="${mid}"`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )
      console.log('TLOActivities=========>', response)
      return response
    } catch (err) {
      throw err
    }
  }

  const handleChange = (event, type, Idx) => {
    TLOResponse.activities[Idx][type] = event
  }

  const selectOption = (option) => {
    setSelectedValue(option)
    setShowModal(false)
  }

  const handleDiscardChange = () => {
    Alert.alert(
      'Are you sure?',
      'Are you sure you want to discard this draft?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => onDiscard(),
        },
      ],
      { cancelable: false }
    )
  }

  function onDiscard() {
    fetchTloList()
  }

  const handleOverlayPressShow = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false)
    }
  }

  function demoValue(item) {
    if (item === 1) {
      return 'No'
    } else if (item === 2) {
      return 'Yes'
    } else return ''
  }

  function TLODropdowns() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: '85%' }}>
          <ScrollView style={styles.scrollview}>
            <View style={{ marginTop: 12 }}>
              <View style={styles.header}>
                <CollapsibleView
                  title={
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '700',
                        width: '95%',
                        color: Constants.app_text_color,
                      }}
                    >
                      TLO Details
                    </Text>
                  }
                  style={{ borderWidth: 0, borderRadius: 5 }}
                  titleStyle={{ alignSelf: 'flex-start' }}
                  isRTL
                  arrowStyling={{
                    size: 17,
                    rounded: true,
                    thickness: 1.5,
                    color: 'black',
                    alignItems: 'flex-start',
                  }}
                  // noArrow={true}
                >
                  <View>
                    <Text style={styles.title}>TLO Name</Text>
                    <Text style={styles.response}>
                      {TLOResponse?.tlodata?.name}
                    </Text>
                    <Text style={styles.title}>Designation</Text>
                    <Text style={styles.response}>
                      {TLOResponse?.tlodata?.designation}
                    </Text>
                    <Text style={styles.title}>Employee ID</Text>
                    <Text style={styles.response}>
                      {TLOResponse?.tlodata?.uid}
                    </Text>
                  </View>
                </CollapsibleView>
              </View>
            </View>
            <View style={{ marginTop: 12 }}>
              <View style={styles.header}>
                <CollapsibleView
                  title={
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '700',
                        width: '95%',
                        color: Constants.app_text_color,
                      }}
                    >
                      Mentor Details
                    </Text>
                  }
                  style={{ borderWidth: 0, borderRadius: 5 }}
                  titleStyle={{ alignSelf: 'flex-start' }}
                  isRTL
                  arrowStyling={{
                    size: 17,
                    rounded: true,
                    thickness: 1.5,
                    color: 'black',
                    alignItems: 'flex-start',
                  }}
                  // noArrow={true}
                >
                  <View>
                    <Text style={styles.title}>Mentor LO Name</Text>
                    <Text style={styles.response}>
                      {TLOResponse?.mdetails?.name}
                    </Text>
                    <Text style={styles.title}>Mentor LO Employee ID</Text>
                    <Text style={styles.response}>
                      {TLOResponse?.mdetails?.uid}
                    </Text>
                    <Text style={styles.title}>Allocated Branch ID</Text>
                    <Text style={styles.response}>
                      {TLOResponse?.mdetails?.branch_code}
                    </Text>
                    <Text style={styles.title}>Allocated Branch Name</Text>
                    <Text style={styles.response}>
                      {TLOResponse?.mdetails?.branch_name}
                    </Text>
                    <Text style={styles.title}>Mentor LO Branch Code</Text>
                    <Text style={styles.response}>
                      {TLOResponse?.mdetails?.branch_code}
                    </Text>
                    <Text style={styles.title}>Cluster</Text>
                    <Text style={styles.response}>
                      {TLOResponse?.mdetails?.cluster_name}
                    </Text>
                    <Text style={styles.title}>Area</Text>
                    <Text style={styles.response}>
                      {TLOResponse?.mdetails?.area_name}
                    </Text>
                    <Text style={styles.title}>Region</Text>
                    <Text style={styles.response}>
                      {TLOResponse?.mdetails?.region_name}
                    </Text>
                    <Text style={styles.title}>State</Text>
                    <Text style={styles.response}>
                      {TLOResponse?.mdetails?.state_name}
                    </Text>
                    <Text style={styles.title}>Zone</Text>
                    <Text style={styles.response}>
                      {TLOResponse?.mdetails?.zone}
                    </Text>
                  </View>
                </CollapsibleView>
              </View>
            </View>
            <View style={{ marginTop: 12 }}>
              <View style={styles.header}>
                <CollapsibleView
                  title={
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '700',
                        width: '95%',
                        color: Constants.app_text_color,
                      }}
                    >
                      Activities
                    </Text>
                  }
                  style={{ borderWidth: 0, borderRadius: 5 }}
                  titleStyle={{ alignSelf: 'flex-start' }}
                  isRTL
                  arrowStyling={{
                    size: 17,
                    rounded: true,
                    thickness: 1.5,
                    color: 'black',
                    alignItems: 'flex-start',
                  }}
                >
                  <View style={{ marginTop: 10 }}>
                    {TLOResponse?.activities?.map((item, Idx) => (
                      <View
                        style={{
                          marginTop: 15,
                        }}
                      >
                        <Text
                          style={{
                            color: Constants.app_button_color,
                            fontWeight: '600',
                            fontSize: 14,
                            borderWidth: 1,
                            borderColor: 'orange',
                            paddingVertical: 10,
                            borderRadius: 5,
                            paddingLeft:'5%'
                          }}
                          onPress={() => {
                            navigation.navigate('ActivitiesTlo', {
                              item: item,
                              Idx: Idx,
                              TLOResponse: TLOResponse,
                              SingleUser: handleChange,
                            })
                          }}
                        >
                          {item.act_name}
                        </Text>
                      </View>
                    ))}
                  </View>
                </CollapsibleView>
              </View>
            </View>
          </ScrollView>
        </View>
        <Modal visible={showModal} transparent>
          <TouchableWithoutFeedback onPress={handleOverlayPressShow}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 20,
                  borderRadius: 10,
                  width: '20%',
                  height: '12%',
                }}
              >
                <Text
                  style={{ marginBottom: 10 }}
                  onPress={() => selectOption('Yes')}
                >
                  Yes
                </Text>
                <Text
                  style={{ marginBottom: 20 }}
                  onPress={() => selectOption('No')}
                >
                  No
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <View style={{ justifyContent: 'flex-end', flex: 1 }}>
          <TouchableHighlight
            underlayColor="transparent"
            onPress={() => handleSaveChange()}
          >
            <View style={styles.saveButtonHolder}>
              <Text style={styles.saveText}>Save</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="transparent"
            onPress={() => handleDiscardChange()}
          >
            <View style={styles.discardButtonHolder}>
              <Text style={styles.discardText}>Discard</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    )
  }

  const userDesignation = userDetails?.uData?.designation?.toLowerCase()

  return (
    <View style={styles.container}>
      <LinearGradient
        start={{ x: 0.0, y: 0.0 }}
        end={{ x: 0.0, y: 1.0 }}
        colors={['#FFFFFF', '#FFFFFF']}
        style={styles.screenstyle}
      >
        <View style={styles.statusBar}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={Constants.app_statusbar_color}
            translucent
          />
        </View>
        <View>
          <Modal
            animationType="none"
            transparent
            visible={modalSpinner}
            onRequestClose={onDismissLoadingCallback}
          >
            <View style={styles.spinnerStyle}>
              <ActivityIndicator
                animating
                size="large"
                color={Constants.app_button_color}
              />
            </View>
          </Modal>
        </View>
        <Toolbar
          center={<Image source={appLogo} style={styles.appLogo} />}
          right={
            <TouchableOpacity
              onPress={showNotification}
              style={styles.notifyHolder}
            >
              <Image source={notificationIcon} style={styles.notifyImage} />
            </TouchableOpacity>
          }
        />
        <View style={styles.spinnerView}>
          {!networkStatusRef.current && (
            <Text style={[styles.noNetwork, styles.appFontFamily]}>
              No internet connectivity
            </Text>
          )}
        </View>
        {!isLoading ? (
          renderDesignationText()
        ) : (
          <SkeletonLoader loader="notification" />
        )}
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.app_background_color,
  },
  screenstyle: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight - 5,
      },
    }),
  },
  spinnerView: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    opacity: 0.8,
    zIndex: 1000,
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
  requiredIcon: {
    height: 22,
    width: 22,
    marginTop: -2,
  },
  scrollview: {
    // backgroundColor: 'red'
    // bottom: 50,
  },
  emptyData: {
    marginTop: 20,
    flex: 1,
    height: Platform.OS === 'ios' ? 87.5 : 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft:
      Platform.OS === 'ios'
        ? Constants.app_width / 2 - 187.5
        : Constants.app_width / 2 - 180,
  },
  emptyTitleHolder: {
    height: 20,
  },
  emptyText: {
    color: '#484848',
    ...Platform.select({
      ios: {
        fontSize: 15,
      },
      android: {
        fontSize: 14,
      },
    }),
    fontFamily: Constants.app_font_family_regular,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  button: {
    // borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    borderRadius: 10,
    backgroundColor: Constants.app_button_color,
    width: '40%',
    marginTop: 20,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 0.5,
    borderColor: 'black',
    borderRadius: 5,
    height: 35,
    marginVertical: 10,
    width: '100%',
  },
  notifyImage: {
    height: 30,
    width: 30,
  },
  notifyHolder: {
    ...Platform.select({
      ios: {
        marginTop: -40,
      },
      android: {
        marginTop: -48,
      },
    }),
  },
  appLogo: {
    height: 30,
    width: 50,
    ...Platform.select({
      ios: {
        marginTop: -17,
      },
      android: {
        marginTop: -35,
      },
    }),
  },
  header: {
    width: '90%',
    paddingVertical: 6,
    marginHorizontal: '5%',
    borderWidth: 0.2,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 5,
        elevation: 2,
        borderRadius: 5,
      },
    }),
  },
  saveButtonHolder: {
    height: 35,
    backgroundColor: Constants.app_button_color,
    borderRadius: 5,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  saveText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 7,
    alignSelf: 'center',
    marginHorizontal: 20,
  },
  discardButtonHolder: {
    height: 35,
    borderColor: Constants.app_button_color,
    borderWidth: 1,
    borderRadius: 5,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  discardText: {
    color: Constants.app_button_color,
    fontWeight: '700',
    fontSize: 16,
    marginTop: 7,
    alignSelf: 'center',
    marginHorizontal: 20,
  },
  subButtonHolder: {
    height: 35,
    borderColor: Constants.app_button_color,
    borderWidth: 1,
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subButtonText: {
    color: Constants.app_button_color,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 7,
    marginLeft: 20,
    marginRight: 5,
  },
  infoButton: {
    height: 15,
    width: 15,
    marginTop: 8,
  },
  nextButton: {
    height: 15,
    width: 15,
    marginTop: 8,
    right: 10,
  },
  title: {
    marginTop: 10,
    fontWeight: '600',
    fontSize: 16,
  },
  response: {
    borderWidth: 0.5,
    marginTop: 4,
    borderRadius: 5,
    padding: 5,
    backgroundColor: '#f0f0f0',
  },
  responseEdit: {
    borderWidth: 0.5,
    marginTop: 4,
    borderRadius: 5,
    padding: 5,
  },
})
