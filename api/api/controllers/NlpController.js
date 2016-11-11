/**
 * NlpController
 *
 * @description :: Server-side logic for managing nlps
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
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
                totalBullying: 0
            };

            //Temp token holder
            let tmpToken = [];

            Natural.BayesClassifier.load(process.cwd() + '/scripts/data/classifier.json', null, (err, classifier)=>{
                if(err){
                    return res.serverError(err);
                }

                let tokenizedComment = [];

                //Loop through the comments
                comments.forEach((comment) => {
                    tokenizedComment = Natural.PorterStemmer.tokenizeAndStem(comment);

                    if(classifier.classify(tokenizedComment) === 'bullying'){
                        //Add to bullying count
                        commentResults.totalBullying++;
                    }

                    //Increment counter
                    commentResults.total++;
                });

                return res.jsonx(commentResults);
            });
        }else{
            return res.serverError('No comments passed.');
        }
    }
};
