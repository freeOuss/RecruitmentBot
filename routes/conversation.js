/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const watson = require('watson-developer-cloud'); // watson sdk
/*******  CHANGES HERE **********/
var mysql = require('mysql');
var db = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '',
  database : 'Questions'
});
var db2 = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '',
  database : 'Reponses'
});
var db3 = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '',
  database : 'Emotional_Images'
});
let finalresponse = false;
let QuestionUno = '';
let QuestionDos = '';
let QuestionTres = '';
var QCMQuestions = [];
let QCMIndex = [];
let QCMOptions = [];
let QCMOptionsState =[];
let intelligenceQuestions = [];
let intelligenceIndex = [];
let intelligenceOptions = [];
let intelligenceOptionsState =[];
let intelligenceImageOptions = [];
let intelligenceImageOptionsState =[];
let redactionIndex = [];
let redactionQuestions = [];
let contextQCMIndex = {};
let contextIntelIndex = {};
let contextRedactionIndex = {};
let contextQCMRightAnswers = {};
let contextIntelRightAnswers = {};
let CREATE_IMAGE_TABLE_QUERY = 'CREATE TABLE `Emotional_Images`.?? ( `id` TEXT NULL , `url` TEXT NULL , `date` TEXT NULL , `emotion` TEXT NULL , `emotionValue` DECIMAL(3,2) NULL )';
let INSERT_IMAGE_QUERY = 'insert into ?? (id, url, date, emotion, emotionValue) values (?,?,?,?,?)';
//getQuestionIndexFromDB(QCMIndex,QCMQuestions,QCMOptions,QCMOptionsState,getQuestionFromDB,getQuestionOptionFromDB);


