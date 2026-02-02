import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    global: {
        headers: { 'x-application-name': 'finsage-ai' }
    }
});

// Database types
export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    annual_income: number | null;
    monthly_income: number | null;
    currency_preference: 'USD' | 'INR';
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    source: 'manual' | 'csv_upload' | 'pdf_upload';
    created_at: string;
}

export interface BankStatement {
    id: string;
    user_id: string;
    file_name: string;
    file_url: string;
    file_type: 'pdf' | 'csv';
    upload_date: string;
    processed: boolean;
    transactions_extracted: number;
}

export interface Budget {
    id: string;
    user_id: string;
    category: string;
    budget_amount: number;
    month: string;
    created_at: string;
}

export interface Goal {
    id: string;
    user_id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    deadline: string | null;
    status: 'active' | 'completed' | 'cancelled';
    created_at: string;
}
