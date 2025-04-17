"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/common/button";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "An authentication error occurred";

  // Map error codes to user-friendly messages
  switch (error) {
    case "CredentialsSignin":
      errorMessage = "Invalid email or password. Please try again.";
      break;
    case "SessionRequired":
      errorMessage = "You need to be signed in to access this page.";
      break;
    case "OAuthCallback":
      errorMessage = "There was a problem with the OAuth sign-in process.";
      break;
    case "OAuthCreateAccount":
      errorMessage = "Could not create an account using the OAuth provider.";
      break;
    case "Verification":
      errorMessage = "The verification link may have expired or been used already.";
      break;
    case "AccessDenied":
      errorMessage = "You don't have permission to access this resource.";
      break;
    case "Default":
    default:
      errorMessage = "An unexpected authentication error occurred.";
      break;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <div className="space-y-6 max-w-md">
        <h1 className="text-4xl font-bold">Authentication Error</h1>
        <p className="text-muted-foreground">
          {errorMessage}
        </p>
        <Button asChild>
          <Link href="/login">Return to login</Link>
        </Button>
      </div>
    </div>
  );
}
