import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LeraLogo } from '@/components/ui/lera-logo';

export function LoginPage() {
  const { t } = useTranslation();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: t('auth.slides.slide1Title', 'Finally, all your work in one place.'),
      subtitle: t('auth.slides.slide1Subtitle', 'Streamline your legal directory submissions'),
    },
    {
      title: t('auth.slides.slide2Title', 'AI-powered synthesis for better rankings.'),
      subtitle: t('auth.slides.slide2Subtitle', 'Let AI help you create compelling submissions'),
    },
    {
      title: t('auth.slides.slide3Title', 'Save hours on every submission.'),
      subtitle: t('auth.slides.slide3Subtitle', 'Automate repetitive tasks and focus on what matters'),
    },
  ];

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-amber-100 via-rose-100 to-purple-100">
        <Loader2 className="h-8 w-8 animate-spin text-lera-800" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('auth.loginFailed'),
        description: error instanceof Error ? error.message : t('auth.invalidCredentials'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-100 via-rose-100 to-purple-200 p-4">
      {/* Main Container */}
      <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Left Side - Login Form */}
        <div className="flex w-full flex-col justify-center px-12 py-12 lg:w-1/2">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2">
            <LeraLogo className="h-8 w-8" />
            <span className="text-lg font-semibold text-gray-800">Lera AI</span>
          </div>

          {/* Heading */}
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {t('auth.helloAgain', 'Hello Again!')}
          </h1>
          <p className="mb-8 text-gray-500">
            {t('auth.trialMessage', "Let's get started with your 30 days trial")}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-gray-200 bg-gray-50 px-4 text-gray-900 placeholder:text-gray-400 focus:border-lera-500 focus:bg-white focus:ring-lera-500"
              />
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-gray-200 bg-gray-50 px-4 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-lera-500 focus:bg-white focus:ring-lera-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Recovery Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-lera-800"
              >
                {t('auth.recoveryPassword', 'Recovery Password')}
              </button>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-lera-800 text-white hover:bg-lera-900"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {t('auth.signingIn')}
                </>
              ) : (
                t('auth.signIn')
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-sm text-gray-400">{t('auth.orContinueWith', 'Or continue with')}</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Social Login Buttons */}
          <div className="flex justify-center gap-4">
            {/* Google */}
            <button className="flex h-12 w-16 items-center justify-center rounded-xl border border-gray-200 bg-white transition-colors hover:bg-gray-50">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>

            {/* Apple */}
            <button className="flex h-12 w-16 items-center justify-center rounded-xl border border-gray-200 bg-white transition-colors hover:bg-gray-50">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            </button>

            {/* Facebook */}
            <button className="flex h-12 w-16 items-center justify-center rounded-xl border border-gray-200 bg-white transition-colors hover:bg-gray-50">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 text-center text-sm text-gray-400">
            <p>{t('auth.demoCredentials')}</p>
            <p className="font-mono text-xs">admin@lera.ai / password123</p>
          </div>
        </div>

        {/* Right Side - Illustration Panel */}
        <div className="relative hidden w-1/2 overflow-hidden rounded-2xl lg:block m-3">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/login-hero.jpg"
              alt="Legal AI illustration"
              className="h-full w-full object-cover"
            />
            {/* Subtle gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#4a4a6a]/80 via-transparent to-transparent" />
          </div>

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            {/* Slide content */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                {slides[currentSlide].title}
              </h2>
              <p className="mt-2 text-white/80">
                {slides[currentSlide].subtitle}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={prevSlide}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Dots indicator */}
              <div className="ml-4 flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