// Create the service wrapper
const conversation = new watson.ConversationV1({
  // If unspecified here, the ASSISTANT_USERNAME and ASSISTANT_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  username: process.env.ASSISTANT_USERNAME || '<username>',
  password: process.env.ASSISTANT_PASSWORD || '<password>',
  url: 'https://gateway.watsonplatform.net/conversation/api/',
  version_date: '2018-02-16'
});

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
const updateMessage = (input, response) => {
  //console.log('inputis...',input.input.text);
  //console.log('before serverside changes');
  //console.log(JSON.stringify(response));
  var responseText = null;
  if (!response.output) {
    response.output = {};
  } else {
    if(response.intents.length > 0 && (response.intents[0].intent === 'InputValidated')){
      //console.log('We are here');
      let filiére = response.context.userInput1.field;
      //console.log(filiére);
      //console.log('a');
      contextRedactionIndex  = getRedactionQuestionIndexFromDB(redactionIndex,redactionQuestions,getRedactionFromDB,filiére,response);
      contextIntelIndex = getIntelligenceQuestionIndexFromDB(intelligenceIndex,intelligenceQuestions,intelligenceOptions,intelligenceOptionsState, intelligenceImageOptions, intelligenceImageOptionsState, getintelligenceQuestionFromDB,getintelligenceQuestionOptionFromDB,getintelligenceImageOptionFromDB,response,contextIntelRightAnswers);
      contextQCMIndex = getQuestionIndexFromDB(QCMIndex,QCMQuestions,QCMOptions,QCMOptionsState,getQuestionFromDB,getQuestionOptionFromDB,filiére,response,contextQCMRightAnswers);
      //console.log('INSIDE INPUTVALIDATED after passing by GETQUESTIONINDEX...CONTEXT IS',response.context);
      //console.log('e');
    }
    if (response.intents.length > 0 && (response.intents[0].intent === 'reponseRedaction'|| response.intents[0].intent === 'reponseQCM' || response.intents[0].intent === 'InputValidated2' )) {
      //contextIntelIndex = contextIntel[0];
      //contextIntelRightAnswers = contextIntel[1];
      //contextQCMIndex = contextQCM[0];
      //contextQCMRightAnswers = contextQCM[1];
      response.context.QCMIndexes = contextQCMIndex;
      response.context.intelIndexes = contextIntelIndex;
      response.context.redactionIndexes = contextRedactionIndex;
      response.context.QCMRightOptions = contextQCMRightAnswers;
      response.context.IntelRightOptions = contextIntelRightAnswers;
      //console.log ('at the end...', contextIntelIndex, contextRedactionIndex, contextQCMIndex, contextIntelRightAnswers,  contextQCMRightAnswers,response.context );
      response = setQuestions(response, QCMQuestions, QCMOptions);

    }
    if (response.intents.length > 0 && response.context.QuestionCount == 1 && response.context.Answered == true && 
      (response.intents[0].intent === 'Regime' ||
      response.intents[0].intent === 'filiere' ||
      response.intents[0].intent === 'salaire' ||
      response.intents[0].intent === 'prime' ||
      response.intents[0].intent === 'Heures_supplementaires' ||
      response.intents[0].intent === 'Deplacement' ||
      response.intents[0].intent === 'Horaires_Travail' )) {
      QuestionUno = input.input.text;
      console.log('la Premiére question demandée est : ',QuestionUno );
    }
    if (response.intents.length > 0 && response.context.QuestionCount == 2 && response.context.Answered == true && 
      (response.intents[0].intent === 'Regime' ||
      response.intents[0].intent === 'filiere' ||
      response.intents[0].intent === 'salaire' ||
      response.intents[0].intent === 'prime' ||
      response.intents[0].intent === 'Heures_supplementaires' ||
      response.intents[0].intent === 'Deplacement' ||
      response.intents[0].intent === 'Horaires_Travail' )) {
      QuestionDos = input.input.text;
      console.log('la Deuxiéme question demandée est : ',QuestionDos );
    }
    if (response.intents.length > 0 && response.context.QuestionCount == 3 && response.context.Answered == true && 
      (response.intents[0].intent === 'Regime' ||
        response.intents[0].intent === 'filiere' ||
        response.intents[0].intent === 'salaire' ||
        response.intents[0].intent === 'prime' ||
        response.intents[0].intent === 'Heures_supplementaires' ||
        response.intents[0].intent === 'Deplacement' ||
        response.intents[0].intent === 'Horaires_Travail' )) {
      QuestionTres = input.input.text;
      console.log('la Troisiéme question demandée est : ',QuestionTres );
      
      
    }
    if(QuestionUno != '' && QuestionDos != '' && QuestionTres !='' && finalresponse == false){
      finalresponse = true;
      response = sendToDatabase(response);
    }
    //console.log('after serverside changes');
    //console.log(JSON.stringify(response));
    return response;
  }
  if (response.intents && response.intents[0]) {
    var intent = response.intents[0];
    // Depending on the confidence of the response the app can return different messages.
    // The confidence will vary depending on how well the system is trained. The service will always try to assign
    // a class/intent to the input. If the confidence is low, then it suggests the service is unsure of the
    // user's intent . In these cases it is usually best to return a disambiguation message
    // ('I did not understand your intent, please rephrase your question', etc..)
    if (intent.confidence >= 0.75) {
      responseText = 'I understood your intent was ' + intent.intent;
    } else if (intent.confidence >= 0.5) {
      responseText = 'I think your intent was ' + intent.intent;
    } else {
      responseText = 'I did not understand your intent';
    }
  }
  response.output.text = responseText;
  return response;
};
function setQuestions(response, QCMQuestions, QCMOptions) {
  var output = response.output.text[0];
  //console.log('le QCM options est');
  //console.log(QCMOptions);
  //console.log(String(QCMQuestions[0]));
  //console.log(String(QCMQuestions[1]));
  //console.log(String(QCMQuestions[2]));
  //console.log('HEY FUCK, WE ARE IN CHANGING OUTPUT');
  output=output.replace('_qcm.question.1', String(QCMQuestions[0]));
  output=output.replace('_qcm.question.2', String(QCMQuestions[1]));
  output=output.replace('_qcm.question.3', String(QCMQuestions[2]));
  output=output.replace('_qcm.question.4', String(QCMQuestions[3]));
  output=output.replace('_qcm.option.1.1', String(QCMOptions[0][0]));
  output=output.replace('_qcm.option.1.2', String(QCMOptions[0][1]));
  output=output.replace('_qcm.option.1.3', String(QCMOptions[0][2]));
  output=output.replace('_qcm.option.1.4', String(QCMOptions[0][3]));
  output=output.replace('_qcm.option.1.5', String(QCMOptions[0][4]));
  output=output.replace('_qcm.option.1.6', String(QCMOptions[0][5]));
  output=output.replace('_qcm.option.1.7', String(QCMOptions[0][6]));
  output=output.replace('_qcm.option.2.1', String(QCMOptions[1][0]));
  output=output.replace('_qcm.option.2.2', String(QCMOptions[1][1]));
  output=output.replace('_qcm.option.2.3', String(QCMOptions[1][2]));
  output=output.replace('_qcm.option.2.4', String(QCMOptions[1][3]));
  output=output.replace('_qcm.option.2.5', String(QCMOptions[1][4]));
  output=output.replace('_qcm.option.2.6', String(QCMOptions[1][5]));
  output=output.replace('_qcm.option.2.7', String(QCMOptions[1][6]));
  output=output.replace('_qcm.option.3.1', String(QCMOptions[2][0]));
  output=output.replace('_qcm.option.3.2', String(QCMOptions[2][1]));
  output=output.replace('_qcm.option.3.3', String(QCMOptions[2][2]));
  output=output.replace('_qcm.option.3.4', String(QCMOptions[2][3]));
  output=output.replace('_qcm.option.3.5', String(QCMOptions[2][4]));
  output=output.replace('_qcm.option.3.6', String(QCMOptions[2][5]));
  output=output.replace('_qcm.option.3.7', String(QCMOptions[2][6]));
  output=output.replace('_qcm.option.4.1', String(QCMOptions[3][0]));
  output=output.replace('_qcm.option.4.2', String(QCMOptions[3][1]));
  output=output.replace('_qcm.option.4.3', String(QCMOptions[3][2]));
  output=output.replace('_qcm.option.4.4', String(QCMOptions[3][3]));
  output=output.replace('_qcm.option.4.5', String(QCMOptions[3][4]));
  output=output.replace('_qcm.option.4.6', String(QCMOptions[3][5]));
  output=output.replace('_qcm.option.4.7', String(QCMOptions[3][6]));
  output=output.replace('_hidden1.1', String(QCMOptionsState[0][0]));
  output=output.replace('_hidden1.2', String(QCMOptionsState[0][1]));
  output=output.replace('_hidden1.3', String(QCMOptionsState[0][2]));
  output=output.replace('_hidden1.4', String(QCMOptionsState[0][3]));
  output=output.replace('_hidden1.5', String(QCMOptionsState[0][4]));
  output=output.replace('_hidden1.6', String(QCMOptionsState[0][5]));
  output=output.replace('_hidden1.7', String(QCMOptionsState[0][6]));
  output=output.replace('_hidden2.1', String(QCMOptionsState[1][0]));
  output=output.replace('_hidden2.2', String(QCMOptionsState[1][1]));
  output=output.replace('_hidden2.3', String(QCMOptionsState[1][2]));
  output=output.replace('_hidden2.4', String(QCMOptionsState[1][3]));
  output=output.replace('_hidden2.5', String(QCMOptionsState[1][4]));
  output=output.replace('_hidden2.6', String(QCMOptionsState[1][5]));
  output=output.replace('_hidden2.7', String(QCMOptionsState[1][6]));
  output=output.replace('_hidden3.1', String(QCMOptionsState[2][0]));
  output=output.replace('_hidden3.2', String(QCMOptionsState[2][1]));
  output=output.replace('_hidden3.3', String(QCMOptionsState[2][2]));
  output=output.replace('_hidden3.4', String(QCMOptionsState[2][3]));
  output=output.replace('_hidden3.5', String(QCMOptionsState[2][4]));
  output=output.replace('_hidden3.6', String(QCMOptionsState[2][5]));
  output=output.replace('_hidden3.7', String(QCMOptionsState[2][6]));
  output=output.replace('_hidden4.1', String(QCMOptionsState[3][0]));
  output=output.replace('_hidden4.2', String(QCMOptionsState[3][1]));
  output=output.replace('_hidden4.3', String(QCMOptionsState[3][2]));
  output=output.replace('_hidden4.4', String(QCMOptionsState[3][3]));
  output=output.replace('_hidden4.5', String(QCMOptionsState[3][4]));
  output=output.replace('_hidden4.6', String(QCMOptionsState[3][5]));
  output=output.replace('_hidden4.7', String(QCMOptionsState[3][6]));
  output=output.replace('_intel.question.1',intelligenceQuestions[0]);
  output=output.replace('_intel.question.2',intelligenceQuestions[1]);
  output=output.replace('_intel.question.3',intelligenceQuestions[2]);
  output=output.replace('_intel.option.1.1', String(intelligenceOptions[0][0]));
  output=output.replace('_intel.option.1.2', String(intelligenceOptions[0][1]));
  output=output.replace('_intel.option.1.3', String(intelligenceOptions[0][2]));
  output=output.replace('_intel.option.1.4', String(intelligenceOptions[0][3]));
  output=output.replace('_intel.option.1.5', String(intelligenceOptions[0][4]));
  output=output.replace('_intel.option.2.1', String(intelligenceOptions[1][0]));
  output=output.replace('_intel.option.2.2', String(intelligenceOptions[1][1]));
  output=output.replace('_intel.option.2.3', String(intelligenceOptions[1][2]));
  output=output.replace('_intel.option.2.4', String(intelligenceOptions[1][3]));
  output=output.replace('_intel.option.2.5', String(intelligenceOptions[1][4]));
  output=output.replace('_intel.option.3.1', String(intelligenceOptions[2][0]));
  output=output.replace('_intel.option.3.2', String(intelligenceOptions[2][1]));
  output=output.replace('_intel.option.3.3', String(intelligenceOptions[2][2]));
  output=output.replace('_intel.option.3.4', String(intelligenceOptions[2][3]));
  output=output.replace('_intel.option.3.5', String(intelligenceOptions[2][4]));
  output=output.replace('_hiddenIntel1.1', String(intelligenceOptionsState[0][0]));
  output=output.replace('_hiddenIntel1.2', String(intelligenceOptionsState[0][1]));
  output=output.replace('_hiddenIntel1.3', String(intelligenceOptionsState[0][2]));
  output=output.replace('_hiddenIntel1.4', String(intelligenceOptionsState[0][3]));
  output=output.replace('_hiddenIntel1.5', String(intelligenceOptionsState[0][4]));
  output=output.replace('_hiddenIntel2.1', String(intelligenceOptionsState[1][0]));
  output=output.replace('_hiddenIntel2.2', String(intelligenceOptionsState[1][1]));
  output=output.replace('_hiddenIntel2.3', String(intelligenceOptionsState[1][2]));
  output=output.replace('_hiddenIntel2.4', String(intelligenceOptionsState[1][3]));
  output=output.replace('_hiddenIntel2.5', String(intelligenceOptionsState[1][4]));
  output=output.replace('_hiddenIntel3.1', String(intelligenceOptionsState[2][0]));
  output=output.replace('_hiddenIntel3.2', String(intelligenceOptionsState[2][1]));
  output=output.replace('_hiddenIntel3.3', String(intelligenceOptionsState[2][2]));
  output=output.replace('_hiddenIntel3.4', String(intelligenceOptionsState[2][3]));
  output=output.replace('_hiddenIntel3.5', String(intelligenceOptionsState[2][4]));
  output=output.replace('imgsrc10', String(intelligenceImageOptions[0][0]));
  output=output.replace('imgsrc11', String(intelligenceImageOptions[0][1]));
  output=output.replace('imgsrc12', String(intelligenceImageOptions[0][2]));
  output=output.replace('imgsrc13', String(intelligenceImageOptions[0][3]));
  output=output.replace('imgsrc14', String(intelligenceImageOptions[0][4]));
  output=output.replace('imgsrc15', String(intelligenceImageOptions[0][5]));
  output=output.replace('imgsrc20', String(intelligenceImageOptions[1][0]));
  output=output.replace('imgsrc21', String(intelligenceImageOptions[1][1]));
  output=output.replace('imgsrc22', String(intelligenceImageOptions[1][2]));
  output=output.replace('imgsrc23', String(intelligenceImageOptions[1][3]));
  output=output.replace('imgsrc24', String(intelligenceImageOptions[1][4]));
  output=output.replace('imgsrc25', String(intelligenceImageOptions[1][5]));
  output=output.replace('imgsrc30', String(intelligenceImageOptions[2][0]));
  output=output.replace('imgsrc31', String(intelligenceImageOptions[2][1]));
  output=output.replace('imgsrc32', String(intelligenceImageOptions[2][2]));
  output=output.replace('imgsrc33', String(intelligenceImageOptions[2][3]));
  output=output.replace('imgsrc34', String(intelligenceImageOptions[2][4]));
  output=output.replace('imgsrc35', String(intelligenceImageOptions[2][5]));
  output=output.replace('hiddenImg1.0', String(intelligenceImageOptionsState[0][0]));
  output=output.replace('hiddenImg1.1', String(intelligenceImageOptionsState[0][1]));
  output=output.replace('hiddenImg1.2', String(intelligenceImageOptionsState[0][2]));
  output=output.replace('hiddenImg1.3', String(intelligenceImageOptionsState[0][3]));
  output=output.replace('hiddenImg1.4', String(intelligenceImageOptionsState[0][4]));
  output=output.replace('hiddenImg1.5', String(intelligenceImageOptionsState[0][5]));
  output=output.replace('hiddenImg2.0', String(intelligenceImageOptionsState[1][0]));
  output=output.replace('hiddenImg2.1', String(intelligenceImageOptionsState[1][1]));
  output=output.replace('hiddenImg2.2', String(intelligenceImageOptionsState[1][2]));
  output=output.replace('hiddenImg2.3', String(intelligenceImageOptionsState[1][3]));
  output=output.replace('hiddenImg2.4', String(intelligenceImageOptionsState[1][4]));
  output=output.replace('hiddenImg2.5', String(intelligenceImageOptionsState[1][5]));
  output=output.replace('hiddenImg3.0', String(intelligenceImageOptionsState[2][0]));
  output=output.replace('hiddenImg3.1', String(intelligenceImageOptionsState[2][1]));
  output=output.replace('hiddenImg3.2', String(intelligenceImageOptionsState[2][2]));
  output=output.replace('hiddenImg3.3', String(intelligenceImageOptionsState[2][3]));
  output=output.replace('hiddenImg3.4', String(intelligenceImageOptionsState[2][4]));
  output=output.replace('hiddenImg3.5', String(intelligenceImageOptionsState[2][5]));
  output=output.replace('_redaction1', String(redactionQuestions[0]));
  output=output.replace('_redaction2', String(redactionQuestions[1]));



  //output=output.replace('_buttons','\n\n<div id= \'buttons\'><button id= \'buttonA\'onclick=\'registerA();\'>A</button><button id= \'buttonB\'onclick=\'registerB();\'>B</button></div>');
  //console.log('HEY FUCK, WE PASSED CHANGING OUTPUT');
  /*output = output.replace('_qcm.question.1', String(QCMQuestions[0]));
  output = output.replace('_qcm.question.2', String(QCMQuestions[1]));
  output = output.replace('_qcm.question.3', String(QCMQuestions[2]));*/
  //console.log('avant associer output  à response on affiche output');
  //console.log(output);
  response.output.text[0] = output;
  //console.log('apres associer output  à response on affiche response');
  //console.log(response);
  return response;
}

