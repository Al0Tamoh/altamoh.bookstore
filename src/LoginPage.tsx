import React from 'react';
import { ArrowLeft, Mail, Shield, CheckCircle, Loader2, Star, Bell, Heart, Gift, Users, Zap, User, Lock, Eye, EyeOff, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';
import { supabase } from './lib/supabase';
import { AuthMode, SignUpData, SignInData } from './types/auth';

interface LoginPageProps {
  onBack: () => void;
  onSuccess?: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack, onSuccess }) => {
  const [mode, setMode] = React.useState<AuthMode>('signin');
  const [step, setStep] = React.useState<'form' | 'verify' | 'forgot-password' | 'reset-password'>('form');
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: ''
  });
  const [verificationCode, setVerificationCode] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [forgotPasswordCooldown, setForgotPasswordCooldown] = React.useState(0);

  React.useEffect(() => {
    setIsLoaded(true);
    testSupabaseConnection();
  }, []);

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);
  React.useEffect(() => {
    if (forgotPasswordCooldown > 0) {
      const timer = setTimeout(() => {
        setForgotPasswordCooldown(forgotPasswordCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [forgotPasswordCooldown]);

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Supabase connection test failed:', error);
      } else {
        console.log('Supabase connection successful');
      }
    } catch (err) {
      console.error('Failed to connect to Supabase:', err);
      setError('لا يمكن الاتصال بالخادم. تحقق من إعدادات Supabase.');
    }
  };

  const benefits = [
    {
      icon: Gift,
      title: 'عروض خاصة حصرية',
      description: 'احصل على خصومات وعروض خاصة للأعضاء فقط'
    },
    {
      icon: Bell,
      title: 'كن في قلب الحدث',
      description: 'سنرسل إليك كل العروض والفعاليات المتاحة فور إطلاقها'
    },
    {
      icon: Star,
      title: 'توصيات شخصية',
      description: 'احصل على اقتراحات كتب مخصصة حسب اهتماماتك'
    },
    {
      icon: Heart,
      title: 'قائمة المفضلة',
      description: 'احفظ الكتب المفضلة لديك وارجع إليها في أي وقت'
    },
    {
      icon: Users,
      title: 'مجتمع القراء',
      description: 'انضم لمجتمع من محبي القراءة وشارك آراءك'
    },
    {
      icon: Zap,
      title: 'وصول أسرع',
      description: 'تسوق أسرع مع معلومات حسابك المحفوظة'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 6) {
      setVerificationCode(value);
      setError('');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return false;
    }

    if (mode === 'signup' && !formData.name.trim()) {
      setError('يرجى إدخال الاسم');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return false;
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }

    return true;
  };

  const handleSignUp = async (data: SignUpData) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
        }
      }
    });

    if (error) throw error;
    return authData;
  };

  const handleSignIn = async (data: SignInData) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    return authData;
  };

  const handleForgotPassword = async () => {
    if (forgotPasswordCooldown > 0) {
      setError(`يرجى الانتظار ${forgotPasswordCooldown} ثانية قبل المحاولة مرة أخرى`);
      return;
    }
  
    if (!formData.email) {
      setError('يرجى إدخال البريد الإلكتروني أولاً');
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
  
    setIsLoading(true);
    setError('');
  
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
  
      if (error) throw error;
  
      setSuccessMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      setStep('forgot-password');
      setForgotPasswordCooldown(120);
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      if (err.message.includes('rate limit') || err.message.includes('429')) {
        setError('تم تجاوز الحد المسموح من المحاولات. يرجى الانتظار بضع دقائق قبل المحاولة مرة أخرى');
        setForgotPasswordCooldown(300);
      } else {
        setError('حدث خطأ في إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email
      });
      
      if (error) throw error;
      
      setSuccessMessage('تم إعادة إرسال الكود بنجاح');
      setResendCooldown(60);
    } catch (err: any) {
      setError('فشل في إعادة إرسال الكود');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('يرجى إدخال كود التحقق كاملاً');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: verificationCode,
        type: 'signup'
      });

      if (error) throw error;

      if (data?.user) {
        setSuccessMessage('تم تأكيد الحساب بنجاح!');
        setTimeout(() => onSuccess?.(data.user), 1500);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      if (err.message.includes('Invalid token')) {
        setError('كود التحقق غير صحيح');
      } else if (err.message.includes('Token has expired')) {
        setError('انتهت صلاحية كود التحقق. يرجى طلب كود جديد');
      } else {
        setError('حدث خطأ في التحقق. يرجى المحاولة مرة أخرى');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'verify') {
      await handleVerifyCode();
      return;
    }
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (mode === 'signup') {
        const result = await handleSignUp(formData as SignUpData);
        if (result?.user) {
          setSuccessMessage('تم إرسال كود التحقق إلى بريدك الإلكتروني');
          setStep('verify');
          setResendCooldown(60);
        }
      } else {
        const result = await handleSignIn(formData as SignInData);
        if (result?.user) {
          setSuccessMessage('تم تسجيل الدخول بنجاح!');
          setTimeout(() => onSuccess?.(result.user), 1500);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      
      if (err.name === 'AuthRetryableFetchError' || err.message.includes('NetworkError')) {
        setError('لا يمكن الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت أو إعدادات Supabase.');
      } else if (err.message.includes('Invalid login credentials')) {
        setError('بيانات الدخول غير صحيحة');
      } else if (err.message.includes('User already registered') || err.message.includes('already been registered')) {
        setError('هذا الحساب موجود بالفعل. يرجى تسجيل الدخول');
      } else if (err.message.includes('Email not confirmed')) {
        setError('يرجى تأكيد بريدك الإلكتروني أولاً');
      } else {
        setError(err.message || 'حدث خطأ غير متوقع');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setStep('form');
    setError('');
    setSuccessMessage('');
    setVerificationCode('');
    setFormData({ name: '', email: '', password: '' });
  };

  const goBackToForm = () => {
    setStep('form');
    setError('');
    setSuccessMessage('');
    setVerificationCode('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f9fb] via-[#f4f7fb] to-[#ffffff] dark:from-gray-900 dark:via-slate-900 dark:to-slate-800 overflow-hidden relative">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 166, 0, 0.27) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 166, 0, 0.29) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          animation: 'float 20s ease-in-out infinite'
        }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400/30 dark:bg-orange-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Enhanced Decorative Elements */}
      <div className="absolute top-10 sm:top-20 left-5 sm:left-20 w-32 h-32 sm:w-72 sm:h-72 bg-gradient-to-br dark:from-orange-500/20 dark:to-orange-600/20 from-orange-400/15 to-orange-500/15 rounded-full blur-2xl sm:blur-3xl animate-pulse transition-all duration-500"></div>
      <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-20 w-40 h-40 sm:w-96 sm:h-96 bg-gradient-to-br dark:from-blue-500/10 dark:to-slate-700/10 from-blue-400/8 to-blue-500/8 rounded-full blur-2xl sm:blur-3xl transition-all duration-500"></div>
      <div className="absolute top-1/2 right-2 sm:right-10 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br dark:from-orange-400/10 from-orange-400/12 to-transparent rounded-full blur-xl sm:blur-2xl animate-bounce transition-all duration-500" style={{animationDuration: '3s'}}></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl">
          {/* Back Button */}
          <button
            onClick={step === 'verify' || step === 'forgot-password' ? goBackToForm : onBack}
            className={`mb-6 flex items-center space-x-2 space-x-reverse text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 group ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">
              {step === 'verify' || step === 'forgot-password' ? 'العودة للنموذج' : 'العودة للرئيسية'}
            </span>
          </button>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Benefits Section - مخفية في خطوة التحقق */}
            {step === 'form' && (
              <div className={`space-y-6 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* Header */}
                <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden mb-8">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                      <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/20 backdrop-blur-sm mb-4 group transition-all duration-500">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full ml-2 sm:ml-4 animate-pulse"></div>
                        <span className="text-xs sm:text-sm font-medium text-white transition-colors duration-500">
                          فوائد التسجيل
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold mb-2 text-white">
                        في ماذا سيفيدك{' '}
                        <span className="text-orange-200">
                          التسجيل؟
                        </span>
                      </h2>
                      <p className="text-orange-100">
                        انضم إلى آلاف القراء واستمتع بمزايا حصرية
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefits Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className={`bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/50 hover:border-orange-300 dark:hover:border-orange-400/50 transition-all duration-500 hover:scale-105 hover:shadow-xl group ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                      style={{ transitionDelay: `${400 + index * 100}ms` }}
                    >
                      <div className="flex items-start space-x-4 space-x-reverse">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <benefit.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg dark:text-white text-[#1d2d50] mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                            {benefit.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Auth Form */}
            <div className={`transition-all duration-1000 delay-600 ${step === 'verify' || step === 'forgot-password' ? 'lg:col-span-2 max-w-md mx-auto' : ''} ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      {step === 'verify' ? (
                        <KeyRound className="h-10 w-10 text-white" />
                      ) : step === 'forgot-password' ? (
                        <Mail className="h-10 w-10 text-white" />
                      ) : mode === 'signin' ? (
                        <Shield className="h-10 w-10 text-white" />
                      ) : (
                        <User className="h-10 w-10 text-white" />
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {step === 'verify' 
                        ? 'تأكيد البريد الإلكتروني'
                        : step === 'forgot-password'
                          ? 'تحقق من بريدك'
                          : mode === 'signin' 
                            ? 'تسجيل الدخول' 
                            : 'إنشاء حساب جديد'
                      }
                    </h1>
                    <p className="text-orange-100">
                      {step === 'verify'
                        ? `أدخل الكود المرسل إلى ${formData.email}`
                        : step === 'forgot-password'
                          ? 'تم إرسال رابط إعادة التعيين إلى بريدك'
                          : mode === 'signin' 
                            ? 'أدخل بياناتك لتسجيل الدخول'
                            : 'انضم إلينا واستمتع بمزايا عضوية مميزة'
                      }
                    </p>
                  </div>
                </div>

                {/* Form Content */}
                <div className="px-8 py-8">
                  {step === 'forgot-password' ? (
                    /* Forgot Password Success Message */
                    <div className="space-y-6">
                      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
                          تم إرسال الرابط بنجاح
                        </h3>
                        <p className="text-green-600 dark:text-green-400 text-sm">
                          تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور
                        </p>
                      </div>
                      <button
                        onClick={goBackToForm}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300"
                      >
                        العودة لتسجيل الدخول
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {step === 'form' ? (
                        <>
                          {/* Name Field (only for signup) */}
                          {mode === 'signup' && (
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                الاسم الكامل
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  id="name"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-4 pr-12 bg-white/50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-right placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-sm"
                                  placeholder="أدخل اسمك الكامل"
                                  disabled={isLoading}
                                />
                                <User className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              </div>
                            </div>
                          )}

                          {/* Email Field */}
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                              البريد الإلكتروني
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-4 pr-12 bg-white/50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-right placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-sm"
                                placeholder="example@email.com"
                                disabled={isLoading}
                              />
                              <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                          </div>

                          {/* Password Field */}
                          <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                              كلمة المرور
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-4 pr-12 pl-12 bg-white/50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-right placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-sm"
                                placeholder="أدخل كلمة المرور"
                                disabled={isLoading}
                                minLength={6}
                              />
                              <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                            
                            {/* Password Warning */}
                            <div className="mt-2 flex items-start space-x-2 space-x-reverse bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-lg p-3">
                              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                                <strong>تنبيه مهم:</strong> احفظ كلمة المرور في مكان آمن. لن تتمكن من تغييرها لاحقاً
                              </p>
                            </div>
                          </div>

                          {/* Forgot Password Link - Only in signin mode */}
                          {mode === 'signin' && (
                          <div className="text-left">
                            <button
                              type="button"
                              onClick={handleForgotPassword}
                              disabled={isLoading || forgotPasswordCooldown > 0}
                              className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium transition-colors duration-200 disabled:opacity-50 hover:underline disabled:cursor-not-allowed"
                            >
                              {forgotPasswordCooldown > 0 
                                ? `انتظر ${forgotPasswordCooldown} ثانية`
                                : 'نسيت كلمة المرور؟'
                              }
                            </button>
                          </div>
                        )}
                        </>
                      ) : (
                        /* Verification Code Field */
                        <div>
                          <label htmlFor="verificationCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            كود التحقق (6 أرقام)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="verificationCode"
                              value={verificationCode}
                              onChange={handleVerificationCodeChange}
                              className="w-full px-4 py-6 pr-12 bg-white/50 dark:bg-slate-700/50 border-2 border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-center text-2xl font-mono tracking-widest placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-sm"
                              placeholder="000000"
                              disabled={isLoading}
                              maxLength={6}
                            />
                            <KeyRound className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                          </div>
                          <div className="mt-4 text-center">
                            <button
                              type="button"
                              onClick={handleResendCode}
                              disabled={resendCooldown > 0 || isLoading}
                              className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium transition-colors duration-200 disabled:opacity-50 hover:underline"
                            >
                              {resendCooldown > 0 
                                ? `إعادة الإرسال خلال ${resendCooldown} ثانية`
                                : 'إعادة إرسال الكود'
                              }
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Error Message */}
                      {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300 text-sm backdrop-blur-sm flex items-start space-x-3 space-x-reverse">
                          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium mb-1">خطأ في العملية</p>
                            <p>{error}</p>
                          </div>
                        </div>
                      )}

                      {/* Success Message */}
                      {successMessage && (
                        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-green-700 dark:text-green-300 text-sm backdrop-blur-sm flex items-center space-x-3 space-x-reverse">
                          <CheckCircle className="h-5 w-5 flex-shrink-0" />
                          <p>{successMessage}</p>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading || (step === 'verify' && verificationCode.length !== 6)}
                        className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 disabled:from-orange-400 disabled:via-orange-400 disabled:to-orange-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 space-x-reverse shadow-lg hover:shadow-xl hover:shadow-orange-500/25 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                        {isLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin relative z-10" />
                            <span className="relative z-10">
                              {step === 'verify' 
                                ? 'جاري التحقق...'
                                : mode === 'signin' 
                                  ? 'جاري تسجيل الدخول...' 
                                  : 'جاري إنشاء الحساب...'
                              }
                            </span>
                          </>
                        ) : (
                          <>
                            {step === 'verify' ? (
                              <CheckCircle className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                            ) : mode === 'signin' ? (
                              <Shield className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                            ) : (
                              <User className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                            )}
                            <span className="relative z-10">
                              {step === 'verify' 
                                ? 'تأكيد الكود'
                                : mode === 'signin' 
                                  ? 'تسجيل الدخول' 
                                  : 'إنشاء حساب جديد'
                              }
                            </span>
                            {step === 'verify' && (
                              <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                            )}
                          </>
                        )}
                        <div className="absolute top-0 left-0 w-full h-full bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700"></div>
                      </button>

                      {/* Mode Switch - مخفي في خطوة التحقق */}
                      {step === 'form' && (
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={switchMode}
                            disabled={isLoading}
                            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium transition-colors duration-200 disabled:opacity-50 hover:underline"
                          >
                            {mode === 'signin' 
                              ? 'ليس لديك حساب؟ إنشاء حساب جديد'
                              : 'لديك حساب بالفعل؟ تسجيل الدخول'
                            }
                          </button>
                        </div>
                      )}
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(1deg); }
          }
          
          @media (max-width: 640px) {
            button {
              min-height: 44px;
              min-width: 44px;
            }
          }
        `
      }} />
    </div>
  );
};

export default LoginPage;