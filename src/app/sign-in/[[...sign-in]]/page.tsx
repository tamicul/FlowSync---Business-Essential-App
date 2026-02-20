import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to FlowSync</h1>
          <p className="text-zinc-400">Sign in to manage your tasks and calendar</p>
        </div>
        
        <SignIn 
          appearance={{
            elements: {
              card: "bg-zinc-900 border border-white/10 shadow-xl",
              headerTitle: "text-white",
              headerSubtitle: "text-zinc-400",
              socialButtonsBlockButton: "bg-zinc-800 border-white/10 text-white hover:bg-zinc-700",
              formFieldLabel: "text-zinc-300",
              formFieldInput: "bg-zinc-800 border-white/10 text-white",
              footerActionLink: "text-emerald-400 hover:text-emerald-300",
              formButtonPrimary: "bg-emerald-500 hover:bg-emerald-600 text-white",
              dividerLine: "bg-zinc-800",
              dividerText: "text-zinc-500",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-emerald-400",
            }
          }}
        />
      </div>
    </div>
  );
}