// We will follow features based folder structure

import { InterviewProvider } from "./features/interview/interview.context.jsx";
import { AuthProvider } from "./features/auth/auth.context.jsx";
import { RouterProvider } from "react-router-dom";
import { router } from "./app.routes.jsx";

function App() {

  return (
    <AuthProvider>
      <InterviewProvider>
        <RouterProvider router={router} />
      </InterviewProvider>
    </AuthProvider>
  )
}

export default App
