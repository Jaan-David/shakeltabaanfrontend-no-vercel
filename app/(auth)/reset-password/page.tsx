import ForgetPasswordPage from "@/_pages/AuthPages/ForgetPasswordPage/ForgetPasswordPage";
import Background from "@/components/UI/Background/Background";

export default function ResetPasswordPage() {
  return (
    <div>
      <div className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
        <Background />
        <ForgetPasswordPage />
      </div>
    </div>
  );
}
