import React, { useEffect, useState } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Button,
  Modal,
  Alert,
  TouchableHighlight,
} from 'react-native'
import { useSelector } from 'react-redux'
import { authData } from '../redux/auth/authSlice'
import config from '../../aws-exports'
import { API } from 'aws-amplify'
import { useNavigation } from '@react-navigation/core'
import SkeletonLoader from '../common/appSkeletonLoader'
import Collapsible from 'react-native-collapsible'
import { awsSignIn } from '../redux/auth/authSlice'
import Constants from '../constants'
import { dh, dw } from '../constants/Dimensions'

const OJTLOBM = () => {
  const [filterData, setFilterData] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [checkedItems, setCheckedItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const tloDesignations = ['credit assistant', 'tlo']
  const [rccModalVisible, setRecModalVisible] = useState(false)
  const [isRecommendationCollapsed, setIsRecommendationCollapsed] =
    useState(true)
  const [isReasonCollapsed, setIsReasonCollapsed] = useState(true)
  const [selectedRecommendation, setSelectedRecommendation] = useState()
  const [selectedRecommendationText, setSelectedRecommendationText] =
    useState('')
  const [selectedReason, setSelectedReason] = useState('')
  const [selectedReasonText, setSelectedReasonText] = useState('')
  const [isUserSelected, setIsUserSelected] = useState(false)
  const [validationText, setValidationText] = useState('')

  useEffect(() => {
    fetchTloList()
    fetchMentorList()
    fetchAllTopics()
  }, [])

  const SearchIcon = require('../Assets/Images/Search-OJT.png')

  let userDetails = useSelector(authData)
  const navigation = useNavigation()

  async function fetchMentorList() {
    var body = {}
    body.method = 'get'
    let response = await getMentorDetails(userDetails)
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
    response.tlodata = { name, designation, uid }
  }

  const getMentorDetails = async ({ uData, tlodata }) => {
    const tloDesignations = ['credit assistant', 'tlo']
    let tloid, mid

    if (uData) {
      tloid = tloDesignations.includes(uData.designation?.toLowerCase())
        ? uData.ur_id
        : tlodata?.ur_id
      mid = tloDesignations.includes(uData.designation?.toLowerCase())
        ? uData.mentor_id
        : tlodata?.mentor_id
    }
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
      return response
    } catch (err) {
      throw err
    }
  }

  const gettloList = async (userDetails, sid) => {
    const bodyParam = {
      body: {},
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }

    try {
      let response = await API.get(
        config.aws_cloud_logic_custom_name,
        `/getTloList?id=${userDetails.uData?.ur_id}&type="${userDetails.uData?.designation}"`,
        bodyParam
      )

      return response
    } catch (err) {
      throw err
    }
  }

  async function fetchTloList() {
    var body = {}
    body.method = 'get'
    const response = await gettloList(userDetails)
    if (!response) {
      throw new Error('Network response was not ok')
    }
    setFilterData(response.body || [])
    setIsLoading(false)
    return response.body || []
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
          ur_id: checkedItems,
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
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

  async function fetchAllTopics() {
    try {
      const requestBody = {
        body: {
          groups: userDetails?.uData?.gid,
          schema: config?.aws_schema,
          ur_id: userDetails?.uData?.ur_id,
          tenant: userDetails?.locale,
          user_lang: '1',
        },
      }
      const jsonString = JSON.stringify(requestBody)
      const base64EncodedString = encode(jsonString)
      const reportInfo = `/getMyTopics?json=${encodeURIComponent(
        base64EncodedString
      )}`
      const response = await API.get(
        config.aws_cloud_logic_custom_name,
        reportInfo,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      console.log(JSON.stringify(response))
      let sdata = { ...userDetails }
      sdata.topics = response
      dispatch(awsSignIn(sdata))
    } catch (error) {
      console.log('getMyCoursesError', error)
    }
  }

  const updateUserSuccess = () => {
    setSelectedRecommendation(null)
    setSelectedReason(null)
    setSelectedRecommendationText('')
    setSelectedReasonText('')
    setRecModalVisible(false)
    setValidationText('')
    fetchTloList()
  }

  const handleRecommendButtonPress = () => {
    if (checkedItems.length > 0) {
      setRecModalVisible(true)
    } else {
      alert('Please select a user.')
    }
  }

  const NavigateNext = (row, response, SingleUser) => {
    const userDesignation = userDetails?.uData?.designation?.toLowerCase()

    if (userDesignation === 'branch manager') {
      navigation.navigate('DropDownBM', {
        row: row,
        response: response,
        SingleUser: SingleUser,
        fetchTloList: fetchTloList,
      })
    } else {
      navigation.navigate('DropDown', {
        row: row,
        response: response,
        SingleUser: SingleUser,
      })
    }
  }

  const SingleUser = async (row, id) => {
    console.log(JSON.stringify(row))
    const bodyParam = {
      body: {},
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }

    try {
      let response = await API.get(
        config.aws_cloud_logic_custom_name,
        `/getTloDetails?tlo_id=${row.ur_id}&mid="${row.mentor_id}"`,
        bodyParam
      )
      console.log(JSON.stringify(response))
      if (id === 1) {
        NavigateNext(row, response, SingleUser)
      }
    } catch (err) {
      throw err
    }
  }

  const toggleCheckbox = (row) => {
    const updatedCheckedItems = checkedItems.includes(row.ur_id)
      ? checkedItems.filter((id) => id !== row.ur_id)
      : [...checkedItems, row.ur_id]
    setCheckedItems(updatedCheckedItems)
    setIsUserSelected(updatedCheckedItems.length > 0)
  }

  return (
    <View style={styles.container}>
      {!isLoading ? (
        <View style={{ flex: 1 }}>
          <View style={styles.searchContainer}>
            <Image source={SearchIcon} style={styles.icon} />
            <TextInput
              placeholder="Search name"
              style={styles.input}
              placeholderTextColor={'black'}
              value={searchInput}
              onChangeText={(text) => setSearchInput(text)}
            />
          </View>
          <TouchableHighlight
            underlayColor="#DDDDDD"
            style={{
              backgroundColor: Constants.app_button_color,
              borderRadius: 4,
              padding: 10,
              marginTop: 5,
              alignSelf: 'center',
            }}
            onPress={() => handleRecommendButtonPress()}
          >
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
              }}
            >
              Recommend
            </Text>
          </TouchableHighlight>

          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>TLO Name</Text>
            <Text style={styles.headerText}>Designation</Text>
            <Text style={styles.headerText}>Recommendation</Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollview}
          >
            {filterData
              .filter((row) =>
                row.name.toLowerCase().includes(searchInput.toLowerCase())
              )
              .map((row) => (
                <View style={styles.contentContainer}>
                  <View style={{ alignItems: 'flex-start' }}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      {row.recommend === null ? (
                        <TouchableOpacity
                          onPress={() => toggleCheckbox(row)}
                          style={styles.checkbox}
                        >
                          <>
                            {checkedItems.includes(row.ur_id) && (
                              <Image
                                source={require('../Assets/Images/correct.png')}
                                style={styles.checkboxIcon}
                              />
                            )}
                          </>
                        </TouchableOpacity>
                      ) : (
                        <Image
                          source={require('../Assets/Images/CheckBox.png')}
                          style={styles.checkboxIcon}
                        />
                      )}
                      <Text style={styles.rowText3}>{row.uid}</Text>
                      <Text style={styles.rowText3}>{row.designation}</Text>

                      <View>
                        <Text
                          style={[
                            styles.recommendText,
                            {
                              color: row.recommend === 1 ? 'green' : '#FFB000',
                              borderWidth: 1,
                              borderColor:
                                row.recommend === 1 ? 'green' : '#FFB000',
                              borderRadius: 3,
                              padding: 5,
                            },
                          ]}
                        >
                          {row.recommend === 1
                            ? 'Recommended'
                            : 'Not Recommended'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.rowDetailsContainer}>
                      <Text
                        onPress={() => SingleUser(row, 1)}
                        style={styles.rowText}
                      >
                        {row.name}
                      </Text>
                    </View>
                    <Text style={styles.rowText2}>
                      Branch Name : {row.branch_name}
                    </Text>
                  </View>
                </View>
              ))}
          </ScrollView>

          <Modal transparent visible={rccModalVisible}>
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
          </Modal>
        </View>
      ) : (
        <SkeletonLoader loader="notification" />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 35,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
    height: 20,
    width: 20,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  separator: {
    height: '60%',
    width: 1,
    backgroundColor: 'black',
    marginHorizontal: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    marginRight: 5,
    color: 'black',
  },
  headerContainer: {
    flexDirection: 'row',
    backgroundColor: '#414141',
    alignItems: 'center',
    width: dw / 1.04,
    padding: 7,
    marginTop: 10,
    alignSelf: 'center',
    justifyContent: 'space-around',
    borderRadius: 5,
  },
  headerText: {
    color: 'white',
    fontSize: dh / 65,
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
  },
  contentContainer: {
    alignSelf: 'center',
    borderRadius: 10,
    borderWidth: 0.7,
    marginTop: 10,
    backgroundColor: '#fff',
    width: dw / 1.04,
    padding: 10,
    marginBottom: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  rowText: {
    color: 'black',
    fontSize: dh / 70,
    fontWeight: '600',
    paddingHorizontal: 20,
    flex: 1,
    marginBottom: '1%',
  },
  rowText2: {
    color: '#808080',
    fontSize: dh / 70,
    fontWeight: '500',
    paddingHorizontal: 20,
    flex: 1,
    marginTop: '1%',
  },
  rowText3: {
    color: '#808080',
    fontSize: dh / 75,
    fontWeight: '500',
    paddingHorizontal: 20,
    flex: 1,
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
  screenstyle: {
    width: '100%',
    height: '100%',
  },
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight,
      },
    }),
  },
  checkbox: {
    width: dw / 40,
    height: dh / 75,
    borderWidth: 0.5,
    borderColor: 'black',
  },

  checkboxIcon: {
    width: dw / 40,
    height: dh / 75,
  },
  rowDetailsContainer: {
    marginTop: 5,
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: 'black',
  },

  recommendText: {
    fontSize: 10,
    fontWeight: '500',
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

export default OJTLOBM
