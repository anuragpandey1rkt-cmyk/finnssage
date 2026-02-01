import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, Profile } from "@/lib/supabase";

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    isLoading: boolean;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signInWithGoogle: () => Promise<{ error: AuthError | null }>;
    signInWithMobileMock: (phone: string, otp: string) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user profile from database
    const fetchProfile = async (userId: string): Promise<Profile | null> => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) {
                // PGRST116 = no rows returned, which is expected for new users
                if (error.code !== "PGRST116") {
                    console.error("Error fetching profile:", error);
                }
                return null;
            }
            return data as Profile;
        } catch (err) {
            console.error("Exception fetching profile:", err);
            return null;
        }
    };

    // Create profile if it doesn't exist
    const createProfile = async (authUser: User, fullName?: string): Promise<Profile | null> => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .insert({
                    id: authUser.id,
                    email: authUser.email,
                    full_name: fullName || authUser.user_metadata?.full_name || null,
                    currency_preference: "USD",
                    onboarding_completed: false,
                })
                .select()
                .single();

            if (error) {
                console.error("Error creating profile:", error);
                // If insert fails, try fetching again (might be a race condition)
                return await fetchProfile(authUser.id);
            }
            return data as Profile;
        } catch (err) {
            console.error("Exception creating profile:", err);
            return null;
        }
    };

    // Initialize auth state
    const initializeAuth = async () => {
        try {
            // Create a timeout promise that resolves after 3 seconds
            const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3000));

            // Create the session fetch promise
            const sessionPromise = supabase.auth.getSession();

            // Race the session fetch against the timeout
            const result = await Promise.race([
                sessionPromise,
                timeoutPromise.then(() => ({ timeout: true }))
            ]) as any;

            if (result.timeout) {
                console.warn("Auth initialization timed out, proceeding with null session");
                setIsLoading(false);
                return;
            }

            const { data: { session }, error } = result;

            if (error) {
                console.error("Error getting session:", error);
                setIsLoading(false);
                return;
            }

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                // Non-blocking profile fetch
                fetchProfile(session.user.id).then(async (userProfile) => {
                    if (!userProfile) {
                        userProfile = await createProfile(session.user);
                    }
                    setProfile(userProfile);
                });
            }
        } catch (err) {
            console.error("Exception in initializeAuth:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        initializeAuth();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed:", event, session?.user?.email);

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                let userProfile = await fetchProfile(session.user.id);
                if (!userProfile && event === "SIGNED_IN") {
                    userProfile = await createProfile(session.user);
                }
                setProfile(userProfile);
            } else {
                setProfile(null);
            }

            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, fullName: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });
        return { error };
    };

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            setIsLoading(false);
        }
        return { error };
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
        return { error };
    };

    const signInWithMobileMock = async (phone: string, otp: string) => {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (otp === "1234") {
            // Create a consistent dummy email from the phone number
            const dummyEmail = `mobile-${phone.replace(/\D/g, '')}@finsage.demo`;
            const dummyPassword = "mock-password-123"; // In a real mock, we might skip password check or use a known one

            // Try to sign in or sign up this mock user
            let { data, error } = await supabase.auth.signInWithPassword({
                email: dummyEmail,
                password: dummyPassword
            });

            if (error) {
                // If sign in fails, try to sign up
                const signUpResult = await supabase.auth.signUp({
                    email: dummyEmail,
                    password: dummyPassword,
                    options: {
                        data: {
                            full_name: `Mobile User ${phone.slice(-4)}`
                        }
                    }
                });

                if (signUpResult.error) {
                    setIsLoading(false);
                    return { error: signUpResult.error };
                }

                // Sign up successful, now sign in (sometimes needed if auto-sign-in disabled)
                if (!signUpResult.data.session) {
                    const signInRetry = await supabase.auth.signInWithPassword({
                        email: dummyEmail,
                        password: dummyPassword
                    });
                    if (signInRetry.error) {
                        setIsLoading(false);
                        return { error: signInRetry.error };
                    }
                }
            }

            setIsLoading(false);
            return { error: null };
        } else {
            setIsLoading(false);
            return { error: new AuthError("Invalid OTP", 400) };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) return { error: new Error("No user logged in") };

        const { error } = await supabase
            .from("profiles")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", user.id);

        if (!error) {
            setProfile((prev) => (prev ? { ...prev, ...updates } : null));
        }

        return { error: error ? new Error(error.message) : null };
    };

    // Refresh profile from database
    const refreshProfile = async () => {
        if (!user) return;
        const updatedProfile = await fetchProfile(user.id);
        if (updatedProfile) {
            setProfile(updatedProfile);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                isLoading,
                signUp,
                signIn,
                signInWithGoogle,
                signInWithMobileMock,
                signOut,
                updateProfile,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
