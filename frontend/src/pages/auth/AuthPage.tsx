import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, RefreshCw, LogIn, HeartPulse } from "lucide-react";
import { authApi } from "@/lib/auth.api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
  captchaAnswer: z.string().min(1, "Respuesta CAPTCHA requerida"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState<{
    token: string;
    question: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const fetchCaptcha = async () => {
    try {
      const data = await authApi.getCaptcha();
      setCaptcha(data);
    } catch {
      toast.error("Error al cargar CAPTCHA");
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchCaptcha();
    });
  }, []);

  const onSubmit = async (values: LoginForm) => {
    if (!captcha) return;
    setIsLoading(true);
    try {
      const result = await authApi.login({
        email: values.email,
        password: values.password,
        captchaToken: captcha.token,
        captchaAnswer: values.captchaAnswer,
      });
      login(result.accessToken, result.user);
      toast.success(`Bienvenido, ${result.user.name}`);
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { message?: string } } };
      toast.error(axErr.response?.data?.message || "Credenciales inválidas");
      fetchCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decorations matching brand HSL */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Logo and Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-teal/10 border border-brand-teal/30 mb-4 shadow-lg shadow-brand-teal/5 relative group">
            <HeartPulse className="w-10 h-10 text-brand-teal group-hover:text-brand-orange transition-colors duration-500" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-orange"></span>
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center justify-center gap-1.5">
            <span className="text-brand-teal">CEM</span>
            <span className="text-slate-100">EDICA</span>
          </h1>
          <p className="text-brand-orange/90 font-medium mt-1 text-sm tracking-wide">
            Diagnóstico y Tratamiento Médico
          </p>
        </div>

        <Card className="card-premium relative overflow-hidden">
          {/* Signature pulse line at top of card */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-brand-teal to-brand-orange shadow-[0_1px_8px_var(--brand-teal)]" />

          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-white text-xl">Iniciar sesión</CardTitle>
            <CardDescription className="text-muted-foreground">
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-slate-300 text-sm font-medium"
                >
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="doctor@cemedica.bo"
                  {...register("email")}
                  className="bg-background/80 border-border text-white placeholder:text-muted-foreground focus-visible:border-brand-teal focus-visible:ring-brand-teal/20"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-red-400 text-xs mt-1"
                    role="alert"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-slate-300 text-sm font-medium"
                >
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="bg-background/80 border-border text-white placeholder:text-muted-foreground focus-visible:border-brand-teal focus-visible:ring-brand-teal/20 pr-10"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="text-red-400 text-xs mt-1"
                    role="alert"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* CAPTCHA */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="captchaAnswer"
                    className="text-slate-300 text-sm font-medium"
                  >
                    Verificación
                  </Label>
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    className="flex items-center gap-1 text-xs text-brand-teal hover:text-brand-orange transition-colors"
                    aria-label="Regenerar CAPTCHA"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Nueva pregunta
                  </button>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center px-4 py-2.5 rounded-lg bg-brand-teal-dark/15 border border-brand-teal/20 text-brand-teal font-mono text-sm font-semibold select-none">
                    {captcha ? captcha.question : "Cargando..."}
                  </div>
                  <Input
                    id="captchaAnswer"
                    type="number"
                    placeholder="="
                    {...register("captchaAnswer")}
                    className="w-20 bg-background/80 border-border text-white placeholder:text-muted-foreground focus-visible:border-brand-teal text-center"
                    aria-invalid={!!errors.captchaAnswer}
                    aria-describedby={
                      errors.captchaAnswer ? "captcha-error" : undefined
                    }
                    aria-label="Respuesta al CAPTCHA matemático"
                  />
                </div>
                {errors.captchaAnswer && (
                  <p
                    id="captcha-error"
                    className="text-red-400 text-xs mt-1"
                    role="alert"
                  >
                    {errors.captchaAnswer.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                id="login-submit"
                disabled={isLoading || !captcha}
                className="w-full bg-brand-teal hover:bg-brand-teal/85 active:bg-brand-teal-dark text-white font-semibold h-11 transition-all duration-200 shadow-lg shadow-brand-teal/10 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Ingresando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Ingresar al sistema
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground/60 text-xs mt-6">
          © {new Date().getFullYear()} CEMEDICA — Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
