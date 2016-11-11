/**
 * This file initializes the classification file.
 */

//Bring in libraries
let Natural = require('natural');
let parseXML = require('xml2js').parseString;
let _ = require('lodash');
let fs = require('fs');

//Init our classifier for later use.
let Classifier = new Natural.BayesClassifier();

//Use the PorterStemmer and set to attach mode.
Natural.PorterStemmer.attach();

//Data buffer
let data = '';

//Create a read stream from the training data XML file. It's big...11MB
let rs = fs.createReadStream('data/XMLMergedFile.xml', 'utf8');

//Concat it all together
rs.on('data', function(chunk){
    data += chunk;
});

//When we h ave all the contents.
rs.on('end', function(){
    //Init the parser on the XML contents.
    parseXML(data, function(err, result){
        //Loop through the FORMSPRINGID array.
        result.dataset.FORMSPRINGID.forEach(function(formspring){
            formspring.POST.forEach(function(post){
                //Set a bullying flag so we know when a post contains bullying
                let bullyingFound = false;

                //Loop through the LABELDATA as that contains the analysis
                post.LABELDATA.forEach(function(answer){
                    //Are any of them marked as containing bullying text?
                    if(answer.SEVERITY[0] > 0){
                        //If so, then flag it
                        bullyingFound = true;
                    }

                });

                //If this post has bullying, we tokenize and stem the text then mark it as a bullying category and add it to the classifier.
                if(bullyingFound){
                    Classifier.addDocument(Natural.PorterStemmer.tokenizeAndStem(post.TEXT[0].substring(3)), 'bullying');
                }
            });
        });

        //Start the classifier training...
        Classifier.train();

        //Save it so we can use it when requests come in from the FE.
        Classifier.save('data/classifier.json', function(err, classifier){
            if(err){
                process.exit(err);
            }else{
                process.exit('Classifier successfully ran and saved the output to classifier.json');
            }
        });
    });
});
//End of the one-time script
