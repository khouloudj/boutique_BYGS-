const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/User");
const Admin = require("../models/Admin");

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SecretOrKey,
};

passport.use(
  new Strategy(options, async (payload, done) => {
    try {
      // le token appartient soit à un client, soit à l'admin (vendeur)
      const account =
        (await User.findById(payload._id).select("-password")) ||
        (await Admin.findById(payload._id).select("-password"));

      return account ? done(null, account) : done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// usage : router.get("/...", isAuth(), handler)
module.exports = () => passport.authenticate("jwt", { session: false });
