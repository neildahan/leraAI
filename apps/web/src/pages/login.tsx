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
          {/* Gradient Background with Illustration */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-300 via-purple-400 to-indigo-500">
            {/* Abstract Landscape SVG */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 500 600"
              preserveAspectRatio="xMidYMid slice"
              fill="none"
            >
              {/* Sky gradient overlay */}
              <defs>
                <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
                <linearGradient id="sunGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="100%" stopColor="#fcd34d" />
                </linearGradient>
                <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e1b4b" />
                  <stop offset="100%" stopColor="#312e81" />
                </linearGradient>
                <linearGradient id="hillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4c1d95" />
                  <stop offset="100%" stopColor="#5b21b6" />
                </linearGradient>
                <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>

              {/* Sun/Moon */}
              <circle cx="380" cy="200" r="50" fill="url(#sunGradient)" opacity="0.9" />

              {/* Far mountains */}
              <path
                d="M0 350 Q100 280 200 320 Q300 360 400 300 Q450 270 500 290 L500 450 L0 450 Z"
                fill="url(#mountainGradient)"
                opacity="0.6"
              />

              {/* Mid mountains */}
              <path
                d="M0 380 Q80 330 150 360 Q250 400 350 350 Q420 310 500 340 L500 500 L0 500 Z"
                fill="url(#hillGradient)"
                opacity="0.8"
              />

              {/* Water/Lake */}
              <path
                d="M0 420 Q150 400 250 420 Q350 440 500 410 L500 600 L0 600 Z"
                fill="url(#waterGradient)"
                opacity="0.7"
              />

              {/* Trees silhouettes */}
              <g fill="#1e1b4b" opacity="0.9">
                {/* Tree 1 */}
                <path d="M50 450 L50 480 L55 480 L55 450 L70 470 L60 470 L75 490 L30 490 L45 470 L35 470 Z" />
                {/* Tree 2 */}
                <path d="M90 440 L90 475 L95 475 L95 440 L115 465 L100 465 L120 490 L70 490 L90 465 L75 465 Z" />
                {/* Tree 3 */}
                <path d="M420 460 L420 490 L425 490 L425 460 L440 475 L430 475 L445 490 L405 490 L420 475 L410 475 Z" />
                {/* Tree 4 */}
                <path d="M460 450 L460 485 L465 485 L465 450 L485 470 L470 470 L490 490 L440 490 L460 470 L445 470 Z" />
              </g>

              {/* Decorative plants */}
              <g fill="#312e81" opacity="0.7">
                <path d="M470 350 Q480 320 485 350 Q490 320 500 350 L500 360 L470 360 Z" />
                <path d="M450 370 Q455 350 460 370 Q465 345 475 370 L475 380 L450 380 Z" />
              </g>

              {/* Small birds */}
              <g fill="#1e1b4b" opacity="0.5">
                <path d="M100 200 Q105 195 110 200 Q105 198 100 200" />
                <path d="M130 180 Q135 175 140 180 Q135 178 130 180" />
                <path d="M160 210 Q165 205 170 210 Q165 208 160 210" />
              </g>
            </svg>
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
