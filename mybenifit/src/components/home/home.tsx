import { Routes, Route } from "react-router";
import Dashboard from "../dashboard/Mydash";
import Nav from "../nav/nav";
import SettingsPage from "../settings/Mysettings";
import LandingPage from "./LandingPage";
import {LoginForm}  from "../signup/SignInScreen";
import MyActivity from "../myactivity/MyActivity";
import Goals from "../goals/Goals";
import Workouts from "../workouts/Workouts";
import ProfilePage from "../profile/MyProfile";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
            <Nav />
            <div className="container mx-auto px-4 py-8">
                <Routes>
                    <Route path="/" element={<LandingPage/>}/>
                    <Route path="/signup" element={<LoginForm/>}/>
                    <Route path="/dashboard" element={<Dashboard/>}/>
                    <Route path="/settings" element={<SettingsPage/>}/>
                    <Route path="/activities" element={<MyActivity/>}/>
                    <Route path="/goals" element={<Goals/>}/>
                    <Route path="/workouts" element={<Workouts/>}/>
                    <Route path="/user-profile" element={<ProfilePage/>}/>
                </Routes>
            </div>
        </div>
    )
}