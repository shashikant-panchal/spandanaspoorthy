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
  TouchableWithoutFeedback,
} from 'react-native'
import React, { useState } from 'react'
import Toolbar from '../Profile/Toolbar'
import LinearGradient from 'react-native-linear-gradient'
import { useSelector } from 'react-redux'
import { authData } from '../redux/auth/authSlice'
import { API } from 'aws-amplify'
import config from '../../aws-exports'
import { useNavigation } from '@react-navigation/core'
import Constants from '../constants'

const backIcon = require('../Assets/Images/back.png')
const editIcon = require('../Assets/Images/edit.png')
const deleteIcon = require('../Assets/Images/delete.png')

export default function ActivitiesBM(props) {
  let userDetails = useSelector(authData)
  const { route } = props
  const { item, Idx, response, row, SingleUser, handleChange } = route.params

  const [selectedValue, setSelectedValue] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [actvityModalVisible, setActivityModalVisible] = useState(false)
  const [editedActivityName, setEditedActivityName] = useState('')
  const tloDesignations = ['credit assistant', 'tlo']
  const designation = userDetails?.uData?.designation?.toLowerCase()
  const isTlo = tloDesignations.includes(designation)

  const navigation = useNavigation()

  function bmDemoValue(item) {
    if (selectedValue === null) {
      if (item === 1) {
        return 'No'
      } else if (item === 2) {
        return 'Yes'
      }
    } else {
      return selectedValue
    }
  }

  function demoValue(item) {
    if (item === 1) {
      return 'No'
    } else if (item === 2) {
      return 'Yes'
    } else return ''
  }

  const selectOption = (option, Idx) => {
    if (option === 'Yes') {
      handleChange(2, 'demon_by_bm', Idx)
    } else {
      handleChange(1, 'demon_by_bm', Idx)
    }
    setSelectedValue(option)
    setShowModal(false)
  }

  function onBackPressed() {
    SingleUser(row, 2)
    navigation.goBack()
  }

  const updateActivitie = async (body) => {
    if (body) {
      const bodyParam = {
        body,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
      console.log(JSON.stringify(bodyParam.body))
      try {
        const response = await API.post(
          config.aws_cloud_logic_custom_name,
          '/updateActivities',
          bodyParam
        )
        console.log(JSON.stringify(response))
        handleChange(body.act_name, 'act_name', Idx)
        Alert.alert(
          'Success',
          'Activity name updated successfully',
          [{ text: 'Ok', onPress: () => SingleUser(row, 2) }],
          { cancelable: false }
        )
      } catch (error) {
        console.log(error)
      }
    }
    setActivityModalVisible(false)
    SingleUser(row, 2)
  }

  const deleteActivities = async (item) => {
    Alert.alert('Are you sure?', `You won't be able to revert this`, [
      {
        text: 'Yes!',
        onPress: async () => {
          const bodyParam = {
            body: {
              ur_id: row?.ur_id,
              act_id: item?.act_id,
            },
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          }
          try {
            const response = await API.del(
              config.aws_cloud_logic_custom_name,
              '/deleteActivities',
              bodyParam
            )
            onBackPressed()
          } catch (error) {
            console.log(error)
          }
        },
      },
      { text: 'No!', onPress: () => console.log('No Pressed') },
    ])
  }

  const handleOverlayPressActivity = (e) => {
    if (e.target === e.currentTarget) {
      setActivityModalVisible(false)
    }
  }

  const openModal = (item) => {
    setEditedActivityName(item)
    setActivityModalVisible(true)
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
                  {item?.act_name}
                </Text>
              </View>
            </View>
          }
        />
        <View style={{flex:1 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}
            >
              <TouchableOpacity onPress={() => openModal(item)}>
                <Image
                  style={{
                    marginRight: 5,
                    height: 25,
                    width: 25,
                    marginTop: 5,
                  }}
                  source={editIcon}
                />
              </TouchableOpacity>
              {!isTlo &&
                (item.start_date ||
                  item.demon_by_tlo ||
                  item.demon_by_mentor ||
                  item.demon_by_bm) && (
                  <TouchableOpacity onPress={() => deleteActivities(item)}>
                    <Image
                      source={deleteIcon}
                      style={{
                        marginLeft: 5,
                        height: 25,
                        width: 25,
                        marginTop: 5,
                      }}
                    />
                  </TouchableOpacity>
                )}
            </View>
            <View style={{justifyContent:'center', alignSelf:'center', width:'90%', padding:'2%' }}>
              <Text style={styles.title}>Activity Name</Text>
              <Text style={styles.response}>{item.act_name}</Text>
              <Text style={styles.title}>Start Date</Text>
              <Text style={styles.response}>{item.start_date}</Text>
              <Text style={styles.title}>End Date</Text>
              <Text style={styles.response}>{item.end_date}</Text>
              <Text style={styles.title}>Demonstration By TLO</Text>
              <Text style={styles.response}>
                {demoValue(item?.demon_by_tlo)}
              </Text>
              <Text style={styles.title}>No. of time-Demo</Text>
              <Text style={styles.response}>
                {item?.no_time_demo_tlo !== null && item?.no_time_demo_tlo}
              </Text>
              <Text style={styles.title}>Demonstration By Mentor</Text>
              <Text style={styles.response}>
                {demoValue(item?.demon_by_mentor)}
              </Text>
              <Text style={styles.title}>No. of time-Demo</Text>
              <Text style={styles.response}>
                {item?.no_time_demo_mentor !== null &&
                  item?.no_time_demo_mentor}
              </Text>
              <Text style={styles.title}>Demonstration By BM</Text>
              <Text
                onPress={() => {
                  setShowModal(true)
                }}
                style={styles.responseEdit}
              >
                {bmDemoValue(item.demon_by_bm)}
              </Text>
              {showModal === true && (
                <View
                  style={{
                    backgroundColor: 'white',
                    padding: 20,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{ marginBottom: 10 }}
                    onPress={() => selectOption('Yes', Idx)}
                  >
                    Yes
                  </Text>
                  <Text
                    style={{ marginBottom: 20 }}
                    onPress={() => selectOption('No', Idx)}
                  >
                    No
                  </Text>
                </View>
              )}
              <Text style={styles.title}>No. of time-Demo</Text>
              <TextInput
                style={styles.responseEdit}
                defaultValue={
                  item?.no_time_demo_bm === null
                    ? 0
                    : JSON.stringify(item?.no_time_demo_bm)
                }
                keyboardType="numeric"
                onChangeText={(e) => {
                  const inputValue = e
                  if (/^[0-9]*$/.test(inputValue)) {
                    handleChange(e, 'no_time_demo_bm', Idx)
                  } else if (inputValue === '') {
                    response.activities[Idx].no_time_demo_bm = ''
                  } else {
                    e = response.activities[Idx].no_time_demo_bm
                  }
                }}
              />
              <Text style={styles.title}>Learnings</Text>
              <Text style={styles.response}>{item?.tlo_comments}</Text>
              <Text style={styles.title}>Comments or Remarks</Text>
              <Text style={styles.response}>{item?.mn_comments}</Text>
              <Text style={styles.title}>Comments or Remarks by BM</Text>
              <TextInput
                style={styles.responseEdit}
                defaultValue={item?.bm_comments}
                multiline
                onChangeText={(e) => handleChange(e, 'bm_comments', Idx)}
              />
            </View>
          </ScrollView>
        </View>
        <Modal visible={actvityModalVisible} transparent>
          <TouchableWithoutFeedback onPress={handleOverlayPressActivity}>
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
                  editable={true}
                  style={styles.input}
                  defaultValue={editedActivityName.act_name}
                  placeholder="Edit Activity *"
                  onChangeText={(e) => {
                    setEditedActivityName((prevState) => ({
                      ...prevState,
                      act_name: e,
                    }))
                  }}
                />

                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => updateActivitie(editedActivityName)}
                >
                  <View style={styles.saveButtonHolder}>
                    <Text style={styles.saveText}>Update</Text>
                  </View>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => setActivityModalVisible(false)}
                >
                  <View style={styles.saveButtonHolder}>
                    <Text style={styles.saveText}>Cancel</Text>
                  </View>
                </TouchableHighlight>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