function getQuestionIndexFromDB(QCMIndex,QCMQuestions,QCMOptions,QCMOptionsState,getQuestionFromDB,getQuestionOptionFromDB,filiére,response){
  //console.log('d');
  let context = response.context;
  let sql = 'SELECT id,repcorrecte,niveau FROM qcm where domaine = ? order by RAND() limit 4 ';
  db.query(sql, filiére, (err, result) => {
    if(err){
      console.log('erreur dans requete1',err);
      //console.log('error in conection');
    }
    else{
      //console.log('Reponse avec QCMIndex et RepCorr',result);
      for (let index = 0; index < 4; index++) {
        QCMIndex[index]= String(result[index].id);
      
      }
      context.QCMIndexes.qcm1 = QCMIndex[0];
      context.QCMIndexes.qcm2 = QCMIndex[1];
      context.QCMIndexes.qcm3 = QCMIndex[2];
      context.QCMIndexes.qcm4 = QCMIndex[3];
      context.QCMRightOptions.qcm1 = result[0].repcorrecte + '_' + result[0].niveau;
      context.QCMRightOptions.qcm2 = result[1].repcorrecte + '_' + result[1].niveau;
      context.QCMRightOptions.qcm3 = result[2].repcorrecte + '_' + result[2].niveau;
      context.QCMRightOptions.qcm4 = result[3].repcorrecte + '_' + result[3].niveau;
      contextQCMIndex = context.QCMIndexes;
      contextQCMRightAnswers = context.QCMRightOptions;
      //console.log('QCMINDexDone...',context.QCMIndexes);
      //console.log('QCMReponsesCorr Done...',context.QCMRightOptions);
      response.context = context;
      //console.log('afterChanges... response is...',response.context);
      //console.log('a');
      getQuestionFromDB(QCMIndex,QCMQuestions);
      getQuestionOptionFromDB(QCMIndex,QCMOptions,QCMOptionsState);
      //console.log('d');
      return contextQCMIndex;
    }
  });
    
}
function getIntelligenceQuestionIndexFromDB(intelligenceIndex,intelligenceQuestions,intelligenceOptions,intelligenceOptionsState, intelligenceImageOptions, intelligenceImageOptionsState, getintelligenceQuestionFromDB,getintelligenceQuestionOptionFromDB,getintelligenceImageOptionFromDB,response){
  let context = response.context;
  let sql = 'SELECT id, repcorrecte, niveau FROM intelligence order by RAND() limit 3';
  //console.log('c');
  db.query(sql, (err, result) => {
    if(err){
      //console.log('error in conection');
    }
    for (let index = 0; index < 3; index++) {
      intelligenceIndex[index]= String(result[index].id);
    
    }
    context.intelIndexes.intel1 = intelligenceIndex[0];
    context.intelIndexes.intel2 = intelligenceIndex[1];
    context.intelIndexes.intel3 = intelligenceIndex[2];
    context.IntelRightOptions.intel1 = result[0].repcorrecte + '_' + result[0].niveau;
    context.IntelRightOptions.intel2 = result[1].repcorrecte + '_' + result[1].niveau;
    context.IntelRightOptions.intel3 = result[2].repcorrecte + '_' + result[2].niveau;
    contextIntelIndex = context.intelIndexes;
    contextIntelRightAnswers = context.IntelRightOptions;
    response.context = context;
    //console.log('afterChanges respnse.context now is ...',response.context);
    getintelligenceQuestionFromDB(intelligenceIndex,intelligenceQuestions);
    getintelligenceQuestionOptionFromDB(intelligenceIndex,intelligenceOptions,intelligenceOptionsState);
    getintelligenceImageOptionFromDB(intelligenceIndex,intelligenceImageOptions,intelligenceImageOptionsState);
    //console.log(intelligenceIndex);
    return contextIntelIndex;
  });
}
function getRedactionQuestionIndexFromDB(redactionIndex,redactionQuestions,getRedactionFromDB,filiére,response){
  //console.log('b');
  let context = response.context;
  let sql = 'SELECT id from redaction where domaine = ? order by RAND() limit 2 ';
  db.query(sql, filiére, (err,result) => {
    if(err){
      console.log('error in conection',err);
    }else{
      //console.log('haha...',result);
      for (let index = 0; index < 2; index++) {
        redactionIndex[index]= String(result[index].id);
        //console.log('Item is...',index);
      }
      context.redactionIndexes.redaction1 = redactionIndex[0];
      context.redactionIndexes.redaction2 = redactionIndex[1];
      response.context = context;
      contextRedactionIndex = response.context.redactionIndexes;
      //console.log('afterChanges respnse.context now is ...',contextRedactionIndex);
      getRedactionFromDB(redactionIndex,redactionQuestions);
    }
    return contextRedactionIndex;
  });
}
function getQuestionFromDB(QCMIndex,QCMQuestions){
  //console.log('b');
  for (let index = 0; index < 4; index++) {
    let sql ='SELECT question FROM qcm WHERE id = ?';
    db.query(sql, QCMIndex[index], (err, result) => {
      if(err){
        console.log('error in requete2');
      }
      QCMQuestions[index]= String(result[0].question);
    });
    
  }
  
    
    
  return QCMQuestions;
}
function getintelligenceQuestionFromDB(intelligenceIndex,intelligenceQuestions){
  for (let index = 0; index < 3; index++) {
    let sql ='SELECT questiontext FROM intelligence WHERE id = ?';
    db.query(sql, intelligenceIndex[index], (err, result) => {
      if(err){
        console.log('error in conection');
      }
      intelligenceQuestions[index]= String(result[0].questiontext);
    });
    
  }
  
    
    
  return intelligenceQuestions;
}
function getRedactionFromDB(redactionIndex,redactionQuestions){
  let sql ='SELECT question FROM redaction WHERE id = ?';

  db.query(sql, redactionIndex[0], (err, result) => {
    if(err){
      console.log('error in conection');
    }else{
      redactionQuestions.push(String(result[0].question));
       
    }
  });
  db.query(sql, redactionIndex[1], (err, result) => {
    if(err){
      console.log('error in conection');
    }else{
      redactionQuestions.push(String(result[0].question)) ;
      //console.log('redactionQuestion is...',redactionQuestions);
      return redactionQuestions;
    }
  });
  
}
function getQuestionOptionFromDB(QCMIndex,QCMOptions,QCMOptionsState){
  //console.log('c');
  for (let index = 0; index < 4; index++) {
    QCMOptions[index] = [];
    QCMOptionsState[index] = [];
    let sql ='SELECT a,b,c,d,e,f,g FROM qcm WHERE id = ? ';
    db.query(sql, QCMIndex[index], (err, result) => {
      if(err){
        console.log('error in requete3');
      }
      //QCMOptions[index]= String(result[0].question);
      //console.log('On va afficher les options des questions');
      //console.log(result[0].c);
      //console.log('Hey on affiche les options');
        
      
    
      QCMOptions[index].push(String(result[0].a));
      QCMOptionsState[index].push('');
      QCMOptions[index].push(String(result[0].b));
      QCMOptionsState[index].push('');
      QCMOptions[index].push(String(result[0].c));
      QCMOptionsState[index].push('');
      QCMOptions[index].push(String(result[0].d));
      if (String(result[0].d) === '' ){
        QCMOptionsState[index].push('hidden =\'hidden\'');
      }else{
        QCMOptionsState[index].push('');
      }
      QCMOptions[index].push(String(result[0].e));
      if (String(result[0].e) === '') {
        QCMOptionsState[index].push('hidden =\'hidden\'');
      }else{
        QCMOptionsState[index].push('');
      }
      QCMOptions[index].push(String(result[0].f));
      if (String(result[0].f) === '' ){
        QCMOptionsState[index].push('hidden =\'hidden\'');
      }else{
        QCMOptionsState[index].push('');
      }
      QCMOptions[index].push(String(result[0].g));
      if (String(result[0].g) === ''){
        QCMOptionsState[index].push('hidden =\'hidden\'');
      }else{
        QCMOptionsState[index].push('');
      }
      //console.log(QCMOptions[index]);
      //console.log(QCMOptionsState[index]);

    });
    
  }//console.log(QCMOptions);
  
    
    
  return QCMOptions,QCMOptionsState;
}
function getintelligenceQuestionOptionFromDB(intelligenceIndex,intelligenceOptions,intelligenceOptionsState){
  for (let index = 0; index < 3; index++) {
    intelligenceOptions[index] = [];
    intelligenceOptionsState[index] = [];
    let sql ='SELECT a,b,c,d,e,a1,b1,c1,d1,e1 FROM intelligence WHERE id = ? ';
    db.query(sql, intelligenceIndex[index], (err, result) => {
      if(err){
        console.log('error in conection');
      }
      //QCMOptions[index]= String(result[0].question);
      //console.log('On va afficher les options des questions');
      //console.log(result[0].c);
      //console.log('Hey on affiche les options');
        
      
    
      intelligenceOptions[index].push(String(result[0].a));
      if ((String(result[0].a) === '') && (String(result[0].a1) === '')) {
        intelligenceOptionsState[index].push('hidden =\'hidden\'');
      }else{
        intelligenceOptionsState[index].push('');
      }
      intelligenceOptions[index].push(String(result[0].b));
      if ((String(result[0].b) === '') && (String(result[0].b1) === '')) {
        intelligenceOptionsState[index].push('hidden =\'hidden\'');
      }else{
        intelligenceOptionsState[index].push('');
      }
      intelligenceOptions[index].push(String(result[0].c));
      if ((String(result[0].c) === '') && (String(result[0].c1) === '')){
        intelligenceOptionsState[index].push('hidden =\'hidden\'');
      }else{
        intelligenceOptionsState[index].push('');
      }
      intelligenceOptions[index].push(String(result[0].d));
      if ((String(result[0].d) === '') && (String(result[0].d1) === '')){
        intelligenceOptionsState[index].push('hidden =\'hidden\'');
      }else{
        intelligenceOptionsState[index].push('');
      }
      intelligenceOptions[index].push(String(result[0].e));
      if ((String(result[0].e) === '') && (String(result[0].e1) === '')) {
        intelligenceOptionsState[index].push('hidden =\'hidden\'');
      }else{
        intelligenceOptionsState[index].push('');
      }
      
      //console.log(intelligenceOptions[index]);
      //console.log(intelligenceOptionsState[index]);

    });
    
  }//console.log(QCMOptions);
  
    
    
  return intelligenceOptions,intelligenceOptionsState;
}
function getintelligenceImageOptionFromDB(intelligenceIndex,intelligenceImageOptions,intelligenceImageOptionsState){
  for (let index = 0; index < 3; index++) {
    intelligenceImageOptions[index] = [];
    intelligenceImageOptionsState[index] = [];
    let sql ='SELECT question,a1,b1,c1,d1,e1 FROM intelligence WHERE id = ? ';
    db.query(sql, intelligenceIndex[index], (err, result) => {
      if(err){
        console.log('error in conection');
      }
      //QCMOptions[index]= String(result[0].question);
      //console.log('On va afficher les options des questions');
      //console.log(result[0].c);
      //console.log('Hey on affiche les options');
        
      
    
      intelligenceImageOptions[index].push(String(result[0].question));
      if (String(result[0].question) === '') {
        intelligenceImageOptionsState[index].push('style=\'display: none;\'');
      }else{
        intelligenceImageOptionsState[index].push('');
      }
      intelligenceImageOptions[index].push(String(result[0].a1));
      if (String(result[0].a1) === '') {
        intelligenceImageOptionsState[index].push('style=\'display: none;\'');
      }else{
        intelligenceImageOptionsState[index].push('');
      }
      intelligenceImageOptions[index].push(String(result[0].b1));
      if (String(result[0].b1) === '') {
        intelligenceImageOptionsState[index].push('style=\'display: none;\'');
      }else{
        intelligenceImageOptionsState[index].push('');
      }
      intelligenceImageOptions[index].push(String(result[0].c1));
      if (String(result[0].c1) === '') {
        intelligenceImageOptionsState[index].push('style=\'display: none;\'');
      }else{
        intelligenceImageOptionsState[index].push('');
      }
      intelligenceImageOptions[index].push(String(result[0].d1));
      if (String(result[0].d1) === '') {
        intelligenceImageOptionsState[index].push('style=\'display: none;\'');
      }else{
        intelligenceImageOptionsState[index].push('');
      }
      intelligenceImageOptions[index].push(String(result[0].e1));
      if (String(result[0].e1) === '') {
        intelligenceImageOptionsState[index].push('style=\'display: none;\'');
      }else{
        intelligenceImageOptionsState[index].push('');
      }
      
      //console.log(intelligenceImageOptions[index]);
      //console.log(intelligenceImageOptionsState[index]);

    });
    
  }//console.log(QCMOptions);
  
    
    
  return intelligenceImageOptions,intelligenceImageOptionsState;
}
function sendToDatabase(response){
  if (response.context.userInput1.name != ''){
    console.log('well,well...',response.context);
    
    let sql ='insert into ?? (nom,prenom,mail,tel,residence,experience,qcm1,qcm2,qcm3,qcm4,intel1,intel2,intel3,redaction1,redaction2,indiceQCM1,indiceQCM2,indiceQCM3,indiceQCM4,indiceIntell1,indiceIntell2,indiceIntell3,indiceRedaction1,indiceRedaction2,question1,question2,question3,scoreQCM,scoreIntell,scoreTotal) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    let params=[response.context.userInput1.field,
      response.context.userInput1.name,
      response.context.userInput1.lastname,
      response.context.userInput1.mail,
      response.context.userInput1.tel,
      response.context.userInput1.residence,
      response.context.userInput1.experience,
      response.context.answers.qcm1,
      response.context.answers.qcm2,
      response.context.answers.qcm3,
      response.context.answers.qcm4,
      response.context.answers.intelligence1,
      response.context.answers.intelligence2,
      response.context.answers.intelligence3,
      response.context.answers.redaction1,
      response.context.answers.redaction2,
      response.context.QCMIndexes.qcm1,
      response.context.QCMIndexes.qcm2,
      response.context.QCMIndexes.qcm3,
      response.context.QCMIndexes.qcm4,
      response.context.intelIndexes.intel1,
      response.context.intelIndexes.intel2,
      response.context.intelIndexes.intel3,
      response.context.redactionIndexes.redaction1,
      response.context.redactionIndexes.redaction2,
      QuestionUno,
      QuestionDos,
      QuestionTres,
      parseFloat(response.context.scoreQCM),
      parseFloat(response.context.scoreIntel),
      (Number(response.context.scoreQCM) + Number(response.context.scoreIntel))/2];
    db2.query(sql,params, (err,result) => {
      if(err){
        console.log('error in conection',err);
      }else{
        let params2 = response.context.userInput1.name + '_' + response.context.userInput1.lastname;
        db3.query(CREATE_IMAGE_TABLE_QUERY,params2, (err,result2) => {
          if(err){
            console.log('error in connection creation', err);
          }else{
            response.context.Images.map((image) => {
              let params3 = [params2, image.id,image.url,image.date,image.emotion, Number(image.emotionValue)];
              db3.query(INSERT_IMAGE_QUERY, params3,(err,result3) => {
                if(err){
                  console.log('error in connection imageInsertion', err);
                }else{
                  //console.log(result3, image);
                }
              });
            });
            
          }
        });
        
      }
    });
  }
  return response;
  /*if(response.context.answers.answeredqcm == 'true' && response.context.answers.answeredintel == 'false'){

  }*/
}

module.exports = function(app) {
  app.post('/api/message', (req, res, next) => {
    //console.log('connect correctly');
    const workspace = process.env.WORKSPACE_ID || '<workspace-id>';
    if (!workspace || workspace === '<workspace-id>') {
      return res.json({
        output: {
          text: 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' +
            '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> ' +
            'documentation on how to set this variable. <br>' +
            'Once a workspace has been defined the intents may be imported from ' +
            '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> ' +
            'in order to get a working application.'
        }
      });
    }
    const payload = {
      workspace_id: workspace,
      context: req.body.context || {},
      input: req.body.input || {}
    };

    // Send the input to the conversation service
    conversation.message(payload, (error, data) => {
      if (error) {
        return next(error);
      }
      return res.json(updateMessage(payload, data));
    });
  });
 
};