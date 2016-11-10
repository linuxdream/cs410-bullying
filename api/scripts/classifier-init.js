/**
 * This file initializes the classification file.
 */
let Natural = require('natural');
let LineByLineReader = require('line-by-line');
let reader = new LineByLineReader('data/emotion-index.txt');

/**
 * tmpLex will hold an object of all negative words and their emotive meaning.
 * This will allow us to more easily process the emotion lexicon when comparing
 * words.
 */
let tmpLex = {}

//This will live in a script that we run once to generate our training file classifier.
let Classifier = new Natural.BayesClassifier();


reader.on('line', function(line){
    let lineParts = line.split('\t');
    
    // classifier.addDocument('I hate you', 'hate');
});


// classifier.train();
// classifier.save('classifier.json', function(err, classifier){
//     if(err) {
//         console.log('Error:', err);
//         process.exit();
//     }
//
//
// });
//End of the one-time script
