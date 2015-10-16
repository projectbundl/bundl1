/**
 * Configure Passport Strategy
 */

module.exports = function(passportInstance) {
	// Passport session setup.
	//  To support persistent login sessions, Passport needs to be able to
	//  serialize users into and deserialize users out of the session.  Typically,
	//  this will be as simple as storing the user ID when serializing, and finding
	//  the user by ID when deserializing.  However, since this example does not
	//  have a database of user records, the complete Facebook profile is serialized
	//  and deserialized.
	passportInstance.serializeUser(function(user, done) {
	 done(null, user);
	});
	
	passportInstance.deserializeUser(function(obj, done) {
	 done(null, obj);
	});
	
	// Setup Facebook Strategy
	passport.use(new FacebookStrategy({
	  passReqToCallBack: true,
	  clientID: process.env.FACEBOOK_APP_ID,
	  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
	  callbackURL: "https://bundl.herokuapp.com/auth/facebook/callback",
	  scope: ['user_events', 'publish_pages', 'manage_pages', 'user_photos', 'publish_stream','read_stream', 'publish_actions', 'public_profile'],
	  passReqToCallback: true},
	  function(req, accessToken, refreshToken, profile, done) {
	    // asynchronous verification, for effect...
	    process.nextTick(function () {
	        
	      req.session.facebook = {_oauth2: {'accessToken': accessToken}};
	      req.session.facebook._oauth2.name = profile.displayName;
	      req.session.facebook._oauth2.profileID = profile.id;
	      return done(null, profile);
	    });
	  }
	));
};
