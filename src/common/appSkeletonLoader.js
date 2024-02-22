import React from 'react';
import {
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import Shimmer from './Shimmer';
import Constants from '../constants';

const myTopicsWidth = ((Constants.app_width - 10) / 2) - 10;
const myTopicsHeight = myTopicsWidth;
const topicsWidth = ((Constants.app_width - 5) / 3) - 5;
const topicsHeight = (topicsWidth < 120) ? 120 : topicsWidth;
const objectHolderHeight = Platform.OS === 'ios' ? Constants.app_height - 153 : Constants.app_height - 165;
const topicImageHeight = Constants.app_width / 2;

const SkeletonLoader = (props) => {
  const {
    loader,
  } = props;
  const isLoading = true;
  let skeletonScreen = null;

  const explore = (
    <View>
      <View style={[styles.exploreShimmer1, { flexDirection: 'row' }]}>
        <Shimmer autoRun={isLoading} style={styles.exploreSkeletonView} visible={!isLoading}>
          <View style={styles.exploreShimmer1} />
        </Shimmer>
        <Shimmer autoRun={isLoading} style={styles.exploreSkeletonView} visible={!isLoading}>
          <View style={styles.exploreShimmer1} />
        </Shimmer>
      </View>
      <View style={[styles.exploreShimmer2, { flexDirection: 'column' }]}>
        <View style={[styles.exploreShimmer3, { flexDirection: 'row' }]}>
          <Shimmer autoRun={isLoading} style={styles.exploreSkeletonView} visible={!isLoading}>
            <View style={styles.exploreShimmer3} />
          </Shimmer>
          <Shimmer autoRun={isLoading} style={styles.exploreSkeletonView} visible={!isLoading}>
            <View style={styles.exploreShimmer3} />
          </Shimmer>
        </View>
      </View>
      <View style={[styles.exploreShimmer2, { flexDirection: 'column' }]}>
        <View style={[styles.exploreShimmer3, { flexDirection: 'row' }]}>
          <Shimmer autoRun={isLoading} style={styles.exploreSkeletonView} visible={!isLoading}>
            <View style={styles.exploreShimmer3} />
          </Shimmer>
          <Shimmer autoRun={isLoading} style={styles.exploreSkeletonView} visible={!isLoading}>
            <View style={styles.exploreShimmer3} />
          </Shimmer>
        </View>
      </View>
      <View style={[styles.exploreShimmer2, { flexDirection: 'column' }]}>
        <View style={[styles.exploreShimmer3, { flexDirection: 'row' }]}>
          <Shimmer autoRun={isLoading} style={styles.exploreSkeletonView} visible={!isLoading}>
            <View style={styles.exploreShimmer3} />
          </Shimmer>
          <Shimmer autoRun={isLoading} style={styles.exploreSkeletonView} visible={!isLoading}>
            <View style={styles.exploreShimmer3} />
          </Shimmer>
        </View>
      </View>
    </View>
  );

  const myProfile = (
    <View style={{
      width: '80%', height: 60, margin: 10, flexDirection: 'column',
    }}
    >
      <View style={styles.mpCertificateView}>
        <View style={styles.mpSkeletonCertContent}>
          <Shimmer autoRun={isLoading} style={styles.mpSkeletonCertImage} visible={!isLoading}>
            <View style={styles.mpSkeletonCertImage} />
          </Shimmer>
          <View style={styles.mpSkeletonTextContent}>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.mpSkeletonTextContent} />
            </Shimmer>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.mpSkeletonTextContent} />
            </Shimmer>
          </View>
        </View>
        <View style={styles.mpSkeletonCertContent}>
          <Shimmer autoRun={isLoading} style={styles.mpSkeletonCertImage} visible={!isLoading}>
            <View style={styles.mpSkeletonCertImage} />
          </Shimmer>
          <View style={styles.mpSkeletonTextContent}>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.mpSkeletonTextContent} />
            </Shimmer>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.mpSkeletonTextContent} />
            </Shimmer>
          </View>
        </View>
        <View style={styles.mpSkeletonCertContent}>
          <Shimmer autoRun={isLoading} style={styles.mpSkeletonCertImage} visible={!isLoading}>
            <View style={styles.mpSkeletonCertImage} />
          </Shimmer>
          <View style={styles.mpSkeletonTextContent}>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.mpSkeletonTextContent} />
            </Shimmer>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.mpSkeletonTextContent} />
            </Shimmer>
          </View>
        </View>
      </View>
    </View>
  );

  const home1 = (
    <View>
      <View style={styles.homeSkeletonView2}>
        <Shimmer autoRun={isLoading} style={styles.homeSkeletonShimmerView1} visible={!isLoading}>
          <View style={styles.homeSkeletonView2} />
        </Shimmer>
      </View>
      <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonNotificationHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonNotificationHolder} />
          </Shimmer>
        </View>
        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonNotificationHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonNotificationHolder} />
          </Shimmer>
        </View>
        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonNotificationHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonNotificationHolder} />
          </Shimmer>
        </View>
        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonNotificationHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonNotificationHolder} />
          </Shimmer>
        </View>
        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonNotificationHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonNotificationHolder} />
          </Shimmer>
        </View>
        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonNotificationHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonNotificationHolder} />
          </Shimmer>
        </View>
    </View>
  );

  const topicsDashboard = (
    <View>
      <View style={[styles.homeScreenHolder2, { flexDirection: 'row' }]}>
        <Shimmer autoRun={isLoading} style={styles.homeScreenSkeletonView2} visible={!isLoading}>
          <View style={styles.homeScreenHolder2} />
        </Shimmer>
        <Shimmer autoRun={isLoading} style={styles.homeScreenSkeletonView2} visible={!isLoading}>
          <View style={styles.homeScreenHolder2} />
        </Shimmer>
      </View>
      <View style={[styles.homeScreenHolder2, { flexDirection: 'row' }]}>
        <Shimmer autoRun={isLoading} style={styles.homeScreenSkeletonView2} visible={!isLoading}>
          <View style={styles.homeScreenHolder2} />
        </Shimmer>
        <Shimmer autoRun={isLoading} style={styles.homeScreenSkeletonView2} visible={!isLoading}>
          <View style={styles.homeScreenHolder2} />
        </Shimmer>
      </View>
      <View style={[styles.homeScreenHolder2, { flexDirection: 'row' }]}>
        <Shimmer autoRun={isLoading} style={styles.homeScreenSkeletonView2} visible={!isLoading}>
          <View style={styles.homeScreenHolder2} />
        </Shimmer>
        <Shimmer autoRun={isLoading} style={styles.homeScreenSkeletonView2} visible={!isLoading}>
          <View style={styles.homeScreenHolder2} />
        </Shimmer>
      </View>
      <View style={[styles.homeScreenHolder2, { flexDirection: 'row' }]}>
        <Shimmer autoRun={isLoading} style={styles.homeScreenSkeletonView2} visible={!isLoading}>
          <View style={styles.homeScreenHolder2} />
        </Shimmer>
        <Shimmer autoRun={isLoading} style={styles.homeScreenSkeletonView2} visible={!isLoading}>
          <View style={styles.homeScreenHolder2} />
        </Shimmer>
      </View>
      <View style={[styles.homeScreenHolder2, { flexDirection: 'row' }]}>
        <Shimmer autoRun={isLoading} style={styles.homeScreenSkeletonView2} visible={!isLoading}>
          <View style={styles.homeScreenHolder2} />
        </Shimmer>
        <Shimmer autoRun={isLoading} style={styles.homeScreenSkeletonView2} visible={!isLoading}>
          <View style={styles.homeScreenHolder2} />
        </Shimmer>
      </View>
    </View>
  );

  const home3 = (
    <View>
      <View style={styles.homeSkeletonView1}>
        <Shimmer autoRun={isLoading} style={styles.homeSkeletonShimmerView2} visible={!isLoading}>
          <View style={styles.homeSkeletonView1} />
        </Shimmer>
      </View>
    </View>
  );
  const home4 = (
    <View>
      <View style={[styles.homeScreenHolder3, { flexDirection: 'row' }]}>
        <Shimmer autoRun={isLoading} style={styles.homeScreenSkeletonView3} visible={!isLoading}>
          <View style={styles.homeScreenHolder3} />
        </Shimmer>
        <Shimmer autoRun={isLoading} style={styles.homeScreenSkeletonView3} visible={!isLoading}>
          <View style={styles.homeScreenHolder3} />
        </Shimmer>
      </View>
    </View>
  );
  const landingScreen = (
    <View>
      <View style={[styles.landingScreenHolder, { flexDirection: 'row' }]}>
        <Shimmer autoRun={isLoading} style={styles.landingScreenSkeletonView} visible={!isLoading}>
          <View style={styles.landingScreenHolder} />
        </Shimmer>
        <Shimmer autoRun={isLoading} style={styles.landingScreenSkeletonView} visible={!isLoading}>
          <View style={styles.landingScreenHolder} />
        </Shimmer>
      </View>
    </View>
  );

  const landingScreen1 = (
    <View>
      <View style={[styles.landingScreenHolder1, { flexDirection: 'row' }]}>
        <Shimmer autoRun={isLoading} style={styles.landingScreenSkeletonView1} visible={!isLoading}>
          <View style={styles.landingScreenHolder1} />
        </Shimmer>
        <Shimmer autoRun={isLoading} style={styles.landingScreenSkeletonView1} visible={!isLoading}>
          <View style={styles.landingScreenHolder1} />
        </Shimmer>
      </View>
    </View>
  );

  const notification = (
    <View style={styles.skeletonNParentHolder}>
      <View style={styles.notificationContentView}>
        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonNotificationHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonNotificationHolder} />
          </Shimmer>
        </View>

        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonNotificationHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonNotificationHolder} />
          </Shimmer>
        </View>

        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonNotificationHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonNotificationHolder} />
          </Shimmer>
        </View>

        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonNotificationHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonNotificationHolder} />
          </Shimmer>
        </View>

        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonNotificationHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonNotificationHolder} />
          </Shimmer>
        </View>

        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonNotificationHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonNotificationHolder} />
          </Shimmer>
        </View>

        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonNotificationHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonNotificationHolder} />
          </Shimmer>
        </View>
      </View>
    </View>
  );

  const progressList = (
    <View style={styles.skeletonNParentHolder}>
      <View style={styles.notificationContentView}>
        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonProgressListHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonProgressListHolder} />
          </Shimmer>
        </View>

        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonProgressListHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonProgressListHolder} />
          </Shimmer>
        </View>

        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonProgressListHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonProgressListHolder} />
          </Shimmer>
        </View>

        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonProgressListHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonProgressListHolder} />
          </Shimmer>
        </View>

        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonProgressListHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonProgressListHolder} />
          </Shimmer>
        </View>

        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonProgressListHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonProgressListHolder} />
          </Shimmer>
        </View>

        <View style={styles.skeletonNotificationContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonProgressListHolder}
            visible={!isLoading}
          >
            <View style={styles.skeletonProgressListHolder} />
          </Shimmer>
        </View>
      </View>
    </View>
  );

  const nuggetDetails = (
    <View style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
      <View style={{
        width: '100%', height: 65, borderBottomColor: '#F0F0F0', borderBottomWidth: 2.5, marginTop: 0,
      }}
      >
        <View style={[styles.borderLine]} />
        <View style={{ width: '100%', height: 65, flexDirection: 'column' }}>
          <View style={styles.skeletonNuggetContent}>
            <Shimmer autoRun={isLoading} style={styles.skeletonNuggetContent} visible={!isLoading}>
              <View style={styles.skeletonNuggetContent} />
            </Shimmer>
          </View>
        </View>
      </View>

      <View style={{ width: '100%', height: 60, flexDirection: 'column' }}>
        <View style={styles.skeletonNuggetSubText}>
          <Shimmer autoRun={isLoading} style={styles.skeletonNuggetSubText} visible={!isLoading}>
            <View style={styles.skeletonNuggetSubText} />
          </Shimmer>
        </View>
      </View>

      <View style={{
        width: '100%', height: objectHolderHeight / 2 - 37, flexDirection: 'column', backgroundColor: 'red',
      }}
      >
        <View style={styles.skeletonNuggetVideo}>
          <Shimmer autoRun={isLoading} style={styles.skeletonNuggetVideo} visible={!isLoading}>
            <View style={styles.skeletonNuggetVideo} />
          </Shimmer>
        </View>
      </View>

      <View style={{ width: '100%', height: 40, flexDirection: 'column' }}>
        <View style={styles.skeletonNuggetText}>
          <Shimmer autoRun={isLoading} style={styles.skeletonNuggetText} visible={!isLoading}>
            <View style={styles.skeletonNuggetText} />
          </Shimmer>
        </View>
      </View>
    </View>
  );

  const objectDetails = (
    <View style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
      <View style={{ width: '100%', height: 60, flexDirection: 'column' }}>
        <View style={styles.skeletonNuggetSubText}>
          <Shimmer autoRun={isLoading} style={styles.skeletonNuggetSubText} visible={!isLoading}>
            <View style={styles.skeletonNuggetSubText} />
          </Shimmer>
        </View>
      </View>

      <View style={{
        width: '100%', height: objectHolderHeight / 2 - 37, flexDirection: 'column', backgroundColor: 'red',
      }}
      >
        <View style={styles.skeletonNuggetVideo}>
          <Shimmer autoRun={isLoading} style={styles.skeletonNuggetVideo} visible={!isLoading}>
            <View style={styles.skeletonNuggetVideo} />
          </Shimmer>
        </View>
      </View>

      <View style={{ width: '100%', height: 40, flexDirection: 'column' }}>
        <View style={styles.skeletonNuggetText}>
          <Shimmer autoRun={isLoading} style={styles.skeletonNuggetText} visible={!isLoading}>
            <View style={styles.skeletonNuggetText} />
          </Shimmer>
        </View>
      </View>
    </View>
  );

  const quizDetails = (
    <View style={{ width: '100%', height: 60, flexDirection: 'column' }}>
      <View style={{ width: '100%', height: 60, flexDirection: 'column' }}>
        <View style={styles.skeletonQuizContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonQuizProgress} visible={!isLoading}>
            <View style={styles.skeletonQuizProgress} />
          </Shimmer>
        </View>

        <View style={styles.skeletonLengthContent}>
          <Shimmer
            autoRun={isLoading}
            style={styles.skeletonQuestionLengthView}
            visible={!isLoading}
          >
            <View style={styles.skeletonQuestionLengthView} />
          </Shimmer>
        </View>

        <View style={styles.skeletonQuestionContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonQuestionView} visible={!isLoading}>
            <View style={styles.skeletonQuestionView} />
          </Shimmer>
        </View>

        <View style={styles.skeletonQuestionContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonQuestionView1} visible={!isLoading}>
            <View style={styles.skeletonQuestionView1} />
          </Shimmer>
        </View>

        <View style={styles.skeletonQuestionContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonQuestionView2} visible={!isLoading}>
            <View style={styles.skeletonQuestionView2} />
          </Shimmer>
        </View>

        <View style={styles.skeletonQuestionContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonQuestionView3} visible={!isLoading}>
            <View style={styles.skeletonQuestionView3} />
          </Shimmer>
        </View>

        <View style={styles.skeletonOptionContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonOptionView} visible={!isLoading}>
            <View style={styles.skeletonOptionView} />
          </Shimmer>
          <Shimmer autoRun={isLoading} style={styles.skeletonOptionView} visible={!isLoading}>
            <View style={styles.skeletonOptionView} />
          </Shimmer>
          <Shimmer autoRun={isLoading} style={styles.skeletonOptionView} visible={!isLoading}>
            <View style={styles.skeletonOptionView} />
          </Shimmer>
          <Shimmer autoRun={isLoading} style={styles.skeletonOptionView} visible={!isLoading}>
            <View style={styles.skeletonOptionView} />
          </Shimmer>
        </View>
      </View>
    </View>
  );

  const topicDetails = (
    <View>
      <View style={styles.shimmerViewPosition}>
        <View style={styles.skeletonTopicDetailsContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonNuggetRow} visible={!isLoading}>
            <View style={styles.skeletonNuggetRow} />
          </Shimmer>
        </View>

        <View style={styles.skeletonTopicDetailsContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonNuggetRow} visible={!isLoading}>
            <View style={styles.skeletonNuggetRow} />
          </Shimmer>
        </View>

        <View style={styles.skeletonTopicDetailsContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonNuggetRow} visible={!isLoading}>
            <View style={styles.skeletonNuggetRow} />
          </Shimmer>
        </View>

        <View style={styles.skeletonTopicDetailsContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonNuggetRow} visible={!isLoading}>
            <View style={styles.skeletonNuggetRow} />
          </Shimmer>
        </View>

        <View style={styles.skeletonTopicDetailsContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonNuggetRow} visible={!isLoading}>
            <View style={styles.skeletonNuggetRow} />
          </Shimmer>
        </View>

        <View style={styles.skeletonTopicDetailsContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonNuggetRow} visible={!isLoading}>
            <View style={styles.skeletonNuggetRow} />
          </Shimmer>
        </View>

        <View style={styles.skeletonTopicDetailsContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonNuggetRow} visible={!isLoading}>
            <View style={styles.skeletonNuggetRow} />
          </Shimmer>
        </View>
      </View>
    </View>
  );

  const topicDetails1 = (
    <View style={styles.skeletonTopicImgView}>
      <Shimmer autoRun={isLoading} style={styles.skeletonTopicImg} visible={!isLoading}>
        <View style={styles.skeletonTopicImg} />
      </Shimmer>
    </View>
  );

  const topicList = (
    <View style={{ width: '80%', height: 80, flexDirection: 'column' }}>
      <View style={{
        width: '80%', height: 60, margin: 10, flexDirection: 'column',
      }}
      >
        <View style={styles.skeletonContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonTopicImage} visible={!isLoading}>
            <View style={styles.skeletonTopicImage} />
          </Shimmer>
          <View style={styles.skeletonTextContent}>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.skeletonTextContent} />
            </Shimmer>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.skeletonTextContent} />
            </Shimmer>
          </View>
        </View>
        <View style={styles.skeletonContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonTopicImage} visible={!isLoading}>
            <View style={styles.skeletonTopicImage} />
          </Shimmer>
          <View style={styles.skeletonTextContent}>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.skeletonTextContent} />
            </Shimmer>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.skeletonTextContent} />
            </Shimmer>
          </View>
        </View>
        <View style={styles.skeletonContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonTopicImage} visible={!isLoading}>
            <View style={styles.skeletonTopicImage} />
          </Shimmer>
          <View style={styles.skeletonTextContent}>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.skeletonTextContent} />
            </Shimmer>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.skeletonTextContent} />
            </Shimmer>
          </View>
        </View>
        <View style={styles.skeletonContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonTopicImage} visible={!isLoading}>
            <View style={styles.skeletonTopicImage} />
          </Shimmer>
          <View style={styles.skeletonTextContent}>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.skeletonTextContent} />
            </Shimmer>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.skeletonTextContent} />
            </Shimmer>
          </View>
        </View>
        <View style={styles.skeletonContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonTopicImage} visible={!isLoading}>
            <View style={styles.skeletonTopicImage} />
          </Shimmer>
          <View style={styles.skeletonTextContent}>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.skeletonTextContent} />
            </Shimmer>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.skeletonTextContent} />
            </Shimmer>
          </View>
        </View>
        <View style={styles.skeletonContent}>
          <Shimmer autoRun={isLoading} style={styles.skeletonTopicImage} visible={!isLoading}>
            <View style={styles.skeletonTopicImage} />
          </Shimmer>
          <View style={styles.skeletonTextContent}>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.skeletonTextContent} />
            </Shimmer>
            <Shimmer autoRun={isLoading} visible={!isLoading}>
              <View style={styles.skeletonTextContent} />
            </Shimmer>
          </View>
        </View>
      </View>
    </View>
  );

  if (loader === 'explore') {
    skeletonScreen = explore;
  } else if (loader === 'myProfile') {
    skeletonScreen = myProfile;
  } else if (loader === 'home1') {
    skeletonScreen = home1;
  } else if (loader === 'topicsDashboard') {
    skeletonScreen = topicsDashboard;
  } else if (loader === 'home3') {
    skeletonScreen = home3;
  } else if (loader === 'notification') {
    skeletonScreen = notification;
  } else if (loader === 'progressList') {
    skeletonScreen = progressList;
  } else if (loader === 'nuggetDetails') {
    skeletonScreen = nuggetDetails;
  } else if (loader === 'objectDetails') {
    skeletonScreen = objectDetails;
  } else if (loader === 'quizDetails') {
    skeletonScreen = quizDetails;
  } else if (loader === 'topicDetails') {
    skeletonScreen = topicDetails;
  } else if (loader === 'topicDetails1') {
    skeletonScreen = topicDetails1;
  } else if (loader === 'topicList') {
    skeletonScreen = topicList;
  } else if (loader === 'landingScreen') {
    skeletonScreen = landingScreen;
  } else if (loader === 'landingScreen1') {
    skeletonScreen = landingScreen1;
  }
  return (
    skeletonScreen
  );
};

