import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Landmark,
  ArrowRight,
  Chrome,
  User,

  Loader2,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Email Auth State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Mobile Auth State
  const [authMethod, setAuthMethod] = useState<"email" | "mobile">("email");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  // General State
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, signInWithMobileMock } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTermsAccepted) {
      toast({
        title: "Terms required",
        description: "Please accept the terms and conditions to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (authMethod === "mobile") {
        // Mobile Auth Flow
        if (!showOtpInput) {
          // Request OTP
          if (mobileNumber.length < 10) {
            toast({ title: "Invalid number", description: "Please enter a valid mobile number", variant: "destructive" });
            setIsLoading(false);
            return;
          }
          // Simulate sending OTP
          await new Promise(resolve => setTimeout(resolve, 1000));
          setShowOtpInput(true);
          toast({
            title: "OTP Sent",
            description: "Use code 1234 for testing purposes.",
          });
          setIsLoading(false);
        } else {
          // Verify OTP
          const { error } = await signInWithMobileMock(mobileNumber, otp);
          if (error) {
            toast({ title: "Verification failed", description: error.message, variant: "destructive" });
          } else {
            toast({ title: "Success", description: "Mobile verification successful!" });
            navigate("/");
          }
        }
        return;
      }

      // Email Auth Flow
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "Redirecting to your dashboard...",
          });
          navigate("/");
        }
      } else {
        if (!fullName.trim()) {
          toast({
            title: "Name required",
            description: "Please enter your full name",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: "Signup failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Google login failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
    // If successful, user will be redirected by Supabase
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sidebar via-background to-sidebar p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-info/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img src="/finsage_logo.jpg" alt="FinSage" className="w-10 h-10 rounded-xl object-contain bg-black" />
            <div>
              <span className="text-xl font-bold">FinSage</span>
              <span className="text-xl text-muted-foreground ml-1">AI</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Your AI-powered
            <span className="text-gradient"> financial intelligence </span>
            platform
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Make smarter financial decisions with real-time insights,
            credit optimization, and personalized recommendations.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-4 pt-6">
            {[
              "Unified Dashboard",
              "Credit Optimization",
              "AI Insights",
              "Investment Intelligence",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-muted-foreground">
            Trusted by 50,000+ users worldwide
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/finsage_logo.jpg" alt="FinSage" className="w-10 h-10 rounded-xl object-contain bg-black" />
            <div>
              <span className="text-xl font-bold">FinSage</span>
              <span className="text-xl text-muted-foreground ml-1">AI</span>
            </div>
          </div>

          <Card className="border-border/50 shadow-2xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                {isLogin ? "Welcome back" : "Create an account"}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? "Enter your credentials to access your account"
                  : "Get started with your financial journey"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="email" value={authMethod} onValueChange={(v) => setAuthMethod(v as "email" | "mobile")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="mobile">Mobile Number</TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <TabsContent value="email" className="space-y-4 mt-0">
                    {!isLogin && (
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-10"
                            required={!isLogin && authMethod === 'email'}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required={authMethod === 'email'}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required={authMethod === 'email'}
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="mobile" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label>Mobile Number</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="pl-10"
                          disabled={showOtpInput}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        We'll send you a verification code.
                      </p>
                    </div>

                    {showOtpInput && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <Label>Verification Code</Label>
                        <div className="relative">
                          <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                          <Input
                            type="text"
                            placeholder="1234"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="pl-10 tracking-widest"
                            maxLength={4}
                          />
                        </div>
                        <p className="text-xs text-blue-500 font-medium">
                          Use code 1234 mostly for testing.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Mandatory Terms Checkbox */}
                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={isTermsAccepted}
                      onCheckedChange={(c) => setIsTermsAccepted(!!c)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Required to proceed.
                      </p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading || !isTermsAccepted}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {authMethod === 'mobile'
                          ? (showOtpInput ? "Verify & Login" : "Get OTP")
                          : (isLogin ? "Sign In" : "Create Account")
                        }
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </Tabs>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-11"
                onClick={handleGoogleLogin}
                disabled={isLoading || !isTermsAccepted}
              >
                <Chrome className="w-4 h-4 mr-2" />
                Continue with Google
              </Button>
              {(!isTermsAccepted) && <p className="text-xs text-center text-red-500 mt-1">Accept terms to enable login</p>}

              <p className="text-center text-sm text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}
