"use client";

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../views/Home/Home';
import { Settings } from '../views/Settings/Settings';
import { ManageMission } from '../views/Settings/ManageMission';
import { EditMission } from '../views/Settings/EditMission';
import { MissionDetail } from '../views/Settings/MissionDetail';
import { Create } from '../views/Create/Create';
import { Timeline } from '../views/Timeline/Timeline';
import { Todo } from '../views/Todo/Todo';
import { MyAccount } from '../views/Settings/MyAccount';
import { EditFullName } from '../views/Settings/EditFullName';
import { EditUsername } from '../views/Settings/EditUsername';
import { ChangePassword } from '../views/Settings/ChangePassword';
import { Timezone } from '../views/Settings/Timezone';
import { Login } from '../views/auth/Login';
import { SignUp } from '../views/auth/SignUp';
import { EmailVerification } from '../views/auth/EmailVerification';
import { ProtectedRoute } from '../routes/ProtectedRoute';

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/missions" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/missions" element={<Home />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/create" element={<Create />} />
          <Route path="/settings">
            <Route index element={<Settings />} />
            <Route path="manage" element={<ManageMission />} />
            <Route path="manage/:missionId" element={<MissionDetail />} />
            <Route path="manage/edit" element={<EditMission />} />
            <Route path="profile" element={<MyAccount />} />
            <Route path="timezone" element={<Timezone />} />
            <Route path="profile/edit-fullname" element={<EditFullName />} />
            <Route path="profile/edit-username" element={<EditUsername />} />
            <Route
              path="profile/change-password"
              element={<ChangePassword />}
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/missions" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
