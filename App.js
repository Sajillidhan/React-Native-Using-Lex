import React, {  useEffect, useState,Component } from 'react'
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Dimensions,
  Platform,
  Button,
} from 'react-native'

import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
  PlayBackType,
  RecordBackType,
} from 'react-native-audio-recorder-player';

import AWS from 'aws-sdk/dist/aws-sdk-react-native'
import soundImg from './assets/mic.png';
import muteImg from './assets/msg.png';
import RNFetchBlob from 'rn-fetch-blob';

// Initialize the Amazon Cognito credentials provider

AWS.config.region = 'ap-southeast-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
IdentityPoolId: 'ap-southeast-1:68e7183f-933f-4ba5-857f-6c90fecabdcb',
})



let lexRunTime = new AWS.LexRuntime()
let lexUserId = 'mediumBot' + Date.now()

let inputText;
let flag=true;
let voice=false;



const styles = StyleSheet.create({
  container: {
      flex: 1,
  },
  messages: {
      flex: 1,
      marginTop: 0,
      backgroundColor: '#E5E7E9'
},

  botMessages: {
      color: 'black',
      backgroundColor: 'white',
      padding: 10,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 20,
      borderTopLeftRadius: 20,
      marginBottom: 0,
      marginLeft:10,
      marginTop:10,
      borderTopRightRadius: 20,
      alignSelf: 'flex-start',
      bottom: 10,
      textAlign: 'left',
      width: '75%',
      fontSize:15
  },
userMessages: {
      backgroundColor: '#b5c9d2',
      color: 'black',
      padding: 10,
      marginBottom: 10,
      marginRight: 10,
      marginTop:20,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 0,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      width: '65%',
      alignSelf: 'flex-end',
      textAlign: 'left',
      fontFamily:'skg100',
      fontSize:15,
  },
  userVoice: {
    backgroundColor: '#b5c9d2',
      color: 'black',
      padding: 10,
      marginBottom: 10,
      marginRight: 10,
      marginTop:20,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 0,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      width: '65%',
      alignSelf: 'flex-end',
      textAlign: 'left',
      fontFamily:'skg100',
      fontSize:15,
  },
textInput: {
      flex: 2,
      paddingLeft: 15
  },
  responseContainer : {
      flexDirection: 'row',
      marginTop: 20,
      marginBottom: 0,
    
  },
  inputContainer: {
      flexDirection: 'row',
      backgroundColor: '#7C96A1',
      borderRadius:100,
      
  },
  optionsImage:
  {
    display:'none',
    height: 19,

  },

  viewBarWrapper: {
    marginTop: 28,
    marginHorizontal: 28,
    alignSelf: 'stretch',
  },
  viewBar: {
    backgroundColor: '#ccc',
    height: 4,
    alignSelf: 'stretch',
  },
  viewBarPlay: {
    backgroundColor: 'black',
    height: 4,
    width: 0,
  },

  txtCounter: {
    marginTop: 12,
    color: 'black',
    fontSize: 20,
    textAlignVertical: 'center',
    fontWeight: '200',
    fontFamily: 'Helvetica Neue',
    letterSpacing: 3,
  },
  
});


interface State {
  isLoggingIn: boolean;
  recordSecs: number;
  recordTime: string;
  currentPositionSec: number;
  currentDurationSec: number;
  playTime: string;
  duration: string;
}

const screenWidth = Dimensions.get('screen').width;

export default class App extends Component {
  public state: any;
	public setState: any;
  private dirs = RNFetchBlob.fs.dirs;

 

  private path = Platform.select({
    ios: 'hello.m4a',
    android: `${this.dirs.CacheDir}/hello.mp3`,
  });

 

 private audioRecorderPlayer: AudioRecorderPlayer;

  constructor(props: any) {
    super(props);
    this.state = {

      userInput: '',
      messages: [],
      inputEnabled: true,
      showSoundImg: true,
      isLoggingIn: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      currentPositionSec: 0,
      currentDurationSec: 0,
      playTime: '00:00:00',
      duration: '00:00:00',

      
    };


    

    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.audioRecorderPlayer.setSubscriptionDuration(0.1); // optional. Default is 0.5
  }

  
 