export default SkeletonLoader;

const styles = StyleSheet.create({
  exploreSkeletonView: {
    width: myTopicsWidth,
    height: myTopicsHeight - 15,
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  exploreShimmer1: {
    height: myTopicsHeight,
    width: myTopicsWidth,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        marginTop: 15,
      },
      android: {
        marginTop: 5,
      },
    }),
  },

  exploreShimmer3: {
    height: myTopicsHeight,
    width: myTopicsWidth,
    borderRadius: 10,
    marginLeft: 5,
    marginRight: 5,
    ...Platform.select({
      ios: {
        marginTop: 0,
      },
      android: {
        marginTop: 0,
      },
    }),
  },
  exploreShimmer2: {
    height: myTopicsHeight,
    width: myTopicsWidth,
    borderRadius: 10,
  },
  mpCertificateView: {
    width: '80%',
    height: 60,
    margin: 10,
    flexDirection: 'column',
  },
  mpSkeletonCertImage: {
    width: 125,
    height: 80,
    marginLeft: 8,
  },
  mpSkeletonCertContent: {
    flexDirection: 'row',
    marginTop: 10,
    marginRight: 80,
  },
  mpSkeletonTextContent: {
    marginLeft: 8,
    marginTop: 0,
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  homeSkeletonView1: {
    width: Constants.app_width - 30,
    height: topicsHeight + 210,
    marginTop: 15,
    alignSelf: 'center',
    borderRadius: 10,
  },
  homeSkeletonView2 :{
    width: Constants.app_width - 30,
    height: Constants.app_height,
    marginTop: 15,
    alignSelf: 'center',
    borderRadius: 10,
  },
  homeSkeletonShimmerView1: {
    width: Constants.app_width - 30,
    height: topicsHeight + 210,
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  homeSkeletonShimmerView2: {
    width: Constants.app_width - 30,
    height: Constants.app_height,
    // alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  myTopicsSkeletonView1: {
    width: myTopicsWidth,
    height: myTopicsHeight - 15,
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  myTopicsSkeletonView2: {
    width: topicsWidth - 3,
    height: topicsHeight - 15,
    margin: 2,
    borderRadius: 10,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        shadowOpacity: 1,
        elevation: 1,
      },
    }),
  },
  myTopicShimmerView1: {
    height: myTopicsHeight,
    width: myTopicsWidth,
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  myTopicShimmerView2: {
    height: myTopicsHeight,
    width: myTopicsWidth,
    borderRadius: 10,
    marginTop: 0,
  },
  myTopicShimmerView3: {
    marginTop: 10,
    width: topicsWidth - 50,
    height: topicsHeight - 15,
    borderRadius: 10,
    marginLeft: 5,
  },
  myTopicsShimmerText: {
    marginLeft: 5,
    marginRight: 10,
    marginTop: 18,
    width: '50%',
    height: 30,
  },
  landingScreenHolder: {
    height: myTopicsHeight - 60,
    width: myTopicsWidth,
    margin: 5,
    borderRadius: 10,
  },
  landingScreenSkeletonView: {
    width: myTopicsWidth,
    height: myTopicsHeight - 75,
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  homeScreenHolder2: {
    height: myTopicsHeight - 20,
    width: myTopicsWidth,
    borderRadius: 10,
    marginHorizontal: 5,
    marginTop: 20
  },
  homeScreenSkeletonView2: {
    width: myTopicsWidth,
    height: myTopicsHeight - 20,
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  landingScreenHolder1: {
    height: myTopicsHeight,
    width: myTopicsWidth,
    margin: 5,
    borderRadius: 10,
  },
  landingScreenSkeletonView1: {
    width: myTopicsWidth,
    height: myTopicsHeight,
    margin: 5,
    borderRadius: 10,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  homeScreenHolder3: {
    height: myTopicsHeight - 20,
    width: myTopicsWidth,
    marginTop: 10,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  homeScreenSkeletonView3: {
    width: myTopicsWidth,
    height: myTopicsHeight - 20,
    marginTop: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: 'white',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  skeletonNParentHolder: {
    width: '100%',
    height: 60,
    ...Platform.select({
      ios: {
        marginTop: 10,
      },
      android: {
        marginTop: 0,
      },
    }),
    flexDirection: 'column',
  },
  skeletonNotificationHolder: {
    width: '95%',
    height: 70,
    marginLeft: 8,
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  skeletonNotificationContent: {
    flexDirection: 'row',
    height: 80,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  skeletonProgressListHolder: {
    width: '95%',
    height: 70,
    marginLeft: 8,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
        marginTop: 20,
      },
    }),
  },
  notificationContentView: {
    width: '100%',
    height: 60,
    flexDirection: 'column',
  },
  skeletonNuggetContent: {
    width: '90%',
    height: 30,
    marginLeft: 18,
    marginRight: 20,
    marginTop: 8,
  },
  skeletonNuggetSubText: {
    width: '70%',
    height: 20,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
  },
  skeletonNuggetVideo: {
    width: '100%',
    height: objectHolderHeight / 2 - 37,
  },
  skeletonNuggetText: {
    width: '50%',
    height: 20,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
  },
  skeletonQuizProgress: {
    width: '100%',
    marginLeft: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
        height: 2,
      },
      android: {
        elevation: 1,
        height: 5,
      },
    }),
  },
  skeletonQuestionLengthView: {
    width: '25%',
    height: 15,
    marginLeft: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  skeletonQuestionView: {
    width: '85%',
    height: 15,
    marginLeft: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  skeletonQuestionView1: {
    width: '70%',
    height: 15,
    marginLeft: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  skeletonQuestionView2: {
    width: '75%',
    height: 15,
    marginLeft: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  skeletonQuestionView3: {
    width: '85%',
    height: 15,
    marginLeft: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  skeletonOptionView: {
    width: '95%',
    height: 70,
    marginTop: 10,
    borderRadius: 2,
    marginLeft: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  skeletonLengthContent: {
    flexDirection: 'row',
    height: 20,
    marginTop: -60,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  skeletonQuestionContent: {
    flexDirection: 'row',
    height: 20,
    marginTop: 5,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  skeletonQuizContent: {
    flexDirection: 'row',
    height: 80,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  skeletonOptionContent: {
    flexDirection: 'column',
    height: 80,
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  skeletonTopicImgView: {
    width: '100%',
    height: topicImageHeight,
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonTopicImg: {
    width: '100%',
    height: topicImageHeight,
  },
  skeletonNuggetRow: {
    width: '90%',
    height: 70,
    marginRight: 20,
    marginLeft: 20,
    borderRadius: 5,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  skeletonTopicDetailsContent: {
    flexDirection: 'row',
    height: 80,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0, .2)',
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 1,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  shimmerViewPosition: {
    width: '100%',
    height: 60,
    flexDirection: 'column',
    ...Platform.select({
      ios: {
        marginTop: 10,
      },
      android: {
        marginTop: 10,
      },
    }),
  },
  skeletonTopicImage: {
    width: 125,
    height: 80,
    marginLeft: 8,
  },
  skeletonContent: {
    flexDirection: 'row',
    marginTop: 20,
    marginRight: 80,
  },
  skeletonTextContent: {
    marginLeft: 8,
    marginTop: 0,
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
});
