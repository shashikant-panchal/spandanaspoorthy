import React, { useState, useEffect, useRef } from 'react'
import  { lmsInitialize, lmsFinish, lmsGetValue, lmsSetValue }   from 'scorm-again'
import { WebView } from 'react-native-webview'
import { View } from 'react-native'

const MyComponent = (props) => {
//   const { lmsInitialize, lmsFinish, lmsGetValue, lmsSetValue } = useScorm()
  const { url } = props
  // Call lmsInitialize when the component mounts
  useEffect(() => {
    lmsInitialize()
  }, [])
  // Call lmsFinish when the component unmounts
  useEffect(() => {
    return () => {
      lmsFinish()
    }
  }, [])
  // Use lmsGetValue and lmsSetValue to get and set SCORM data
//   const score = lmsGetValue('cmi.score.raw')
//   lmsSetValue('cmi.comments', 'This is a comment.')
  return (
    <View>
      <WebView source={{ uri: url }} />
    </View>
  )
}

export default MyComponent

// import React, { useEffect } from 'react';
// import { withScorm } from 'react-scorm-provider';
// import { Text } from 'react-native';

// const MyComponent = (props) => {
//   useEffect(() => {
//     if (props.sco && props.sco.apiConnected) {
//       props.sco.getSuspendData();
//     }
//   }, [props.sco.apiConnected]);

//   return props.sco.apiConnected ? <Text>connecting to LMS...</Text> : <Text>Connected! {JSON.stringify(props.sco.suspendData)}</Text>
// }

// export default withScorm()(MyComponent);