  //change msg mic icon
  renderImage()  {
    if (this.state.userInput== "") {
      this.state.showSoundImg = true;
    } else {
      this.state.showSoundImg = false;
    }
  var imgSource = this.state.showSoundImg? soundImg : muteImg;
  return (
    <Image
       style={ StyleSheet.optionsImage}
      source={ imgSource }
    />
  );
}


renderPlayImage()  {

<Image
       style={ StyleSheet.optionsImage}
      source={require('./assets/play.png')}
    />

}



// Sends Text to the lex runtime
  handleTextSubmit() {

    if (this.state.showSoundImg) {

      if(flag)
      {
      
        <TouchableOpacity>
        onPress={this.onStartRecord()}
        </TouchableOpacity>
        flag=false

      }

      else
      {

        <TouchableOpacity>
        onPress={this.onStopRecord()}
        {/* onPress={this.voiceMessageState("This is a voice note")} */}
        </TouchableOpacity>

        flag=true
        voice=true
        
      }
          
    }
    else {


      inputText = this.state.userInput.trim()
      if (inputText !== '')
        voice=false;
        this.showRequest(inputText)
    }
     

         
  }




  //Send voice message to message state
  voiceMessageState() {
    // Add text input to messages in state

      inputText= require('./assets/play.png');
    let oldMessages = Object.assign([], this.state.img)
    oldMessages.push({from: 'user', msg: inputText})
    
    this.setState({        
      messages: oldMessages,
      userInput: '',
      inputEnabled: false,  
   
  })
    this.sendToLex(inputText)

   
}



 
// Populates screen with user inputted message
  showRequest(inputText) {
      // Add text input to messages in state
      let oldMessages = Object.assign([], this.state.messages)
      oldMessages.push({from: 'user', msg: inputText})
      this.setState({
          messages: oldMessages,
          userInput: '',
          inputEnabled: false
      })
      this.sendToLex(inputText)
          
  }


// Responsible for sending message to lex
  sendToLex(message) {
      let params = {
          botAlias: '$LATEST',
          botName: 'MakeUsername',
          inputText: message,
          userId: lexUserId,
      }
      lexRunTime.postText(params, (err, data) => {
          if(err) {
              // TODO SHOW ERROR ON MESSAGES
          }
          if (data) {
              this.showResponse(data)
          }
      })
  }
showResponse(lexResponse) {
      let lexMessage = lexResponse.message
      let oldMessages = Object.assign([], this.state.messages)
      oldMessages.push({from: 'bot', msg: lexMessage})
      this.setState({
          messages: oldMessages,
          inputEnabled: true 
      })
  }





//Chat Screen  
renderTextItem(item) {

      let style,
          responseStyle
      if (item.from === 'bot') {
          style = styles.botMessages
          
          responseStyle = styles.responseContainer
      } else {
        if(voice == true) {
          // {this.renderPlayImage()} 
          style = styles.userMessages
          responseStyle = {}
        } else {
          style = styles.userMessages
          responseStyle = {}
        }
      }
      return (
          <View style={responseStyle}>
           
              <Text style={style}>{item.msg}</Text>
          </View>
      )
  }


 

//Record render
  public render(){

    let playWidth =
    (this.state.currentPositionSec / this.state.currentDurationSec) *
    (screenWidth - 56);

  if (!playWidth) {
    playWidth = 0;
  }

      return(
          <View style={styles.container}>
              <View style={styles.messages}>
                  <FlatList 
                      data={this.state.messages}
                      renderItem={({ item }) =>    this.renderTextItem(item)}
                      keyExtractor={(item, index) => index}
                      extraData={this.state.messages}
    />                     
                   
              </View>

               
              <View style={styles.viewPlayer}>
          <TouchableOpacity
            style={styles.viewBarWrapper}
            onPress={this.onStatusPress}
          >
            <View style={styles.viewBar}>
              <View style={[styles.viewBarPlay, {width: playWidth}]} />
            </View>
          </TouchableOpacity>
          <Text style={styles.txtCounter}>
            {this.state.playTime} / {this.state.duration}
          </Text>

                    <Button 
                    title='Start Play'
                    onPress={() =>this.onStartPlay()}/>

                    <Button 
                    title='Stop Play'
                    onPress={() =>this.onStopPlay()}/>
          </View>
         



              <View style={styles.inputContainer}>

                  <TextInput
                      onChangeText={(text) => this.setState({userInput: text})}
                      value={this.state.userInput}
                      style={styles.textInput}
                      editable={this.state.inputEnabled}
                      placeholder={'Type here to talk!'}
                    
                      autoFocus={true}
                      onSubmitEditing={this.handleTextSubmit.bind(this)}


                  />
                      <TouchableOpacity 
                    onPress={()=>{this.handleTextSubmit()}}>
                    {this.renderImage()} 
                    </TouchableOpacity>  
               
             </View>  
                            
            
          </View>

         

      )
  }
  

