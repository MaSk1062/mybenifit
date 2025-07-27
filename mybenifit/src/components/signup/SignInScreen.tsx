import React from "react"
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { useState } from "react"
import { auth } from "../../firebase.ts"
import { useNavigate, Link } from "react-router-dom" // Corrected import for react-router-dom

import homeImage from "../../assets/mybenyfitImage.jpeg"

// Utility function for class names
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// UI Components (inline definitions to avoid import issues)
// These are kept minimal as per your original request, assuming they are simplified shadcn components.
// In a real shadcn setup, you would import them directly.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variantClasses = {
    default: "bg-black text-white hover:bg-gray-800", // Adjusted for black background, white text
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-blue-600 underline-offset-4 hover:underline",
  };
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return (
    <button
      className={cn(baseClasses, variantClasses[variant || 'default'], sizeClasses[size || 'default'], className)}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
    {...props}
  />
));
Label.displayName = "Label";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)} // Changed shadow to shadow-sm for a softer look
    {...props}
  />
));
Card.displayName = "Card";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} /> // Adjusted default padding
));
CardContent.displayName = "CardContent";

// --- LoginForm Component ---
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // State to handle errors

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/my-activity"); // Navigating to /my-activity after successful signup
    } catch (err: any) {
      console.error("Error signing up:", err);
      setError(err.message || "Failed to create account. Please try again.");
    }
  };

  const handleGoogleSignup = async () => {
    setError(null); // Clear previous errors
    try {
      await signInWithPopup(auth, provider);
      navigate("/my-activity"); // Navigating to /my-activity after successful Google signup
    } catch (err: any) {
      console.error("Error signing up with Google:", err);
      setError(err.message || "Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Left Section: Form */}
          <form className="p-6 md:p-8 flex flex-col justify-center" onSubmit={handleSignup}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-3xl font-extrabold text-black mb-2">MyBenYfit</h1>
                <p className="text-muted-foreground text-balance text-gray-600">
                  Create a MyBenYfit account
                </p>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  className="border-gray-300 focus:border-black focus:ring-black"
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {/* Changed to Link for internal navigation, if you have a forgot password page */}
                  <Link
                    to="/forgot-password" // Assuming a route for forgot password
                    className="ml-auto text-sm text-blue-600 underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="border-gray-300 focus:border-black focus:ring-black"
                />
              </div>

              <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
                Signup
              </Button>

              <div className="relative flex items-center justify-center text-xs">
                <span className="absolute left-0 w-full border-t border-gray-300"></span>
                <span className="bg-white text-muted-foreground relative z-10 px-2 text-gray-500">
                  Or continue with
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                
                <Button variant="outline" type="button" className="w-full cursor-pointer" onClick={handleGoogleSignup} aria-label="Sign up with Google">
                <svg 
                    className="w-5 h-5" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M22.54 12.28c0-.77-.07-1.46-.19-2.05H12.48v3.89h5.6c-.24 1.28-.95 2.37-2.09 3.16-.94.67-2.14 1.07-3.48 1.07-2.6 0-4.83-1.6-5.6-3.89-.25-.7-.4-1.47-.4-2.28s.15-1.58.4-2.28c.77-2.29 2.99-3.89 5.6-3.89 1.44 0 2.7.53 3.7 1.48l2.76-2.76C18.75 1.44 16.13 0 12.48 0 5.86 0 .3 5.38.3 12s5.56 12 12.17 12c3.57 0 6.27-1.17 8.37-3.36 2.16-2.16 2.84-5.21 2.84-7.66v-.01z"/>
                  </svg>
                  <span className="sr-only">Sign up with Google</span>
                </Button>
                
              </div>
              
              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-black underline hover:text-gray-700">
                  Sign in here
                </Link>
              </div>
            </div>
          </form>

          {/* Right Section: Image */}
          <div className="relative hidden md:block min-h-[300px]"> {/* Added min-h to ensure image visibility */}
            <img
              src={homeImage}
              alt="Fitness Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
            {/* Optional: Add an overlay or text on the image */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-2xl font-bold">
                MyBenYfit Journey
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance text-gray-500">
        By clicking continue, you agree to our <Link to="/terms" className="text-blue-600 underline hover:text-blue-800">Terms of Service</Link>{" "}
        and <Link to="/privacy" className="text-blue-600 underline hover:text-blue-800">Privacy Policy</Link>.
      </div>
    </div>
  );
}

// Wrapper component with navigation
function SignInScreen() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
     {/*  <NavBar /> */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8"> {/* Responsive padding */}
        <div className="w-full max-w-lg md:max-w-4xl"> {/* Adjusted max-width for better responsiveness */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

// Default export for the component
export default SignInScreen;