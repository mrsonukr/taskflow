import { redirect } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

export default function Home() {
  // In a real application, we would check if the user is authenticated
  // If authenticated, redirect to dashboard
  // For demo purposes, we'll just show the login form

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}