  //Record Status

  private onStatusPress = (e: any) => {
    const touchX = e.nativeEvent.locationX;
    console.log(`touchX: ${touchX}`);
    const playWidth =
      (this.state.currentPositionSec / this.state.currentDurationSec) *
      (screenWidth - 56);
    console.log(`currentPlayWidth: ${playWidth}`);

    const currentPosition = Math.round(this.state.currentPositionSec);

    if (playWidth && playWidth < touchX) {
      const addSecs = Math.round(currentPosition + 1000);
      this.audioRecorderPlayer.seekToPlayer(addSecs);
      console.log(`addSecs: ${addSecs}`);
    } else {
      const subSecs = Math.round(currentPosition - 1000);
      this.audioRecorderPlayer.seekToPlayer(subSecs);
      console.log(`subSecs: ${subSecs}`);
    }
  };




  private onStartRecord = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        console.log('write external stroage', grants);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('permissions granted');
        } else {
          console.log('All required permissions not granted');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    const audioSet: AudioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };

    console.log('audioSet', audioSet);
    //? Custom path
    const uri = await this.audioRecorderPlayer.startRecorder(this.path,audioSet);
      
    //? Default path
    // const uri = await this.audioRecorderPlayer.startRecorder(
    //   undefined,
    //   audioSet,
    // );

    this.audioRecorderPlayer.addRecordBackListener((e: RecordBackType) => {
      console.log('record-back', e);
      this.setState({
        recordSecs: e.currentPosition,
        recordTime: this.audioRecorderPlayer.mmssss(
          Math.floor(e.currentPosition),
        ),
      });
    });
    console.log(`uri: ${uri}`);
  };




  private onStopRecord = async () => {
    const result = await this.audioRecorderPlayer.stopRecorder();
    this.audioRecorderPlayer.removeRecordBackListener();
    this.setState({
      recordSecs: 0,
    });
    console.log(result);

    this.showRequest(result);
    this.onStartPlay();
  };

  private onStartPlay = async () => {
    console.log('onStartPlay');
    //? Custom path
    const msg = await this.audioRecorderPlayer.startPlayer(this.path);

    //? Default path
    // const msg = await this.audioRecorderPlayer.startPlayer();
    const volume = await this.audioRecorderPlayer.setVolume(1.0);
    console.log(`file: ${msg}`, `volume: ${volume}`);

    this.audioRecorderPlayer.addPlayBackListener((e: PlayBackType) => {
      this.setState({
        currentPositionSec: e.currentPosition,
        currentDurationSec: e.duration,
        playTime: this.audioRecorderPlayer.mmssss(
          Math.floor(e.currentPosition),
        ),
        duration: this.audioRecorderPlayer.mmssss(Math.floor(e.duration)),
      });
    });
  };


  private onStopPlay = async () => {
    console.log('onStopPlay');
    this.audioRecorderPlayer.stopPlayer();
    this.audioRecorderPlayer.removePlayBackListener();
  };
}



