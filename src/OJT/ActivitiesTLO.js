import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableHighlight,
  StatusBar,
  Image,
} from 'react-native'
import React, { useState } from 'react'
import Toolbar from '../Profile/Toolbar'
import LinearGradient from 'react-native-linear-gradient'
import { useNavigation } from '@react-navigation/core'
import Constants from '../constants'

const backIcon = require('../Assets/Images/back.png')

export default function ActivitiesTlo(props) {
  const { route } = props
  const { item, Idx, TLOResponse, row } = route.params
  console.log(JSON.stringify(item))
  const [selectedValue, setSelectedValue] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const navigation = useNavigation()

  console.log(JSON.stringify(item))
  const handleChange = (event, type, Idx) => {
    TLOResponse.activities[Idx][type] = event
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
      handleChange(2, 'demon_by_tlo', Idx)
    } else {
      handleChange(1, 'demon_by_tlo', Idx)
    }
    setSelectedValue(option)
    setShowModal(false)
  }

  function onBackPressed() {
    navigation.goBack()
  }

  function tloDemoValue(item) {
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
        <View style={{ height: '85%' }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}
            ></View>
            <View style={{ marginTop: 12, marginHorizontal: 20 }}>
              <Text style={styles.title}>Activity Name</Text>
              <Text style={styles.response}>{item.act_name}</Text>
              <Text style={styles.title}>Start Date</Text>
              <Text style={styles.response}>{item.start_date}</Text>
              <Text style={styles.title}>End Date</Text>
              <Text style={styles.response}>{item.end_date}</Text>
              <Text style={styles.title}>Demonstration By TLO</Text>
              <Text
                onPress={() => {
                  setShowModal(true)
                }}
                style={styles.responseEdit}
              >
                {tloDemoValue(item.demon_by_tlo)}
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
                  item?.no_time_demo_tlo === null
                    ? 0
                    : JSON.stringify(item?.no_time_demo_tlo)
                }
                keyboardType="numeric"
                onChangeText={(e) => {
                  const inputValue = e
                  if (/^[0-9]*$/.test(inputValue)) {
                    handleChange(e, 'no_time_demo_tlo', Idx)
                  } else if (inputValue === '') {
                    TLOResponse.activities[Idx].no_time_demo_tlo = ''
                  } else {
                    e = TLOResponse.activities[Idx].no_time_demo_tlo
                  }
                }}
              />
              <Text style={styles.title}>Demonstration By Mentor</Text>
              <Text style={styles.response}>
                {demoValue(item?.demon_by_mentor)}
              </Text>
              <Text style={styles.title}>No. of time-Demo</Text>
              <Text style={styles.response}>
                {item?.no_time_demo_mentor !== null && item?.no_time_demo_mentor}
              </Text>
              <Text style={styles.title}>Learnings</Text>
              <TextInput
                style={styles.responseEdit}
                defaultValue={item?.tlo_comments}
                multiline
                onChangeText={(e) => handleChange(e, 'tlo_comments', Idx)}
              />
              <Text style={styles.title}>Comments or Remarks</Text>
              <Text style={styles.response}>{item?.mn_comments}</Text>
            </View>
          </ScrollView>
        </View>
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
