/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const express = require('express');



/*changes Here */
var bodyParser = require('body-parser');
/*changes here */



const app = express();



/*changes here */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
/*changes here */

/*changes here */
app.post('/message/QCM1', function(req, res){
	var obj = {};
	console.log('body: ' + JSON.stringify(req.body));
	res.send(req.body);
});
/*changes here */

// Bootstrap application settings
require('./config/express')(app);
// Configure the Watson services
require('./routes/conversation')(app);
require('./routes/speech-to-text')(app);
require('./routes/text-to-speech')(app);

// error-handler settings
require('./config/error-handler')(app);

module.exports = app;
