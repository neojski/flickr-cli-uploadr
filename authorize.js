var readline = require('readline');
var OAuth = require('oauth').OAuth;

var app_key = ''; // YOUR APP KEY
var app_secret = ''; // YOU APP SECRET

var oa = new OAuth("http://www.flickr.com/services/oauth/request_token", "http://www.flickr.com/services/oauth/access_token", app_key, app_secret, "1.0A", "oob", "HMAC-SHA1");

oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
  console.log("http://www.flickr.com/services/oauth/authorize?oauth_token=" + oauth_token);

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('What\'s the oauth_token_secret?', function(oauth_verifier){
    //console.log('x'+oauth_token_secret.replace(/^\s+|\s+$/g, '')+'y');
    oa.getOAuthAccessToken(oauth_token, oauth_token_secret, oauth_verifier, function(error, oauth_access_token, oauth_access_token_secret, results2) {
      console.log('error', error);
      console.log('access_token: ', oauth_access_token);
      console.log('access_token_secret: ', oauth_access_token_secret);
    });
  });
});
