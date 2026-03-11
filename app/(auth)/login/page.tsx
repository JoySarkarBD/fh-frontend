"use client";

import { useLoginMutation } from "@/actions/hooks/auth.hooks";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { LuEye, LuEyeOff, LuLock } from "react-icons/lu";
import { MdOutlineEmail } from "react-icons/md";
import bgImage from "../../../public/signup.png";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLoginMutation({
    onSuccess: (data) => {
      const authData = data.data;

      if (!authData?.accessToken) {
        return;
      }

      const normalizedRole =
        String(authData.user?.role ?? "user").toLowerCase() === "admin"
          ? "admin"
          : "user";

      if (normalizedRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard/profile");
      }
    },
    onError: (error) => {
      console.log(error);
      localStorage.setItem("isLoggedIn", "false");
      localStorage.removeItem("userRole");
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const showPasswordChangedMsg = searchParams.get("passwordChanged") === "1";

  return (
    <div className='min-h-screen w-full flex flex-col items-center justify-center relative'>
      {/* Background image */}
      <div className='absolute inset-0 z-10'>
        <Image
          src={bgImage}
          alt='Login Background'
          fill
          className='object-cover object-center opacity-100'
          priority
        />
      </div>

      {/* Logo */}
      <div className='absolute top-6 left-6 flex items-center gap-2'>
        <Image
          src='/logo.png'
          alt='Farrior Homes'
          width={200}
          height={80}
          priority
          className='h-15 w-auto object-contain z-10'
        />
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className='
        bg-white rounded-lg w-full max-w-md mx-4 px-8 py-8
        border border-[#D1CEC6]
        z-10 relative        
      '>
        {showPasswordChangedMsg && (
          <div className='mb-4 text-green-700 bg-green-100 border border-green-300 rounded px-4 py-2 text-center'>
            Password changed. Please login again.
          </div>
        )}
        {/* Email Address */}
        <div className='mb-4'>
          <label className='block text-sm font-medium text-[#1B1B1A] mb-2'>
            Email Address
          </label>
          <div className='flex items-center border border-[#D1CEC6] rounded-md px-3 py-2.5 gap-2 focus-within:border-green-500 transition-colors'>
            <MdOutlineEmail className='w-4 h-4 text-[#2C2C2A] shrink-0' />
            <input
              type='email'
              placeholder='you@example.com'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete='email'
              disabled={loginMutation.isPending}
              className='flex-1 text-sm text-gray-500 placeholder-gray-400 outline-none bg-transparent disabled:opacity-50'
            />
          </div>
        </div>

        {/* Password */}
        <div className='mb-4'>
          <label className='block text-sm font-medium text-[#1B1B1A] mb-2'>
            Password
          </label>
          <div className='flex items-center border border-[#D1CEC6] rounded-md px-3 py-2.5 gap-2 focus-within:border-green-500 transition-colors'>
            <LuLock className='w-4 h-4 text-[#2C2C2A] shrink-0' />
            <input
              type={showPassword ? "text" : "password"}
              placeholder='Enter your password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete='current-password'
              disabled={loginMutation.isPending}
              className='flex-1 text-sm text-gray-500 placeholder-gray-400 outline-none bg-transparent disabled:opacity-50'
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='text-gray-400 hover:text-gray-600'
              disabled={loginMutation.isPending}>
              {showPassword ? (
                <LuEyeOff className='w-4 h-4 text-[#2C2C2A]' />
              ) : (
                <LuEye className='w-4 h-4 text-[#2C2C2A]' />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {loginMutation.isError && (
          <p className='mb-4 text-sm text-red-600'>
            {loginMutation.error?.message || "Login failed. Please try again."}
          </p>
        )}

        {/* Terms */}
        <div className='flex justify-between items-center gap-2 mb-9'>
          <div className='flex items-center gap-2 '>
            <input
              type='checkbox'
              id='terms'
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={loginMutation.isPending}
              className='w-4 h-4 rounded border-gray-300 accent-green-600'
            />
            <label htmlFor='terms' className='text-sm text-gray-600'>
              Remember me
            </label>
          </div>
          <div>
            <p className='text-sm text-green-600 hover:underline cursor-pointer'>
              Forgot password?
            </p>
          </div>
        </div>

        {/* Log In Button */}
        <button
          type='submit'
          disabled={loginMutation.isPending}
          className='w-full px-6 py-2.5 bg-[#619B7F] text-xl text-white rounded-lg hover:bg-[#3a6a50] transition-colors duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70'>
          {loginMutation.isPending ? "Logging in..." : "Log In"}
        </button>

        {/* Divider */}
        <div className='flex items-center gap-3 my-5'>
          <div className='flex-1 h-px bg-[#D1CEC6]' />
          <span className='text-sm text-[#619B7F]'>Or continue with</span>
          <div className='flex-1 h-px bg-[#D1CEC6]' />
        </div>

        {/* Social Buttons */}
        <div className='flex justify-center gap-5 mb-6'>
          {/* Google */}
          <button
            type='button'
            className='w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer'
            disabled={loginMutation.isPending}
            onClick={() => {
              const apiUrl =
                process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api";
              window.location.href = `${apiUrl}/auth/google`;
            }}>
            <svg className='w-7 h-7' viewBox='0 0 24 24'>
              <path
                fill='#4285F4'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='#34A853'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='#FBBC05'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              />
              <path
                fill='#EA4335'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
          </button>
        </div>

        {/* Sign Up Link */}
        <p className='text-center text-sm text-gray-500'>
          Don&apos;t have an account?{" "}
          <Link
            href='/signup'
            className='text-green-600 text-[20px] hover:underline'>
            Sign up
          </Link>
        </p>
      </form>

      {/* Back to home */}
      <div className='mt-6 flex items-center gap-2 text-gray-600 text-sm cursor-pointer hover:text-gray-800 transition-colors z-10'>
        <ArrowLeft className='w-4 h-4' />
        <Link href='/' className='hover:underline'>
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center text-xl'>
          Loading...
        </div>
      }>
      <LoginPageContent />
    </Suspense>
  );
}
