import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ========== SESSION ==========
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// ========== PASSPORT INIT ==========
app.use(passport.initialize());
app.use(passport.session());

// ========== SERIALIZE / DESERIALIZE ==========
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

// ========== GOOGLE STRATEGY ==========
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRETE,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Here you can store user in DB if needed
      return done(null, profile);
    }
  )
);

// ========== ROUTES ==========

// Home
app.get("/", (req, res) => {
  res.send(`<h1>Hello! <a href='/auth/google'>Login with Google</a></h1>`);
});

// Start Google Auth
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback URL
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login-fail",
    successRedirect: "/profile",
  })
);

// Profile Route
app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");

  res.send(`
    <h1>Welcome ${req.user.displayName}</h1>
    <p>Email: ${req.user.emails[0].value}</p>
    <a href="/logout">Logout</a>
  `);
});

// Logout
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// Failure
app.get("/login-fail", (req, res) => {
  res.send("Login Failed");
});

// Start Server
app.listen(3000, () => {
  console.log("Server started at http://localhost:3000");
});
