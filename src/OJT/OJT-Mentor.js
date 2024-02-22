import React, { useEffect, useState } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  FlatList,
} from 'react-native'
import { useSelector } from 'react-redux'
import { authData } from '../redux/auth/authSlice'
import config from '../../aws-exports'
import { API } from 'aws-amplify'
import { useNavigation } from '@react-navigation/core'
import SkeletonLoader from '../common/appSkeletonLoader'
import { dh, dw } from '../constants/Dimensions'

const OJTMentor = () => {
  const [filterData, setFilterData] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const tloDesignations = ['credit assistant', 'tlo']

  useEffect(() => {
    fetchTloList()
    fetchMentorList()
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
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>TLO Name</Text>
            <Text style={styles.headerText}>Branch Name</Text>
            <Text style={styles.headerText}>Designation</Text>
          </View>

          <FlatList
            showsVerticalScrollIndicator={false}
            data={filterData.filter((row) =>
              row.name.toLowerCase().includes(searchInput.toLowerCase())
            )}
            keyExtractor={(item) => item.uid.toString()}
            renderItem={({ item: row }) => (
              <View style={styles.contentContainer}>
                <View style={styles.rowDetailsContainer}>
                  <Text style={styles.rowText1}>{row.uid}</Text>
                  <Text style={styles.rowText}>{row.branch_name}</Text>
                  <Text style={styles.rowText}>{row.designation}</Text>
                </View>
                <View>
                  <Text
                    onPress={() => SingleUser(row, 1)}
                    style={styles.rowText2}
                  >
                    {row.name}
                  </Text>
                </View>
              </View>
            )}
          />
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
    backgroundColor: '#F5F7F8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
    height: 24,
    width: 24,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'white',
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
    flex: 1,
  },

  contentContainer: {
    alignSelf: 'center',
    borderRadius: 10,
    borderWidth: 0.7,
    marginTop: 10,
    backgroundColor: '#ECF0F1',
    width: dw / 1.04,
    padding: 15,
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

  rowText1: {
    color: 'black',
    fontSize: dh / 70,
    fontWeight: 'bold',
    flex: 1,
    paddingLeft: 20,
    textAlign: 'left',
    marginBottom: '1%',
  },

  rowText: {
    color: 'black',
    fontSize: dh / 70,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginBottom: '1%',
  },
  rowText2: {
    color: 'black',
    fontSize: dh / 70,
    fontWeight: 'bold',
    paddingLeft: 20,
    flex: 1,
    textAlign: 'left',
    marginTop: '1%',
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
  rowDetailsContainer: {
    flex: 1,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  recommendText: {
    fontSize: 13,
    marginTop: 5,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
})

export default OJTMentor
