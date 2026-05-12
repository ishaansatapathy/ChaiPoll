import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const passportConfig = (passport) => {
  // Local Strategy
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL:
            process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
              // Update avatar if available from Google
              if (profile.photos && profile.photos[0]) {
                user.avatar = profile.photos[0].value;
                await user.save();
              }
              return done(null, user);
            }

            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              avatar:
                profile.photos && profile.photos[0]
                  ? profile.photos[0].value
                  : "default-avatar.png",
              authProvider: "google",
              providerId: profile.id,
            });

            return done(null, user);
          } catch (err) {
            console.error("Error in Google Strategy callback:", err);
            return done(err);
          }
        }
      )
    );
  } else {
    console.error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing in .env");
  }

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

export default passportConfig;
