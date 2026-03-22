import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import PatientLayout from "./layouts/PatientLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminPatientDetail from "./pages/admin/AdminPatientDetail";
import AdminDiets from "./pages/admin/AdminDiets";
import AdminFoods from "./pages/admin/AdminFoods";
import AdminExercises from "./pages/admin/AdminExercises";
import AdminFormEditor from "./pages/admin/AdminFormEditor";
import AdminTechniques from "./pages/admin/AdminTechniques";
import AdminForms from "./pages/admin/AdminForms";
import AdminMaterials from "./pages/admin/AdminMaterials";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientDiet from "./pages/patient/PatientDiet";
import PatientWorkout from "./pages/patient/PatientWorkout";
import PatientEvolution from "./pages/patient/PatientEvolution";
import PatientExams from "./pages/patient/PatientExams";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import FormFill from "./pages/FormFill";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Public form fill route */}
          <Route path="/form/:token" element={<FormFill />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="patients/:id" element={<AdminPatientDetail />} />
            <Route path="diets" element={<AdminDiets />} />
            <Route path="workouts" element={<AdminPatients />} />
            <Route path="exams" element={<AdminPatients />} />
            <Route path="prescriptions" element={<AdminPatients />} />
            <Route path="foods" element={<AdminFoods />} />
            <Route path="exercises" element={<AdminExercises />} />
            <Route path="techniques" element={<AdminTechniques />} />
            <Route path="forms" element={<AdminForms />} />
            <Route path="forms/new" element={<AdminFormEditor />} />
            <Route path="forms/:id/edit" element={<AdminFormEditor />} />
            <Route path="materials" element={<AdminMaterials />} />
          </Route>

          {/* Patient Routes */}
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<PatientDashboard />} />
            <Route path="diet" element={<PatientDiet />} />
            <Route path="workout" element={<PatientWorkout />} />
            <Route path="evolution" element={<PatientEvolution />} />
            <Route path="exams" element={<PatientExams />} />
            <Route path="prescriptions" element={<PatientPrescriptions />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
