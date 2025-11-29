import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';
import SkeletonBlock from './components/SkeletonBlock';
import useThemeStore from './store/useThemeStore';

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home/Home'));
const CourseList = React.lazy(() => import('./pages/Courses/CourseList'));
const CourseDetail = React.lazy(() => import('./pages/Courses/CourseDetail'));
const FakePayment = React.lazy(() => import('./pages/Payment/FakePayment'));
const PaymentStatus = React.lazy(() => import('./pages/Payment/PaymentStatus'));
const SearchPage = React.lazy(() => import('./pages/Search/SearchPage'));

const StudentLogin = React.lazy(() => import('./pages/Student/Login'));
const StudentRegister = React.lazy(() => import('./pages/Student/Register'));
const StudentDashboard = React.lazy(() => import('./pages/Student/Dashboard'));
const MyCourses = React.lazy(() => import('./pages/Student/MyCourses'));
const CourseContent = React.lazy(() => import('./pages/Student/CourseContent'));
const QuizStart = React.lazy(() => import('./pages/Student/QuizStart'));
const QuizTaking = React.lazy(() => import('./pages/Student/QuizTaking'));
const QuizResult = React.lazy(() => import('./pages/Student/QuizResult'));
const QuizAttempts = React.lazy(() => import('./pages/Student/QuizAttempts'));

const TeacherLogin = React.lazy(() => import('./pages/Teacher/Login'));
const TeacherRegister = React.lazy(() => import('./pages/Teacher/Register'));
const TeacherDashboard = React.lazy(() => import('./pages/Teacher/Dashboard'));
const Courses = React.lazy(() => import('./pages/Teacher/Courses'));
const AddCourse = React.lazy(() => import('./pages/Teacher/AddCourse'));
const EditCourse = React.lazy(() => import('./pages/Teacher/EditCourse'));
const Sections = React.lazy(() => import('./pages/Teacher/Sections'));
const Lessons = React.lazy(() => import('./pages/Teacher/Lessons'));
const AllLessons = React.lazy(() => import('./pages/Teacher/AllLessons'));
const Quizzes = React.lazy(() => import('./pages/Teacher/Quizzes'));
const Questions = React.lazy(() => import('./pages/Teacher/Questions'));
const Options = React.lazy(() => import('./pages/Teacher/Options'));
const ProfileSettings = React.lazy(() => import('./pages/Teacher/ProfileSettings'));
const ChangePassword = React.lazy(() => import('./pages/Teacher/ChangePassword'));
const AnalyticsDashboard = React.lazy(() => import('./pages/Teacher/AnalyticsDashboard'));
const StudentProgress = React.lazy(() => import('./pages/Teacher/StudentProgress'));
const CourseStudents = React.lazy(() => import('./pages/Teacher/CourseStudents'));
const StudentDetail = React.lazy(() => import('./pages/Teacher/StudentDetail'));
const CourseProgressAnalytics = React.lazy(() => import('./pages/Teacher/CourseProgressAnalytics'));
const MessagesPage = React.lazy(() => import('./pages/Messages/MessagesPage'));
const TeacherMessages = React.lazy(() => import('./pages/Teacher/Messages'));
const MyCertificates = React.lazy(() => import('./pages/Student/MyCertificates'));
const CertificateDetail = React.lazy(() => import('./pages/Student/CertificateDetail'));
const StudentNotifications = React.lazy(() => import('./pages/Student/Notifications'));

function App() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route
            index
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="courses"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <CourseList />
              </Suspense>
            }
          />
          <Route
            path="course/:id"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <CourseDetail />
              </Suspense>
            }
          />
          <Route
            path="search"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <SearchPage />
              </Suspense>
            }
          />
          <Route
            path="payment/fake/:orderId"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <FakePayment />
              </Suspense>
            }
          />
          <Route
            path="payment/status/:orderId"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <PaymentStatus />
              </Suspense>
            }
          />
        </Route>

        {/* Student routes */}
        <Route element={<PublicLayout />}>
          <Route
            path="/student/login"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <StudentLogin />
              </Suspense>
            }
          />
          <Route
            path="/student/register"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <StudentRegister />
              </Suspense>
            }
          />
        </Route>

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <StudentDashboard />
              </Suspense>
            }
          />
          <Route
            path="my-courses"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <MyCourses />
              </Suspense>
            }
          />
          <Route
            path="course/:courseId/content"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <CourseContent />
              </Suspense>
            }
          />
          <Route
            path="quiz/:quizId"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <QuizStart />
              </Suspense>
            }
          />
          <Route
            path="quiz/:quizId/take"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <QuizTaking />
              </Suspense>
            }
          />
          <Route
            path="quiz/:quizId/result"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <QuizResult />
              </Suspense>
            }
          />
          <Route
            path="quiz-attempts"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <QuizAttempts />
              </Suspense>
            }
          />
          <Route
            path="certificates"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <MyCertificates />
              </Suspense>
            }
          />
          <Route
            path="certificates/:id"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <CertificateDetail />
              </Suspense>
            }
          />
          <Route
            path="messages"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <MessagesPage />
              </Suspense>
            }
          />
          <Route
            path="notifications"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <StudentNotifications />
              </Suspense>
            }
          />
        </Route>

        {/* Teacher routes */}
        <Route element={<PublicLayout />}>
          <Route
            path="/teacher/login"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <TeacherLogin />
              </Suspense>
            }
          />
          <Route
            path="/teacher/register"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <TeacherRegister />
              </Suspense>
            }
          />
        </Route>

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <TeacherDashboard />
              </Suspense>
            }
          />
          <Route
            path="analytics"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <AnalyticsDashboard />
              </Suspense>
            }
          />
          <Route
            path="courses"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <Courses />
              </Suspense>
            }
          />
          <Route
            path="courses/add"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <AddCourse />
              </Suspense>
            }
          />
          <Route
            path="courses/:id/edit"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <EditCourse />
              </Suspense>
            }
          />
          <Route
            path="courses/:id/sections"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <Sections />
              </Suspense>
            }
          />
          <Route
            path="courses/:id/quizzes"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <Quizzes />
              </Suspense>
            }
          />
          <Route
            path="student-progress"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <StudentProgress />
              </Suspense>
            }
          />
          <Route
            path="course/:id/students"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <CourseStudents />
              </Suspense>
            }
          />
          <Route
            path="course/:id/student/:studentId"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <StudentDetail />
              </Suspense>
            }
          />
          <Route
            path="course/:id/analytics"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <CourseProgressAnalytics />
              </Suspense>
            }
          />
          <Route
            path="lessons"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <AllLessons />
              </Suspense>
            }
          />
          <Route
            path="sections/:courseId"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <Sections />
              </Suspense>
            }
          />
          <Route
            path="lessons/:sectionId"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <Lessons />
              </Suspense>
            }
          />
          <Route
            path="quizzes/:courseId"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <Quizzes />
              </Suspense>
            }
          />
          <Route
            path="questions/:quizId"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <Questions />
              </Suspense>
            }
          />
          <Route
            path="options/:questionId"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <Options />
              </Suspense>
            }
          />
          <Route
            path="profile"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <ProfileSettings />
              </Suspense>
            }
          />
          <Route
            path="change-password"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <ChangePassword />
              </Suspense>
            }
          />
          <Route
            path="messages"
            element={
              <Suspense fallback={<SkeletonBlock />}>
                <TeacherMessages />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
