"use strict";
/**
 * NlpController
 *
 * @description :: Server-side logic for managing nlps
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
let async = require('async');
let Natural = require('natural');

module.exports = {
	assess: function(req, res) {
        /**
         * We are expecting an array of documents. Make sure they have passed that
         */
        let comments = _.get(req, 'body.comments', false);

        //Make sure they passed actual data
        if(comments && _.isArray(comments) && comments.length) {
            //Prep the stemmer
            Natural.PorterStemmer.attach();

            //Setup the results
            let commentResults = {
                total: 0,
                totalBullying: 0,
                results: []
            };

            //Temp token holder
            let tmpToken = [];

            Natural.BayesClassifier.load(process.cwd() + '/scripts/data/classifier.json', null, (err, classifier)=>{
                if(err){
                    return res.serverError(err);
                }

                let tokenizedComment = [];

                //Loop through the comments
                async.each(comments, function(comment, callback) {
                    tokenizedComment = Natural.PorterStemmer.tokenizeAndStem(comment);

                    let res = false;
                    if(classifier.classify(tokenizedComment) === 'bullying') {
                        res = true;
                        //Add to bullying count
                        commentResults.totalBullying++;
                    }

                    //Increment counter
                    commentResults.total++;

                    let classifications = classifier.getClassifications(tokenizedComment);
                    commentResults.results.push({
                        comment: comment,
                        isBully: res,
                        classifications: classifications
                    });
                    callback();
                }, function (err) {
                    if (err) {
                        return res.serverError('Error processing.');
                    }

                    return res.jsonx(commentResults);
                });
            });
        }else{
            return res.serverError('No comments passed.');
        }
    }
};
