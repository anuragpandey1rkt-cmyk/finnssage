# Quick Troubleshooting Guide

## For Email Login (test@demo.com / demo123)

1. Open your browser's Developer Console (F12)
2. Go to the Console tab
3. Try logging in with:
   - Email: `test@demo.com`
   - Password: `demo123`
4. Look for messages starting with 🔑, ✅, or ❌
5. Share any error messages you see

## For Mobile OTP Login

1. Enter a mobile number with **at least 10 digits**: `1234567890` or `+11234567890`
2. Click "Get OTP"
3. Enter OTP: `1234`
4. Click "Verify & Login"

## Common Issues

### "Invalid number" error
- Make sure your mobile number has at least 10 digits
- Try: `1234567890`

### Email login not working
- Check the browser console (F12) for error messages
- Look for Supabase connection errors
- The console logs will show exactly what's failing

## What to Check

Open browser console and look for:
- Red error messages
- Messages about Supabase
- Network errors (check Network tab)
- Any authentication-related errors
