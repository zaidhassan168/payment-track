import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center py-24 bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">Create an Account</h2>
        <SignUp signInFallbackRedirectUrl={"/dashboard"}
          appearance={{
            elements: {
              card: "shadow-none",
              formButtonPrimary: "bg-blue-500 hover:bg-blue-600",
            },
          }}
        />
      </div>
    </div>
  );
}
