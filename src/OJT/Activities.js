import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { authData } from '../redux/auth/authSlice'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  TouchableHighlight,
  Image,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native'
import Constants from '../constants'
import { useNavigation } from '@react-navigation/native'
import Toolbar from '../Profile/Toolbar'
import { API } from 'aws-amplify'
import config from '../../aws-exports'

const backIcon = require('../Assets/Images/back.png')

export const Activities = (props) => {
  const { route } = props
  const { response, row, SingleUser, handleChange } = route.params
  const [actvityModalVisible, setActivityModalVisible] = useState(false)
  const [activityName, setActivityName] = useState()
  const [activityError, setActivityError] = useState('')
  const navigation = useNavigation()

  const userDetails = useSelector(authData)
  const isTLO = userDetails?.uData?.designation?.toLowerCase()

  const onBackPressed = () => {
    navigation.goBack()
  }

  const handleOverlayPressActivity = (e) => {
    if (e.target === e.currentTarget) {
      setActivityModalVisible(false)
    }
  }

  const createActivities = async () => {
    if (activityName === undefined || activityName.trim().length === 0) {
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
      setActivityModalVisible(false)
      return res
    } catch (err) {
      throw err
    }
  }

  return (
    <View style={styles.container}>
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
              <Text style={styles.headerStyle}>Activities</Text>
            </View>
          </View>
        }
      />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Activities</Text>

          {response?.activities.map((item, Idx) => (
            <View style={styles.activityContainer}>
              <Text
                onPress={() => {
                  navigation.navigate(
                    isTLO === 'branch manager'
                      ? 'ActivitiesBM'
                      : 'ActivitiesMentor',
                    {
                      item: item,
                      Idx: Idx,
                      response: response,
                      SingleUser: SingleUser,
                      row: row,
                      handleChange: handleChange
                    }
                  )
                }}
                style={styles.activityText}
              >
                {item.act_name}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={actvityModalVisible}
        onRequestClose={() => {
          setActivityModalVisible(!actvityModalVisible)
        }}
        keyboardShouldPersistTaps="handled"
      >
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

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setActivityModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add New Activity</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  activityContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
  },
  activityText: {
    color: Constants.app_button_color,
    fontWeight: '600',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: Constants.app_button_color,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 60,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  backButton: {
    width: 25,
    height: 25,
    tintColor: '#000000',
    alignSelf: 'center',
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
})
