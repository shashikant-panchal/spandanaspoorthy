import { Platform, Dimensions } from 'react-native';
import config from '../aws-exports';

const { width, height } = Dimensions.get('window');

const getHeight = () => {
  if (height >= 812) {
    return 75;
  }
  return 60;
};

const getPosition = () => {
  if (height >= 812) {
    return 40;
  }
  return 25;
};

// eslint-disable-next-line no-undef
export default Constants = {
  app_border_color: '#f4f4f4',
  background_app_light_color: '#E4F9FA',
  background_app_dark_color: '#46A76E',
  app_background_color: '#ffffff',
  app_background_light_color: '#FFFFFF',
  app_background_dark_color: '#FFFFFF',
  app_backgroung_dark_col: '#D4EAE0',
  app_dark_color: '#f5a138',
  app_light_color: '#fecf94',
  app_blue_color: '#392D7D',
  app_color: '#ffffff',
  app_button_color: '#F48221',
  app_navyblue_color: '#217BB5',
  app_shade_color: '#EDE4EC',
  app_toolbar_color: '#FFFFFF',
  app_progress_bar_color: '#01458E',
  app_button_text_color: '#ffffff',
  app_text_color: '#333333',
  app_placeholder_color: '#777777',
  app_button_text_size: 15,
  app_nav_title_color: '#000000',
  app_statusbar_color: '#FFFFFF',
  app_statusbar_color_MyTopics: '#ffbe6d',
  app_searchbar_background_color: '#5A5A5A',
  app_searchbar_placeholder: '#00000',
  app_searchbar_text: '#000000',
  app_searchbar_tintcolor: '#FFFFFF',
  app_font_family_regular: Platform.OS === 'ios' ? 'Nunito Sans' : 'NunitoSans-Regular',
  app_font_family_bold: Platform.OS === 'ios' ? 'Nunito Sans' : 'NunitoSans-Bold',
  not_seen_color: '#cccccc',
  not_seen_object_color: '#373737',
  app_grey_color: '#c7c7c7',
  app_toolbar_height: getHeight(),
  app_toolbar_position: getPosition(),
  app_width: width,
  app_height: height,
  app_device_token: '',
  AWS_ORG_API_PATH: config.aws_cloud_logic_custom_endpoint_E,

  // AWS_IMAGES_URL: 'https://dx2dzwo91of53.cloudfront.net/',
  // AWS_CLOUDFRONT_URL: 'https://dx2dzwo91of53.cloudfront.net/',
  // COOKIE_URL: 'https://dx2dzwo91of53.cloudfront.net/',
  // DOMAIN: "dx2dzwo91of53.cloudfront.net",
  // AWS_IMAGE : 'https://dx2dzwo91of53.d77oddmpya30t.net/',

  AWS_IMAGES_URL: 'https://www.ssfl.enabled.live/',
  AWS_CLOUDFRONT_URL: 'https://www.ssfl.enabled.live/',
  COOKIE_URL: 'https://www.ssfl.enabled.live/',
  // COOKIE_URL: 'https://d2wvz55zivlhjq.cloudfront.net/',
  DOMAIN: "www.ssfl.enabled.live",
  AWS_IMAGE : 'https://www.ssfl.enabled.live/',
  VIMEO_URL: "https://player.vimeo.com/video/",
  YOUTUBE_URL: "https://www.youtube.com/",
  SHARE_URL: "https://www.learn.enhanzed.com/#/sharingobject?",

  USERS: "/users",
  GET_USER_DETAILS: "/getUserDetails",
  GET_MY_TOPICS: "/getMyTopics",
  GET_CATEGORIES: "/getCategories",
  GET_FINAL_FEEDBACK: "/getFinalFeedback",
  UPDATE_HONORARIUM: "/updateHonorarium",
  UPDATE_PRACTICAL_SCORES: "/add-updated-training-exam-scores",
  GET_PROGRAMS: "/getPrograms",
  GET_LOCATION: "/getLocation",
  GET_BATCH_PROGRAM: "/getBatchProgram",
  GET_COURSE_VIEW : "/getCourseView",
  GET_QUIZ: "/getquiz",
  GET_RAZORPAY_ORDERID: "/getRazorPayOrderID",
  UPDATE_FEEDBACK_OTHERS: "/updateFeedbackOthers",
  UPDATE_TOPIC_REPORT: "/updateTopicReport",
  SYNC_USER_DATA: "/syncUserDataWeb",
  UPDATE_PROGRAM_REPORT: "/update-program-report",
  UPDATE_ANALYTICS: "/analyticsWebApp",
  LIST_PROGRAMS: "/listPrograms",
  GET_COURSE_LIST: "/getCourseList",
  GET_TOPIC_DETAILS: "/getTopicDetails",
  GET_PROGRAMS: "/getPrograms",
  GET_LOCATION: "/getLocation",
  ADD_UPDATE_REGISTRATION: "/addUpdateRegistration",
  GET_PRESIGNED_URL: "/getPreSignedURL",
  LIST_SUBSCRIBED_USERS: "/list-subscribed-users",
  GET_FEEDBACK_QUESTIONS: "/getFeedbackQuestions",
  GET_CERTIFICATES: "/getcertificates",
};