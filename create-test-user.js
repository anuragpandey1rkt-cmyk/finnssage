// Script to create a test user in Supabase
// Run with: node create-test-user.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mgqxqiokjraphexduzqd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ncXhxaW9ranJhcGhleGR1enFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NzI2MTYsImV4cCI6MjA4NTQ0ODYxNn0.3j441X6EJFxWPICh9H59DW4ypEhf9lr8ShdB1aqBzL0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
    console.log('Creating test user...');

    const testEmail = 'test@demo.com';
    const testPassword = 'Test123456';

    try {
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    full_name: 'Test User'
                },
                emailRedirectTo: undefined
            }
        });

        if (error) {
            console.error('Error creating user:', error.message);

            // Try to sign in if user already exists
            if (error.message.includes('already registered')) {
                console.log('\nUser already exists! You can login with:');
                console.log('Email:', testEmail);
                console.log('Password:', testPassword);
                return;
            }
        } else {
            console.log('\n✅ Test user created successfully!');
            console.log('\nLogin credentials:');
            console.log('Email:', testEmail);
            console.log('Password:', testPassword);

            if (data.user && !data.session) {
                console.log('\n⚠️  Email confirmation may be required.');
                console.log('Check your Supabase dashboard to confirm the user:');
                console.log('https://supabase.com/dashboard/project/mgqxqiokjraphexduzqd/auth/users');
            }
        }
    } catch (err) {
        console.error('Exception:', err);
    }
}

createTestUser();
