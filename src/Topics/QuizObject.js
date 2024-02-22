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
  AppState,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Amplify, {Cache, API, Auth} from 'aws-amplify';
import 'react-native-gesture-handler';
import {CommonActions, useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import config from '../../aws-exports';
import {awsSignIn, authData} from '../redux/auth/authSlice';
import {useSelector, useDispatch} from 'react-redux';
import SkeletonLoader from '../common/appSkeletonLoader';
import HTML from 'react-native-render-html';
import produce from '../../node_modules/immer';
import RadioButtonRN from 'radio-buttons-react-native';
import Toolbar from '../Profile/Toolbar';
import {Rating} from 'react-native-ratings';
import {element} from 'prop-types';

const correctIcon = require('../Assets/Images/correct.png');
const wrongIcon = require('../Assets/Images/wrong.png');
const audioImage = require('../Assets/Images/audioimage.png');
const backIcon = require('../Assets/Images/back.png');

export default function QuizObjectScreen(props) {
  const {route, onDismissLoadingCallback} = props;
  const navigation = useNavigation();
  const {
    qObject,
    nuggetId,
    setCourseDetails,
    courseDetails,
    OIndex,
    courseId,
    quizAttempt,
  } = route.params;
  const networkStatusRef = useRef(true);
  const [spinner, setSpinner] = useState(true);
  const [loaded, setLoaded] = useState(true);
  const [modalSpinner, setModalSpinner] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState([]);
  const [btnClick, setBtnClick] = useState(false);
  const [qtype, setQtype] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const currentQuestionRef = useRef(0);
  const [qisLoading, setQIsLoading] = useState(false);
  const [activeView, setActiveView] = useState(-1);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const activeViewArray = useRef([]);
  const [surveyAns, setSurveyAns] = useState(0);

  let userDetails = useSelector(authData);
  const dispatch = useDispatch();

  const imgUrl = `${
    Constants.AWS_IMAGE
  }${config.aws_org_id.toLowerCase()}-resources/images/quiz-images/${nuggetId}/`;

  useEffect(() => {
    // alert(JSON.stringify(userDetails.objDetails[OIndex].attempt))
    // alert(OIndex);
    const unsubscribe = NetInfo.addEventListener(state => {
      handleConnectivityChange(state.isInternetReachable);
    });
    const listners = [navigation.addListener('willFocus', () => checkFocus())];
    getQuiz(qObject);
    let sdata = {...userDetails};
    dispatch(awsSignIn(sdata));
    StatusBar.setHidden(false);

    QuizObjectScreen.navListener = navigation.addListener('didFocus', () => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(Constants.app_statusbar_color);
        StatusBar.setTranslucent(true);
      }
    });
    return () => {
      unsubscribe();
      listners.forEach(listner => {
        unsubscribe();
      });
    };
  }, []);

  async function checkFocus() {
    BackHandler.removeEventListener('hardwareBackPress', true);
    await SInfo.setItem('isnotClickable', JSON.stringify(false), {});
    window.isnotClickable = 'false';
    if (networkStatusRef.current) {
      // fetchRecentViews();
      // fetchLocalTopicProgressDetails();
      // fetchLocalCertDetails();
    } else {
      handleNetworkConnection();
    }
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(Constants.app_statusbar_color);
      StatusBar.setTranslucent(true);
    }
  }

  function handleNetworkConnection() {
    setLoaded(true);
    setSpinner(false);
  }

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
      // getQuiz();
      // fetchMytopicsDataset();
    }
  }

  function onBackPressed() {
    navigation.dispatch(CommonActions.goBack());
  }

  async function getQuiz(obj) {
    setQIsLoading(true);
    const bodyParam = {
      body: {
        quizid: obj.objid,
        oid: config.aws_org_id,
        schema: config.aws_schema,
        action: "get",
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };
    // alert('bodyyyyy ' + JSON.stringify(bodyParam.body));
    try {
      const response = await API.post(
        config.aws_cloud_logic_custom_name,
        '/getQuiz',
        bodyParam,
      );
      // alert('bhumiiiiiii ' + JSON.stringify(response));
      // setCutOff(response.cutoff);
      setQtype(response.qtype);
      setQuizQuestion(response.qitems);
      setBtnClick(true);
      setQIsLoading(false);
      setSpinner(false);
    } catch (error) {
      console.error(error);
    }
  }

  const handleAnswerOptionClick = (ansOpts, idx) => {
    // setInputText('answer');
    if (ansOpts.correct === 'true' || ansOpts.correct === true) {
      const ques = [...quizQuestion];
      ques[currentQuestion].res = 1;
      setQuizQuestion(ques);
    } else {
      const ques = [...quizQuestion];
      ques[currentQuestion].res = 0;
      setQuizQuestion(ques);
    }
    if (activeView != idx) {
      setActiveView(idx);
      let arr = activeViewArray.current.slice();
      arr[currentQuestion] = idx;
      activeViewArray.current = [...arr];
    }
  };

  function answerQuizPrev() {
    // console.log("curr", currentQuestion);
    const prevQuestion = currentQuestion - 1;

    setCurrentQuestion(prevQuestion);
    currentQuestionRef.current = prevQuestion;
    setActiveView(activeViewArray.current[currentQuestion - 1]);
  }
  
  function answerQuizNext() {
    // alert(JSON.stringify(qObject))
    let count = 0;
    const nextQuestion = currentQuestion + 1;
    for (i = 0; i < quizQuestion.length; i++) {
      if (
        activeViewArray.current[i] != null ||
        activeViewArray.current[i] != undefined
      ) {
        count = count + 1;
      }
    }
    if (nextQuestion < quizQuestion.length) {
      setCurrentQuestion(nextQuestion);
      currentQuestionRef.current = nextQuestion;
      setActiveView(activeViewArray.current[currentQuestion + 1]);
    } else {
      if (count === quizQuestion.length) {
        Alert.alert('', 'Would you like to end the quiz?', [
          {
            text: 'Yes!',
            onPress: () => {onBackPressed()},
          },
          {text: 'No!', onPress: () => console.log('No Pressed')},
        ]);
      } else {
        Alert.alert('Answer all the questions');
      }
    }
  }

  function renderQuizQuestions() {
      return (
        <View>
          <View
            style={{
              marginLeft: 12,
              ...Platform.select({
                ios: {
                  marginTop: 60,
                },
                android: {
                  marginTop: 30,
                },
              }),
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginRight: 40,
              }}>
              <Text style={{fontSize: 16}}>
                Question {currentQuestion + 1} / {quizQuestion.length}
              </Text>
            </View>
            <View style={{marginTop: 20, marginRight: 15}}>
              {/* <Text>{qtype}</Text> */}
              <HTML source={{html: `${quizQuestion[currentQuestion].istem}`}} />
            </View>
            {quizQuestion[currentQuestion].imageurl ? (
              <FastImage
                key={currentQuestion}
                resizeMode={FastImage.resizeMode.contain}
                style={styles.quizImg}
                source={{
                  uri: `${imgUrl}${quizQuestion[currentQuestion].imageurl}`,
                }}
              />
            ) : null}
          </View>
          <View>
            {quizQuestion[currentQuestion].iopts.map((answerOption, idx) => {
              const containerStyle = [
                styles.questionHolder,
                {borderColor: Constants.app_button_color},
              ];
              if (idx === activeView) {
                containerStyle.push({
                  borderWidth: 3,
                  borderColor: Constants.app_button_color,
                });
              }
              return (
                <View>
                  <TouchableHighlight
                    underlayColor="transparent"
                    onPress={() => handleAnswerOptionClick(answerOption, idx)}
                    style={containerStyle}>
                    <View>
                      <Text style={{margin: 10, fontSize: 16}}>
                        {' '}
                        {answerOption.content}{' '}
                      </Text>
                    </View>
                  </TouchableHighlight>
                </View>
              );
            })}
            <View
              style={{
                flexDirection: 'row',
                width: '70%',
                justifyContent: 'space-between',
                marginHorizontal: '10%',
                marginTop: 20,
              }}>
              {currentQuestion > 0 ? (
                <View
                  style={{
                    marginTop: 20,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    backgroundColor: Constants.app_blue_color,
                    width: 70,
                    height: 40,
                    borderRadius: 5,
                  }}>
                  <TouchableHighlight
                    underlayColor="transparent"
                    onPress={() => answerQuizPrev()}>
                    <Text
                      style={{
                        textAlign: 'center',
                        color: 'white',
                        fontWeight: '700',
                      }}>
                      Prev
                    </Text>
                  </TouchableHighlight>
                </View>
              ) : (
                <View></View>
              )}
              {currentQuestion < quizQuestion.length - 1 ? (
                <View
                  style={{
                    marginTop: 20,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    backgroundColor: Constants.app_blue_color,
                    width: 70,
                    height: 40,
                    borderRadius: 5,
                  }}>
                  <TouchableHighlight
                    underlayColor="transparent"
                    onPress={() => answerQuizNext()}>
                    <Text
                      style={{
                        textAlign: 'center',
                        color: 'white',
                        fontWeight: '700',
                      }}>
                      Next
                    </Text>
                  </TouchableHighlight>
                </View>
              ) : (
                <View
                  style={{
                    marginTop: 20,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    backgroundColor: Constants.app_blue_color,
                    width: 70,
                    height: 40,
                    borderRadius: 5,
                  }}>
                  <TouchableHighlight
                    underlayColor="transparent"
                    onPress={() => answerQuizNext()}>
                    <Text
                      style={{
                        textAlign: 'center',
                        color: 'white',
                        fontWeight: '700',
                      }}>
                      Submit
                    </Text>
                  </TouchableHighlight>
                </View>
              )}
            </View>
          </View>
        </View>
      );
  }

  return (
    <View
      style={styles.container}
      pointerEvents={!networkStatusRef.current ? 'none' : 'auto'}>
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
                  {qObject.otitle}
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
          <View style={styles.spinnerView}>
            {!networkStatusRef.current && (
              <Text style={[styles.noNetwork, styles.appFontFamily]}>
                No internet connectivity
              </Text>
            )}
          </View>
          {!spinner ? renderQuizQuestions() : <SkeletonLoader loader="home1" />}
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
  statusBar: {
    ...Platform.select({
      android: {
        height: StatusBar.currentHeight,
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
  quizImg: {
    width: '90%',
    height: 330,
    // top: 0,
    // left: 0,
    margin: 5,
    justifyContent: 'center',
    //alignItems: 'center',
    //alignContent: 'center',
    alignSelf: 'center',
  },
  cwstyle: {
    height: 20,
    width: 20,
  },
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
  feedbackHolder: {
    //flex: 1,
    marginRight: 15,
    marginLeft: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // backgroundColor: '#EDEDED',
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    // padding: 5,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: Constants.app_button_color,
  },
  scrollview: {
    marginBottom: 150,
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
    height: 40,
    marginHorizontal: 10,
    // width: '90%'
  },
  validationText: {
    marginTop: 5,
    marginLeft: 12,
    position: 'absolute',
    color: 'red',
    fontSize: 11,
    fontFamily: Constants.app_font_family_regular,
  },
  centeredView: {
    height: '100%',
    backgroundColor: '#FAF9F6',
    ...Platform.select({
      ios: {
        // marginTop: Constants.app_width / 2,
      },
      android: {
        marginTop: 110,
      },
    }),
  },
  modalView: {
    marginTop: Constants.app_width / 2,
    height: '25%',
    width: '80%',
    marginLeft: '10%',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    marginTop: 20,
    borderRadius: 5,
    padding: 5,
    elevation: 2,
    width: 80,
  },
  buttonOpen: {
    marginTop: -200,
    backgroundColor: '#F194FF',
  },
  buttonApply: {
    backgroundColor: Constants.app_button_color,
  },
  buttonClose: {
    borderColor: Constants.app_button_color,
    borderWidth: 2,
    backgroundColor: '#ffffff',
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
});
