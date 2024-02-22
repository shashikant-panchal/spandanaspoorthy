import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Image,
  ImageBackground,
  Text,
  View,
  TouchableHighlight,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  FlatList,
  StatusBar,
  Alert,
  BackHandler,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TextInput,
  SectionList,
  Pressable,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Amplify, {Cache, API, Auth} from 'aws-amplify';
import 'react-native-gesture-handler';
import {CommonActions} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Toolbar from '../Profile/Toolbar';
import {isThisIPhoneX} from '../Home/isIphoneX';
import config from '../../aws-exports';
import {awsSignIn, authData} from '../redux/auth/authSlice';
import {useSelector, useDispatch} from 'react-redux';
import SkeletonLoader from '../common/appSkeletonLoader';
import RadioButton from 'radio-buttons-react-native';

const backIcon = require('../Assets/Images/back.png');
const requiredIcon = require('../Assets/Images/required.png');

export default function ApplyApplicationScreen(props) {
  let userDetails = useSelector(authData);
  const dispatch = useDispatch();

  const {navigation, onDismissLoadingCallback, route} = props;
  const {courseId, programId, getBatchDetails} = route.params;
  const networkStatusRef = useRef(true);
  const [spinner, setSpinner] = useState(true);
  const [modalSpinner, setModalSpinner] = useState(false);
  const [spin, setSpin] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [education, setEducation] = useState('');
  const [year, setYear] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [uniName, setUniName] = useState('');
  const [uniId, setUniId] = useState('');
  const [docId, setDocId] = useState('');
  const [sameAddr, setSameAddr] = useState();
  const [perAddr, setPerAddr] = useState({
    addr1: '',
    addr2: '',
    addr3: '',
    state: '',
    city: '',
    pin: '',
  });
  const [presAddr, setPresAddr] = useState({
    addr1: '',
    addr2: '',
    addr3: '',
    state: '',
    city: '',
    pin: '',
  });
  const [issueText, setIssueText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  let infoObj = {};

  useEffect(() => {
    // alert("userDetailsCourseAssessment " + JSON.stringify(userDetails));
    const unsubscribe = NetInfo.addEventListener(state => {
      handleConnectivityChange(state.isInternetReachable);
    });
    const listners = [navigation.addListener('willFocus', () => checkFocus())];
    StatusBar.setHidden(false);

    ApplyApplicationScreen.navListener = navigation.addListener(
      'didFocus',
      () => {
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor(Constants.app_statusbar_color);
          StatusBar.setTranslucent(true);
        }
      },
    );
    return () => {
      unsubscribe();
      listners.forEach(listner => {
        unsubscribe();
      });
    };
  }, []);

  function handleConnectivityChange(isConnected) {
    if (isConnected === false) {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      });
      networkStatusRef.current = false;
      setSpinner(false);
    } else {
      Amplify.configure({
        Analytics: {
          disabled: true,
        },
      });
      networkStatusRef.current = true;
    }
  }

  function onBackPressed() {
    getBatchDetails();
    // navigation.navigate('CourseView');
    navigation.dispatch(CommonActions.goBack());
  }

  async function updateUserApplication(obj) {
    setSpin(true);
    setIsLoading(true);
    const bodyParam = {
      body: {
        atype: 0,
        ur_id: userDetails.res[0].ur_id,
        payment: null,
        pid: programId,
        bid: courseId,
        regi_dtls: obj,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    // console.log("bhumikareddyyyyy "+JSON.stringify(bodyParam.body))
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        Constants.ADD_UPDATE_REGISTRATION,
        bodyParam,
      );
      // console.log("response " + JSON.stringify(response));
      setIsLoading(false);
      onBackPressed();
      setSpin(false);
    } catch (error) {
      // console.log("getCategoryError", error);
    }
  }

  function generalInfoValidation() {
    console.log(sameAddr)
    if (firstName.trim().length === 0 || lastName.trim().length === 0) {
      setIssueText('Name cannot be empty');
    } else if (email.trim().length === 0) {
      setIssueText('Email cannot be empty');
    } else if (phoneNo.trim().length === 0) {
      setIssueText('Phone number cannot be empty');
    } else if (education.trim().length === 0) {
      setIssueText('Education cannot be empty');
    } else if (year.trim().length === 0) {
      setIssueText('Year cannot be empty');
    } else if (bloodGroup.trim().length === 0) {
      setIssueText('Blood Group cannot be empty');
    } else if (uniName.trim().length === 0) {
      setIssueText('University Name cannot be empty');
    } else if (uniId.trim().length === 0) {
      setIssueText('University Id cannot be empty');
    } else if (docId.trim().length === 0) {
      setIssueText('Document cannot be empty');
    } else if (
      perAddr.addr1.trim().length === 0 ||
      perAddr.state.trim().length === 0 ||
      perAddr.city.trim().length === 0 ||
      perAddr.pin.trim().length === 0
    ) {
      setIssueText('Please fill address according to the requirement');
    } else if ((sameAddr === undefined || sameAddr === false) && (
      presAddr.addr1.trim().length === 0 ||
      presAddr.state.trim().length === 0 ||
      presAddr.city.trim().length === 0 ||
      presAddr.pin.trim().length === 0
    )) {
      setIssueText('Please fill your present address');
    } else {
      setIssueText('');
      infoObj.name = firstName;
      infoObj.lname = lastName;
      infoObj.email = email;
      infoObj.phoneNo = phoneNo;
      infoObj.education = education;
      infoObj.year = year;
      infoObj.bloodGroup = bloodGroup;
      infoObj.uniName = uniName;
      infoObj.uniId = uniId;
      infoObj.docId = docId;
      infoObj.permanentAddr1 = perAddr.addr1;
      infoObj.permanentAddr2 = perAddr.addr2;
      infoObj.permanentAddr3 = perAddr.addr3;
      infoObj.permanentCity = perAddr.city;
      infoObj.permanentState = perAddr.state;
      infoObj.permanentPin = perAddr.pin;

      saveGeneralInfo();
    }
  }

  function saveGeneralInfo() {
    let array = [];
    let obj = {
      Batch_id: courseId,
      'First Name': firstName,
      'Last Name': lastName,
      Email: email,
      Contact: phoneNo,
      Education: education,
      Year: year,
      'Blood Group': bloodGroup,
      'University Name': uniName,
      'University Id': uniId,
      'Dococument Id': docId,
      'Permanent Address 1': perAddr.addr1,
      'Permanent Address 2': perAddr.addr2,
      'Permanent Address 3': perAddr.addr3,
      'Permanent State': perAddr.state,
      'Permanent City': perAddr.city,
      'Permanent Pin': perAddr.pin,
      'Permanent Same Address': sameAddr,
      'Present Address 1': presAddr.addr1,
      'Present Address 2': presAddr.addr2,
      'Present Address 3': presAddr.addr3,
      'Present State': presAddr.state,
      'Present City': presAddr.city,
      'Present Pin': presAddr.pin,
    };
    array.push(obj);
    updateUserApplication(array);
  }

  function generalInfo() {
    const addressData = [
      {
        label: 'Yes',
        value: true,
      },
      {
        label: 'No',
        value: false,
      },
    ];

    return (
      <ScrollView style={{marginBottom: 250, marginTop: 20, marginHorizontal: 20,}}>
        <Text
          style={{
            color: Constants.app_orange_color,
            fontSize: 16,
            fontWeight: '700',
          }}>
          General Info
        </Text>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>First Name (As per records):</Text>
          </View>
          <TextInput
            style={styles.input}
            defaultValue={userDetails.res[0].first_name}
            value={firstName}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setFirstName(value);
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>Second Name (As per records):</Text>
          </View>
          <TextInput
            style={styles.input}
            defaultValue={userDetails.res[0].last_name}
            value={lastName}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setLastName(value);
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>Email:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={email}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setEmail(value);
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>Mobile Number:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={phoneNo}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setPhoneNo(value);
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>Education:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={education}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setEducation(value);
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>Year:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={year}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setYear(value);
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>Blood Group:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={bloodGroup}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setBloodGroup(value);
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>Name of University/Medical Council - state/country:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={uniName}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setUniName(value);
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>
              University ID/Medical License
              Number/Med/Dental/Nursing/Pharmacy/Ayush council etc:
            </Text>
          </View>
          <TextInput
            style={styles.input}
            value={uniId}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setUniId(value);
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>KMC no or RGUHS student No./Aadhar/PAN/Voter id:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={docId}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setDocId(value);
            }}
            required
          />
        </View>
        <View>
          <Text
            style={{
              color: Constants.app_button_color,
              fontSize: 16,
              fontWeight: '700',
            }}>
            Permanent Address
          </Text>
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>Address Line 1:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={perAddr.addr1}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setPerAddr({...perAddr, addr1: value});
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Text>Address Line 2:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={perAddr.addr2}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setPerAddr({...perAddr, addr2: value});
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Text>Address Line 3:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={perAddr.addr3}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setPerAddr({...perAddr, addr3: value});
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>State:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={perAddr.state}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setPerAddr({...perAddr, state: value});
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>City:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={perAddr.city}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setPerAddr({...perAddr, city: value});
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>PIN:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={perAddr.pin}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setPerAddr({...perAddr, pin: value});
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginLeft: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>Is the Present Address same as Permanent Address? :</Text>
          </View>
          {/* <Picker
                        style={{ fontFamily: Constants.app_font_family_regular, fontSize: 20, marginLeft: 5, borderWidth: 1 }}
                        selectedValue={sameAddr}
                        pickerStyleType
                        dropdownIconColor={"#000000"}
                        onValueChange={(itemValue, itemIndex) =>
                            setSameAddr(itemValue)
                        }>
                        <Picker.Item label="Yes" value={true} />
                        <Picker.Item label="No" value={false} />
                    </Picker> */}
          <RadioButton
            activeColor="#702D6A"
            data={addressData}
            selectedBtn={e => setSameAddr(e.value)}
          />
        </View>
        <View>
          <Text
            style={{
              color: Constants.app_button_color,
              fontSize: 16,
              fontWeight: '700',
              marginTop: 10,
            }}>
            Present Address
          </Text>
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>Address Line 1:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={sameAddr ? perAddr.addr1 : presAddr.addr1}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setPresAddr({...presAddr, addr1: value});
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            {/* <Image source={requiredIcon} style={styles.requiredIcon} /> */}
            <Text>Address Line 2:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={sameAddr ? perAddr.addr2 : presAddr.addr2}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setPresAddr({...presAddr, addr2: value});
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            {/* <Image source={requiredIcon} style={styles.requiredIcon} /> */}
            <Text>Address Line 3:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={sameAddr ? perAddr.addr3 : presAddr.addr3}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setPresAddr({...presAddr, addr3: value});
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>State:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={sameAddr ? perAddr.state : presAddr.state}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setPresAddr({...presAddr, state: value});
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>City:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={sameAddr ? perAddr.city : presAddr.city}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setPresAddr({...presAddr, city: value});
            }}
            required
          />
        </View>
        <View style={{marginTop: 10, marginHorizontal: 10}}>
          <View style={{flexDirection: 'row'}}>
            <Image source={requiredIcon} style={styles.requiredIcon} />
            <Text>PIN:</Text>
          </View>
          <TextInput
            style={styles.input}
            value={sameAddr ? perAddr.pin : presAddr.pin}
            placeholderTextColor={Constants.app_searchbar_placeholder}
            onChangeText={value => {
              setPresAddr({...presAddr, pin: value});
            }}
            required
          />
        </View>
        <Text style={{color: 'red', marginBottom: 10, textAlign: 'center'}}>
          {issueText}
        </Text>
        <TouchableHighlight
          onPress={() => generalInfoValidation()}
          style={{
            backgroundColor: Constants.app_button_color,
            justifyContent: 'center',
            alignSelf: 'center',
            alignContent: 'center',
            width: 100,
            height: 40,
          }}
          underlayColor="transparent">
          <Text
            style={{
              color: 'white',
              fontSize: 18,
              fontWeight: '700',
              textAlign: 'center',
            }}>
            Save
          </Text>
        </TouchableHighlight>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        start={{x: 0.0, y: 0.0}}
        end={{x: 0.0, y: 1.0}}
        colors={['#FFFFFF', '#FFFFFF']}
        style={styles.screenstyle}>
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
            onRequestClose={onDismissLoadingCallback}>
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
          left={
            <View style={styles.toolBarHolder}>
              <View>
                <TouchableHighlight
                  underlayColor="transparent"
                  onPress={() => onBackPressed()}>
                  <Image source={backIcon} style={styles.backButton} />
                </TouchableHighlight>
              </View>
              <View>
                <Text numberOfLines={1} style={styles.headerStyle}>
                  Application
                </Text>
              </View>
            </View>
          }
        />
        <View style={styles.spinnerView}>
          {!networkStatusRef.current && (
            <Text style={[styles.noNetwork, styles.appFontFamily]}>
              No internet connectivity
            </Text>
          )}
        </View>
        <ScrollView
          style={styles.scrollview}
          showsVerticalScrollIndicator={false}>
          {!isLoading ? (
            generalInfo()
          ) : (
            <SkeletonLoader loader="notification" />
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
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
  // headerStyle: {
  //     marginLeft: 12,
  //     width: Constants.app_width - 60,
  //     //textDecorationLine: 'underline',
  //     textDecorationStyle: 'solid',
  //     fontWeight: '700',
  //     color: Constants.app_text_color,
  //     fontSize: 16,
  //     ...Platform.select({
  //         ios: {
  //             marginTop: -20
  //         },
  //         android: {
  //             marginTop: 12
  //         }
  //     }),
  // },
  questionHolder: {
    //flex: 1,
    marginRight: 15,
    marginLeft: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#EDEDED',
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    // padding: 5,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Constants.app_button_color,
  },
  scrollview: {
    marginBottom: 50,
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
  xcloseicon: {
    justifyContent: 'flex-end',
    // backgroundColor: 'red',
    alignItems: 'flex-end',
    // backgroundColor: 'green'
  },
  input: {
    borderWidth: 0.5,
    borderColor: 'black',
    borderRadius: 5,
    height: 35,
    marginVertical: 10,
    width: '100%',
  },
});
