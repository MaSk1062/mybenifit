import {
    type RouteConfig,
    route,
  } from "@react-router/dev/routes";
  
  export default [
    // * matches all URLs, the ? makes it optional so it will match / as well
    route("/", "./components/home/LandingPage.tsx"),
    route("/signup", "./components/signup/SignInScreen.tsx"),
    route("/dashboard", "./components/dashboard/Mydash.tsx"),
    route("/profile", "./components/profile/MyProfile.tsx"),
    route("/settings", "./components/settings/Mysettings.tsx"),
    route("/activities", "./components/myactivity/MyActivity.tsx"),
    route("/goals", "./components/goals/Goals.tsx"),
    route("/workouts", "./components/workouts/Workouts.tsx"),
    route("/user-profile", "./components/profile/Myprofile.tsx"),
    route("*?", "catchall.tsx"),
  ] satisfies RouteConfig;
  