import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Modal,
  TouchableHighlight,
  StatusBar,
  Image,
  TouchableOpacity,
  Alert,
  Button,
  TouchableWithoutFeedback,
} from 'react-native'
import React, { useState } from 'react'
import CollapsibleView from '@eliav2/react-native-collapsible-view'
import Toolbar from '../Profile/Toolbar'
import LinearGradient from 'react-native-linear-gradient'
import { useSelector } from 'react-redux'
import { authData } from '../redux/auth/authSlice'
import { API } from 'aws-amplify'
import config from '../../aws-exports'
import { useNavigation } from '@react-navigation/core'
import Constants from '../constants'
import Collapsible from 'react-native-collapsible'

const backIcon = require('../Assets/Images/back.png')

export const DropDownBM = (props) => {
  let userDetails = useSelector(authData)
  const { route } = props
  const { row, response, SingleUser, fetchTloList } = route.params

  const [modalVisible, setModalVisible] = useState(false)
  const [activityName, setActivityName] = useState('')
  const [activityError, setActivityError] = useState('')
  const [rccModalVisible, setRecModalVisible] = useState(false)
  const [isRecommendationCollapsed, setIsRecommendationCollapsed] =
    useState(true)
  const [isReasonCollapsed, setIsReasonCollapsed] = useState(true)
  const [selectedRecommendation, setSelectedRecommendation] = useState(null)
  const [selectedRecommendationText, setSelectedRecommendationText] =
    useState('')
  const [selectedReason, setSelectedReason] = useState(null)
  const [selectedReasonText, setSelectedReasonText] = useState('')
  const [validationText, setValidationText] = useState('')

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
          onPress: () => onBackPressed(),
        },
      ],
      { cancelable: false }
    )
  }

  const handleToggleRecommendationCollapse = () => {
    setIsRecommendationCollapsed(!isRecommendationCollapsed)
  }

  const handleToggleReasonCollapse = () => {
    setIsReasonCollapsed(!isReasonCollapsed)
  }

  const handleOptionSelect = (option, type) => {
    if (type === 'recommendation') {
      if (option === 'Recommended') {
        setSelectedRecommendation(1)
        setSelectedRecommendationText('Recommend')
      } else {
        setSelectedRecommendation(2)
        setSelectedRecommendationText('Not Recommend')
      }
      handleToggleRecommendationCollapse()
    } else if (type === 'reason') {
      if (option === 'Suitable') {
        setSelectedReason('1')
        setSelectedReasonText('Suitable')
      } else if (option === 'NotSuitable') {
        setSelectedReason('2')
        setSelectedReasonText('Not Suitable')
      } else if (option === 'Absconded') {
        setSelectedReason('3')
        setSelectedReasonText('Absconded')
      } else {
        setSelectedReason('4')
        setSelectedReasonText('Resigned')
      }
      handleToggleReasonCollapse()
    }
  }

  const recommendText = (option) => {
    if (option === 1) {
      return 'Recommend'
    } else {
      return 'Not Recommend'
    }
  }

  const recommendReasonText = (option) => {
    if (option === 1) {
      return 'Suitable'
    } else if (option === 2) {
      return 'Not Suitable'
    } else if (option === 3) {
      return 'Absconded'
    } else {
      return 'Resigned'
    }
  }

  const handleRecommendButtonPress = () => {
    setRecModalVisible(true)
  }

  const tloDesignations = ['credit assistant', 'tlo']

  const designation = userDetails?.uData?.designation?.toLowerCase()

  const isTlo = tloDesignations.includes(designation)

  const navigation = useNavigation()

  const handleChange = (event, type, Idx) => {
    response.activities[Idx][type] = event
  }

  const handleSaveChange = async () => {
    const obj = {
      ur_id: tloDesignations.includes(designation)
        ? userDetails.uData.ur_id
        : row?.ur_id,
      mid: response?.mdetails?.ur_id,
      activities: response.activities,
    }
    try {
      const res = await updateUserActivities(obj)
      if (res.statusCode === 200) {
        Alert.alert(
          'Success',
          'Your activity data updated successfully!',
          [{ text: 'Ok', onPress: () => SingleUser(row, 2) }],
          { cancelable: false }
        )
      }
      // SingleUser(row, 2)
    } catch (error) {
      console.error('An error occurred:', error)
    }
  }

  const updateUserRecommend = async () => {
    if (selectedRecommendation === null || selectedReason === null) {
      if (selectedRecommendation === null) {
        setValidationText('Select Recommendation Status')
      } else if (selectedReason === null) {
        setValidationText('Select a reason')
      } else {
        setValidationText('')
      }
    } else {
      const bodyParam = {
        body: {
          recommend: selectedRecommendation,
          reason: selectedReason,
          ur_id: [row?.ur_id],
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
      console.log(JSON.stringify(bodyParam.body))
      try {
        const response = await API.post(
          config.aws_cloud_logic_custom_name,
          '/updateUserRecommend',
          bodyParam
        )
        Alert.alert(
          'Success',
          'User recommended successfully',
          [{ text: 'Ok', onPress: () => updateUserSuccess() }],
          { cancelable: false }
        )
      } catch (error) {
        console.log(error)
      }
    }
  }

  const updateUserSuccess = () => {
    setRecModalVisible(false)
    fetchTloList()
    onBackPressed()
  }

  const discardUserRecommend = () => {
    setSelectedRecommendation(null)
    setSelectedReason(null)
    setSelectedRecommendationText('')
    setSelectedReasonText('')
    setRecModalVisible(false)
    setValidationText('')
    setIsRecommendationCollapsed(!isRecommendationCollapsed)
    setIsReasonCollapsed(!isReasonCollapsed)
  }

  const createActivities = async () => {
    if (!activityName.trim()) {
      setActivityError('Activity should not be empty')
      return
    }
    setActivityError('')
    let body = {}
    body.act_name = activityName
    body.atype = 0
    try {
      const res = await API.post(
        config.aws_cloud_logic_custom_name,
        '/createActivities',
        {
          body,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )
      Alert.alert(
        'Success!',
        'Activity added successfully',
        [
          {
            text: 'OK',
            onPress: () => SingleUser(row, 2),
          },
        ],
        { cancelable: false }
      )
      setActivityName('')
      setModalVisible(false)
      return res
    } catch (err) {
      throw err
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

  function onBackPressed() {
    navigation.goBack()
  }

  const handleOverlayPress = (e) => {
    if (e.target === e.currentTarget) {
      setModalVisible(false)
    }
  }

  const handleOverlayPressRcc = (e) => {
    if (e.target === e.currentTarget) {
      setRecModalVisible(false)
    }
  }

  const DropDownView = () => {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: '85%' }}>
          <ScrollView style={styles.scrollview}>
            <View>
              {row.recommend != null && (
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
                          Recommendation Details
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
                      <View>
                        <Text style={styles.title}>Recommend</Text>
                        <Text style={styles.response}>
                          {recommendText(row?.recommend)}
                        </Text>
                        <Text style={styles.title}>Date</Text>
                        <Text style={styles.response}>{row?.rdate}</Text>
                        <Text style={styles.title}>Reason</Text>
                        <Text style={styles.response}>
                          {recommendReasonText(row?.reason)}
                        </Text>
                      </View>
                    </CollapsibleView>
                  </View>
                </View>
              )}
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
                    <Text style={styles.response}>{row.name}</Text>
                    <Text style={styles.title}>Designation</Text>
                    <Text style={styles.response}>{row.designation}</Text>
                    <Text style={styles.title}>Employee ID</Text>
                    <Text style={styles.response}>{row.uid}</Text>
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
                >
                  <View>
                    <Text style={styles.title}>Mentor LO Name</Text>
                    <Text style={styles.response}>
                      {response?.mdetails?.name}
                    </Text>
                    <Text style={styles.title}>Mentor LO Employee ID</Text>
                    <Text style={styles.response}>
                      {response?.mdetails?.uid}
                    </Text>
                    <Text style={styles.title}>Allocated Branch ID</Text>
                    <Text style={styles.response}>
                      {response?.mdetails?.branch_code}
                    </Text>
                    <Text style={styles.title}>Allocated Branch Name</Text>
                    <Text style={styles.response}>
                      {response?.mdetails?.branch_name}
                    </Text>
                    <Text style={styles.title}>Mentor LO Branch Code</Text>
                    <Text style={styles.response}>
                      {response?.mdetails?.branch_code}
                    </Text>
                    <Text style={styles.title}>Cluster</Text>
                    <Text style={styles.response}>
                      {response?.mdetails?.cluster_name}
                    </Text>
                    <Text style={styles.title}>Area</Text>
                    <Text style={styles.response}>
                      {response?.mdetails?.area_name}
                    </Text>
                    <Text style={styles.title}>Region</Text>
                    <Text style={styles.response}>
                      {response?.mdetails?.region_name}
                    </Text>
                    <Text style={styles.title}>State</Text>
                    <Text style={styles.response}>
                      {response?.mdetails?.state_name}
                    </Text>
                    <Text style={styles.title}>Zone</Text>
                    <Text style={styles.response}>
                      {response?.mdetails?.zone}
                    </Text>
                  </View>
                </CollapsibleView>
              </View>
            </View>
            <View style={{ marginTop: 12 }}>
              <View style={styles.header}>
                <View>
                  {response.activities === undefined ? (
                    <View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '700',
                          width: '95%',
                          color: Constants.app_text_color,
                          padding: 10,
                        }}
                      >
                        Activities
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('Activities', {
                          response: response,
                          row: row,
                          SingleUser: SingleUser,
                          handleChange: handleChange,
                        })
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '700',
                          width: '95%',
                          color: Constants.app_text_color,
                          padding: 10,
                        }}
                      >
                        Activities
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        <Modal transparent visible={rccModalVisible}>
          <TouchableWithoutFeedback onPress={handleOverlayPressRcc}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={{ color: 'red' }}>{validationText}</Text>
                <Text style={styles.heading}>Recommendation</Text>
                <TouchableOpacity
                  style={[
                    styles.selectedOptionContainer,
                    styles.recommendationContainer,
                  ]}
                  onPress={handleToggleRecommendationCollapse}
                >
                  <Text style={styles.selectedOptionText}>
                    {selectedRecommendationText || 'Select a recommendation'}
                  </Text>
                </TouchableOpacity>

                <Collapsible collapsed={isRecommendationCollapsed}>
                  <View style={styles.collapseContent}>
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() =>
                        handleOptionSelect('Recommended', 'recommendation')
                      }
                    >
                      <Text style={styles.optionText}>Recommended</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() =>
                        handleOptionSelect('NotRecommended', 'recommendation')
                      }
                    >
                      <Text style={styles.optionText}>Not Recommended</Text>
                    </TouchableOpacity>
                  </View>
                </Collapsible>

                <Text style={styles.heading2}>Reason</Text>

                <TouchableOpacity
                  style={[
                    styles.selectedOptionContainer,
                    styles.reasonContainer,
                  ]}
                  onPress={handleToggleReasonCollapse}
                >
                  <Text style={styles.selectedOptionText}>
                    {selectedReasonText || 'Select a reason'}
                  </Text>
                </TouchableOpacity>

                <Collapsible collapsed={isReasonCollapsed}>
                  <View style={styles.collapseContent}>
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() => handleOptionSelect('Suitable', 'reason')}
                    >
                      <Text style={styles.optionText}>Suitable</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() =>
                        handleOptionSelect('NotSuitable', 'reason')
                      }
                    >
                      <Text style={styles.optionText}>Not Suitable</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() => handleOptionSelect('Absconded', 'reason')}
                    >
                      <Text style={styles.optionText}>Absconded</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() => handleOptionSelect('Resigned', 'reason')}
                    >
                      <Text style={styles.optionText}>Resigned</Text>
                    </TouchableOpacity>
                  </View>
                </Collapsible>

                <View style={styles.buttonContainer}>
                  <Button
                    title="Add"
                    onPress={() => updateUserRecommend()}
                    color={Constants.app_button_color}
                  />
                  <Button
                    color={Constants.app_button_color}
                    title="Discard"
                    onPress={() => discardUserRecommend()}
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <Modal
          transparent
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible)
          }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={handleOverlayPress}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 20,
                  borderRadius: 10,
                  width: '80%',
                }}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Enter Activity *"
                  value={activityName}
                  onChangeText={(value) => {
                    setActivityName(value)
                    setActivityError('')
                  }}
                />

                <Text style={{ color: 'red' }}>{activityError}</Text>

                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={createActivities}
                >
                  <View style={styles.saveButtonHolder}>
                    <Text style={styles.saveText}>Add</Text>
                  </View>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => setModalVisible(false)}
                >
                  <View style={styles.saveButtonHolder}>
                    <Text style={styles.saveText}>Cancel</Text>
                  </View>
                </TouchableHighlight>
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
                  {userDetails?.uData.designation}
                </Text>
              </View>
              {row.recommend === null && (
                <Button
                  title="Recommend"
                  onPress={() => handleRecommendButtonPress(row.id)}
                />
              )}
            </View>
          }
        />
        <DropDownView />
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
  passinput: {
    borderWidth: 0.5,
    borderColor: 'black',
    borderRadius: 5,
    ...Platform.select({
      ios: {
        height: 35,
      },
      android: {
        // height: 35,
      },
    }),
    width: '65%',
    color: 'black',
  },
  toolBarHolder: {
    flexDirection: 'row',
    alignItems: 'center',
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
    width: Constants.app_width - 200,
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
  responseD: {
    borderWidth: 0.5,
    marginTop: 4,
    borderRadius: 5,
    padding: 5,
    backgroundColor: 'white',
    placeholderTextColor: 'black',
  },
  responseEdit: {
    borderWidth: 0.5,
    marginTop: 4,
    borderRadius: 5,
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    elevation: 5,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    marginTop: 15,
  },
  selectedOptionContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
  },
  recommendationContainer: {
    borderColor: 'skyblue',
  },
  reasonContainer: {
    borderColor: 'skyblue',
  },
  selectedOptionText: {
    fontSize: 16,
    color: '#333',
  },
  optionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
})
